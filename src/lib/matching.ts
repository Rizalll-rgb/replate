import prisma from '@/lib/prisma';
import { calculateDistance } from '@/lib/utils';
import { MATCHING_WEIGHTS, MATCHING_CONFIG } from '@/lib/constants';
import { resolveIndonesianAddress } from '@/lib/geoResolver';
import type { SurplusFood, User } from '@prisma/client';

// ============================================
// TYPES
// ============================================

interface MatchCandidate {
    user: User;
    score: number;
    breakdown: ScoreBreakdown;
}

interface ScoreBreakdown {
    distance: { raw: number; normalized: number; weighted: number };
    urgency: { raw: number; normalized: number; weighted: number };
    foodTypeMatch: { raw: number; normalized: number; weighted: number };
    quantityFit: { raw: number; normalized: number; weighted: number };
    reliabilityScore: { raw: number; normalized: number; weighted: number };
    partnerCapacity: { raw: number; normalized: number; weighted: number };
    routeEfficiency: { raw: number; normalized: number; weighted: number };
    total: number;
}

// ============================================
// SMART MATCHING ENGINE
// ============================================

/**
 * Main matching function — finds best matches for a surplus food item.
 * Runs automatically when a new surplus is posted.
 */
export async function findMatches(food: SurplusFood): Promise<MatchCandidate[]> {
    // Get all potential recipients
    const [consumers, partners] = await Promise.all([
        prisma.user.findMany({
            where: {
                role: 'CONSUMER',
                status: 'APPROVED',
                OR: [
                    { latitude: { not: null }, longitude: { not: null } },
                    { address: { not: null } },
                ],
            },
        }),
        prisma.user.findMany({
            where: {
                role: 'RESCUE_PARTNER',
                status: 'APPROVED',
                OR: [
                    { latitude: { not: null }, longitude: { not: null } },
                    { address: { not: null } },
                ],
            },
        }),
    ]);

    // Score all candidates
    const consumerMatches = await Promise.all(
        consumers.map(async (consumer) => ({
            user: consumer,
            ...(await scoreCandidate(food, consumer, 'CONSUMER')),
        }))
    );

    const partnerMatches = await Promise.all(
        partners.map(async (partner) => ({
            user: partner,
            ...(await scoreCandidate(food, partner, 'RESCUE_PARTNER')),
        }))
    );

    // Combine and filter by minimum score
    const allMatches = [...consumerMatches, ...partnerMatches]
        .filter((m) => m.score >= MATCHING_CONFIG.minScore)
        .sort((a, b) => b.score - a.score);

    return allMatches;
}

/**
 * Find best consumer matches for Rescue Sale (Jalur A)
 */
export async function findConsumerMatches(food: SurplusFood): Promise<MatchCandidate[]> {
    const consumers = await prisma.user.findMany({
        where: {
            role: 'CONSUMER',
            status: 'APPROVED',
            OR: [
                { latitude: { not: null }, longitude: { not: null } },
                { address: { not: null } },
            ],
        },
    });

    const matches = await Promise.all(
        consumers.map(async (consumer) => ({
            user: consumer,
            ...(await scoreCandidate(food, consumer, 'CONSUMER')),
        }))
    );

    return matches
        .filter((m) => m.score >= MATCHING_CONFIG.minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, MATCHING_CONFIG.topMatchCount);
}

/**
 * Find best rescue partner matches for Food Rescue (Jalur B)
 */
export async function findPartnerMatches(food: SurplusFood): Promise<MatchCandidate[]> {
    const partners = await prisma.user.findMany({
        where: {
            role: 'RESCUE_PARTNER',
            status: 'APPROVED',
            OR: [
                { latitude: { not: null }, longitude: { not: null } },
                { address: { not: null } },
            ],
        },
    });

    const matches = await Promise.all(
        partners.map(async (partner) => ({
            user: partner,
            ...(await scoreCandidate(food, partner, 'RESCUE_PARTNER')),
        }))
    );

    return matches
        .filter((m) => m.score >= MATCHING_CONFIG.minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, MATCHING_CONFIG.topPartnerCount);
}

// ============================================
// SCORING FUNCTIONS
// ============================================

async function scoreCandidate(
    food: SurplusFood,
    user: User,
    type: 'CONSUMER' | 'RESCUE_PARTNER'
): Promise<{ score: number; breakdown: ScoreBreakdown }> {
    const distanceScore = calculateDistanceScore(food, user);
    const urgencyScore = calculateUrgencyScore(food);
    const foodTypeScore = await calculateFoodTypeScore(food, user);
    const quantityScore = calculateQuantityFitScore(food, type);
    const reliabilityScore = await calculateReliabilityScore(user);
    const capacityScore = type === 'RESCUE_PARTNER'
        ? await calculatePartnerCapacity(user)
        : { raw: 1, normalized: 1, weighted: MATCHING_WEIGHTS.partnerCapacity };
    const routeScore = await calculateRouteEfficiency(food, user);

    const total =
        distanceScore.weighted +
        urgencyScore.weighted +
        foodTypeScore.weighted +
        quantityScore.weighted +
        reliabilityScore.weighted +
        capacityScore.weighted +
        routeScore.weighted;

    return {
        score: Math.min(total, 1), // Cap at 1.0
        breakdown: {
            distance: distanceScore,
            urgency: urgencyScore,
            foodTypeMatch: foodTypeScore,
            quantityFit: quantityScore,
            reliabilityScore: reliabilityScore,
            partnerCapacity: capacityScore,
            routeEfficiency: routeScore,
            total: Math.min(total, 1),
        },
    };
}

