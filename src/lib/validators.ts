import { z } from 'zod';

// ============================================
// AUTH VALIDATORS
// ============================================

export const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string(),
    role: z.enum(['PROVIDER', 'CONSUMER', 'RESCUE_PARTNER']),
    phone: z.string().min(10, 'Nomor telepon minimal 10 digit').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    organizationType: z.string().optional(),
    organizationName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
});

// ============================================
// SURPLUS FOOD VALIDATORS
// ============================================

export const surplusFormSchema = z.object({
    foodName: z.string().min(2, 'Nama makanan minimal 2 karakter').max(200),
    description: z.string().max(1000).optional(),
    foodCategory: z.enum(['MEALS', 'BAKERY', 'PRODUCE', 'DAIRY', 'BEVERAGES', 'SNACKS', 'OTHER']),
    quantity: z.number().positive('Jumlah harus lebih dari 0'),
    quantityUnit: z.string().default('porsi'),
    productionDate: z.string().optional(),
    expiryDate: z.string().optional(),
    pickupDeadline: z.string(),
    storageCondition: z.enum(['ROOM_TEMP', 'REFRIGERATED', 'FROZEN']),
    packagingType: z.enum(['PACKAGED', 'UNPACKAGED', 'PARTIAL']),
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().min(5, 'Alamat minimal 5 karakter'),
    distributionType: z.enum(['SALE', 'FREE', 'BOTH']),
    price: z.number().min(0).optional(),
    weightPerUnitKg: z.number().positive().default(0.5),
    notes: z.string().max(500).optional(),
});

export const rescueReadinessSchema = z.object({
    infoComplete: z.boolean(),
    notExpired: z.boolean(),
    storageProper: z.boolean(),
    packagingIntact: z.boolean(),
    noSpoilage: z.boolean(),
    photoClear: z.boolean(),
    pickupRealistic: z.boolean(),
    locationAccurate: z.boolean(),
});

// ============================================
// CLAIM VALIDATORS
// ============================================

export const claimSchema = z.object({
    foodId: z.string(),
    quantity: z.number().positive('Jumlah harus lebih dari 0'),
    notes: z.string().max(500).optional(),
});

// ============================================
// RESCUE REQUEST VALIDATORS
// ============================================

export const rescueResponseSchema = z.object({
    action: z.enum(['accept', 'reject']),
    notes: z.string().max(500).optional(),
    rejectionReason: z.string().optional(),
});

export const safetyChecklistSchema = z.object({
    packagingIntact: z.boolean(),
    temperatureProper: z.boolean(),
    noSpoilageSign: z.boolean(),
    quantityMatch: z.boolean(),
    withinExpiry: z.boolean(),
    additionalNotes: z.string().max(500).optional(),
    photoVerification: z.string().optional(),
    overallResult: z.enum(['PASS', 'FAIL']),
});

// ============================================
// ADMIN VALIDATORS
// ============================================

export const approvalSchema = z.object({
    userId: z.string(),
    action: z.enum(['approve', 'reject']),
    reason: z.string().max(500).optional(),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SurplusFormInput = z.infer<typeof surplusFormSchema>;
export type RescueReadinessInput = z.infer<typeof rescueReadinessSchema>;
export type ClaimInput = z.infer<typeof claimSchema>;
export type RescueResponseInput = z.infer<typeof rescueResponseSchema>;
export type SafetyChecklistInput = z.infer<typeof safetyChecklistSchema>;
export type ApprovalInput = z.infer<typeof approvalSchema>;
