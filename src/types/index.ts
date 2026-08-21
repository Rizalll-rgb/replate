import type { UserRole, UserStatus, FoodCategory, StorageCondition, PackagingType, SurplusStatus, DistributionType, ClaimStatus, PaymentStatus, RescueStatus, MatchType, TrackingStatus, NotificationType, QRType } from '@prisma/client';

// ============================================
// USER TYPES
// ============================================

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    phone?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    city?: string | null;
    organizationType?: string | null;
    organizationName?: string | null;
    profileImage?: string | null;
    bio?: string | null;
    createdAt: Date;
}

// ============================================
// SURPLUS FOOD TYPES
// ============================================

export interface SurplusFoodItem {
    id: string;
    providerId: string;
    foodName: string;
    description?: string | null;
    foodCategory: FoodCategory;
    quantity: number;
    quantityUnit: string;
    productionDate?: Date | null;
    expiryDate?: Date | null;
    pickupDeadline: Date;
    storageCondition: StorageCondition;
    packagingType: PackagingType;
    photos: string[];
    latitude: number;
    longitude: number;
    address: string;
    status: SurplusStatus;
    distributionType: DistributionType;
    price?: number | null;
    remainingQuantity: number;
    rescueReadiness?: RescueReadinessData | null;
    weightPerUnitKg: number;
    notes?: string | null;
    createdAt: Date;
    provider?: UserProfile;
}

export interface RescueReadinessData {
    infoComplete: boolean;
    notExpired: boolean;
    storageProper: boolean;
    packagingIntact: boolean;
    noSpoilage: boolean;
    photoClear: boolean;
    pickupRealistic: boolean;
    locationAccurate: boolean;
}

// ============================================
// CLAIM TYPES
// ============================================

export interface FoodClaimData {
    id: string;
    claimCode: string;
    foodId: string;
    consumerId: string;
    quantity: number;
    status: ClaimStatus;
    paymentStatus: PaymentStatus;
    qrCodeData?: string | null;
    claimedAt: Date;
    pickedUpAt?: Date | null;
    notes?: string | null;
    food?: SurplusFoodItem;
    consumer?: UserProfile;
}

// ============================================
// RESCUE TYPES
// ============================================

export interface RescueRequestData {
    id: string;
    rescueCode: string;
    foodId: string;
    partnerId: string;
    quantity: number;
    status: RescueStatus;
    safetyChecklist?: SafetyChecklistData | null;
    qrCodeData?: string | null;
    notes?: string | null;
    rejectionReason?: string | null;
    requestedAt: Date;
    completedAt?: Date | null;
    food?: SurplusFoodItem;
    partner?: UserProfile;
}

export interface SafetyChecklistData {
    packagingIntact: boolean;
    temperatureProper: boolean;
    noSpoilageSign: boolean;
    quantityMatch: boolean;
    withinExpiry: boolean;
    additionalNotes?: string;
    photoVerification?: string;
    overallResult: 'PASS' | 'FAIL';
}

// ============================================
// MATCHING TYPES
// ============================================

export interface MatchResultData {
    id: string;
    foodId: string;
    matchedUserId: string;
    score: number;
    scoreBreakdown: ScoreBreakdownData;
    matchType: MatchType;
    createdAt: Date;
    food?: SurplusFoodItem;
    matchedUser?: UserProfile;
}

export interface ScoreBreakdownData {
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
// TRACKING TYPES
// ============================================

export interface TrackingEntry {
    id: string;
    referenceId: string;
    referenceType: 'CLAIM' | 'RESCUE';
    status: TrackingStatus;
    description: string;
    updatedById?: string | null;
    timestamp: Date;
    updatedBy?: UserProfile | null;
}

// ============================================
// IMPACT TYPES
// ============================================

export interface ImpactSummary {
    totalFoodSaved: number;
    totalCO2Saved: number;
    totalPeopleFed: number;
    totalProviders: number;
    totalPartners: number;
    totalTransactions: number;
    weeklyTrend: { date: string; foodSaved: number; co2Saved: number }[];
    categoryBreakdown: { category: string; count: number; weight: number }[];
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
    totalItems: number;
    activeItems: number;
    completedItems: number;
    pendingItems: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