/**
 * Distance Score: Closer = higher score
 * Uses Haversine formula, normalized against max distance
 */
function calculateDistanceScore(food: SurplusFood, user: User) {
    let userLat = user.latitude;
    let userLng = user.longitude;
    let foodLat = food.latitude;
    let foodLng = food.longitude;

    if ((!userLat || !userLng) && user.address) {
        const userGeo = resolveIndonesianAddress(user.address);
        userLat = userGeo.lat;
        userLng = userGeo.lng;
    }

    if ((!foodLat || !foodLng) && (food as any).address) {
        const foodGeo = resolveIndonesianAddress((food as any).address);
        foodLat = foodGeo.lat;
        foodLng = foodGeo.lng;
    }

    if (!userLat || !userLng || !foodLat || !foodLng) {
        return { raw: MATCHING_CONFIG.maxDistanceKm, normalized: 0, weighted: 0 };
    }

    const distance = calculateDistance(
        foodLat,
        foodLng,
        userLat,
        userLng
    );

    const normalized = Math.max(0, 1 - distance / MATCHING_CONFIG.maxDistanceKm);
    return {
        raw: distance,
        normalized,
        weighted: normalized * MATCHING_WEIGHTS.distance,
    };
}

/**
 * Urgency Score: More urgent (closer to deadline) = higher priority
 */
function calculateUrgencyScore(food: SurplusFood) {
    const now = new Date();
    const deadline = new Date(food.pickupDeadline);
    const totalHours = (deadline.getTime() - new Date(food.createdAt).getTime()) / (1000 * 60 * 60);
    const remainingHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (remainingHours <= 0) {
        return { raw: 0, normalized: 0, weighted: 0 };
    }

    // Higher score when closer to deadline (more urgent)
    const urgencyRatio = 1 - (remainingHours / Math.max(totalHours, 1));
    const normalized = Math.min(Math.max(urgencyRatio, 0), 1);

    return {
        raw: remainingHours,
        normalized,
        weighted: normalized * MATCHING_WEIGHTS.urgency,
    };
}

/**
 * Food Type Match: Check if user has previously claimed similar food types
 */
async function calculateFoodTypeScore(food: SurplusFood, user: User) {
    // Check user's claim history for food type preference
    const previousClaims = await prisma.foodClaim.findMany({
        where: {
            consumerId: user.id,
            status: 'PICKED_UP',
        },
        include: {
            food: { select: { foodCategory: true } },
        },
        take: 20,
        orderBy: { claimedAt: 'desc' },
    });

    if (previousClaims.length === 0) {
        // New user — neutral score (give them a fair chance)
        return { raw: 0.5, normalized: 0.5, weighted: 0.5 * MATCHING_WEIGHTS.foodTypeMatch };
    }

    const matchingClaims = previousClaims.filter(
        (c) => c.food.foodCategory === food.foodCategory
    );
    const normalized = matchingClaims.length / previousClaims.length;

    return {
        raw: matchingClaims.length,
        normalized,
        weighted: normalized * MATCHING_WEIGHTS.foodTypeMatch,
    };
}

/**
 * Quantity Fit: How well the available quantity matches typical need
 */
function calculateQuantityFitScore(food: SurplusFood, type: 'CONSUMER' | 'RESCUE_PARTNER') {
    const remaining = food.remainingQuantity;

    if (type === 'CONSUMER') {
        // Consumers typically need 1-5 portions
        const idealRange = { min: 1, max: 5 };
        if (remaining >= idealRange.min && remaining <= idealRange.max) {
            return { raw: remaining, normalized: 1, weighted: MATCHING_WEIGHTS.quantityFit };
        }
        const normalized = remaining < idealRange.min
            ? remaining / idealRange.min
            : Math.max(0, 1 - (remaining - idealRange.max) / 20);
        return { raw: remaining, normalized, weighted: normalized * MATCHING_WEIGHTS.quantityFit };
    } else {
        // Rescue partners prefer larger quantities (5+)
        const normalized = Math.min(remaining / 10, 1);
        return { raw: remaining, normalized, weighted: normalized * MATCHING_WEIGHTS.quantityFit };
    }
}

/**
 * Reliability Score: Based on pickup completion rate
 */
async function calculateReliabilityScore(user: User) {
    const [totalClaims, completedClaims] = await Promise.all([
        prisma.foodClaim.count({
            where: { consumerId: user.id },
        }),
        prisma.foodClaim.count({
            where: { consumerId: user.id, status: 'PICKED_UP' },
        }),
    ]);

    if (totalClaims === 0) {
        // New user — give benefit of the doubt
        return { raw: 0.7, normalized: 0.7, weighted: 0.7 * MATCHING_WEIGHTS.reliabilityScore };
    }

    const normalized = completedClaims / totalClaims;
    return {
        raw: completedClaims,
        normalized,
        weighted: normalized * MATCHING_WEIGHTS.reliabilityScore,
    };
}

/**
 * Partner Capacity: How many active rescues the partner currently has
 */
async function calculatePartnerCapacity(user: User) {
    const activeRescues = await prisma.rescueRequest.count({
        where: {
            partnerId: user.id,
            status: { in: ['ACCEPTED', 'PICKING_UP', 'VERIFYING'] },
        },
    });

    // Fewer active rescues = more capacity = higher score
    const maxCapacity = 5; // Assume max 5 concurrent rescues
    const normalized = Math.max(0, 1 - activeRescues / maxCapacity);

    return {
        raw: activeRescues,
        normalized,
        weighted: normalized * MATCHING_WEIGHTS.partnerCapacity,
    };
}

/**
 * Route Efficiency: Check if there are other pickups nearby
 */
async function calculateRouteEfficiency(food: SurplusFood, user: User) {
    let userLat = user.latitude;
    let userLng = user.longitude;
    if ((!userLat || !userLng) && user.address) {
        const userGeo = resolveIndonesianAddress(user.address);
        userLat = userGeo.lat;
        userLng = userGeo.lng;
    }

    if (!userLat || !userLng) {
        return { raw: 0, normalized: 0.5, weighted: 0.5 * MATCHING_WEIGHTS.routeEfficiency };
    }

    let foodLat = food.latitude;
    let foodLng = food.longitude;
    if ((!foodLat || !foodLng) && (food as any).address) {
        const foodGeo = resolveIndonesianAddress((food as any).address);
        foodLat = foodGeo.lat;
        foodLng = foodGeo.lng;
    }

    if (!foodLat || !foodLng) {
        return { raw: 0, normalized: 0.5, weighted: 0.5 * MATCHING_WEIGHTS.routeEfficiency };
    }

    // Check if there are other available surplus items near this food's location
    const nearbyFoods = await prisma.surplusFood.count({
        where: {
            id: { not: food.id },
            status: 'AVAILABLE',
            latitude: { gte: foodLat - 0.02, lte: foodLat + 0.02 },
            longitude: { gte: foodLng - 0.02, lte: foodLng + 0.02 },
        },
    });

    // More nearby items = better route efficiency for rescue partners
    const normalized = Math.min(nearbyFoods / 3, 1);

    return {
        raw: nearbyFoods,
        normalized,
        weighted: normalized * MATCHING_WEIGHTS.routeEfficiency,
    };
}

/**
 * Save match results to database
 */
export async function saveMatchResults(
    foodId: string,
    matches: MatchCandidate[]
): Promise<void> {
    await prisma.matchResult.createMany({
        data: matches.map((match) => ({
            foodId,
            matchedUserId: match.user.id,
            score: match.score,
            scoreBreakdown: match.breakdown as any,
            matchType: match.user.role === 'CONSUMER' ? ('CONSUMER' as const) : ('RESCUE_PARTNER' as const),
        })),
    });
}

/**
 * Auto-route unclaimed food to rescue partners after timeout
 */
export async function autoRouteToRescue(foodId: string): Promise<void> {
    const food = await prisma.surplusFood.findUnique({
        where: { id: foodId },
    });

    if (!food || food.status !== 'AVAILABLE') return;

    const partnerMatches = await findPartnerMatches(food);

    if (partnerMatches.length > 0) {
        // Create rescue requests for top partners
        for (const match of partnerMatches) {
            await prisma.rescueRequest.create({
                data: {
                    rescueCode: `FR-SBY-${Date.now().toString(36).toUpperCase()}`,
                    foodId: food.id,
                    partnerId: match.user.id,
                    quantity: food.remainingQuantity,
                    status: 'REQUESTED',
                },
            });

            // Notify the partner
            await prisma.notification.create({
                data: {
                    userId: match.user.id,
                    title: 'Permintaan Food Rescue Baru',
                    message: `Ada ${food.foodName} (${food.remainingQuantity} ${food.quantityUnit}) yang membutuhkan rescue. Skor kecocokan: ${(match.score * 100).toFixed(0)}%`,
                    type: 'RESCUE',
                    actionUrl: `/dashboard/rescue-partner/requests`,
                },
            });
        }
    }
}
