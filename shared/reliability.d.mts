import type { VerificationData } from '../src/services/verificationService';

export function calculateReliabilityScore(verification: Partial<VerificationData> | null): number;
export function mergeVerificationRecords(records: VerificationData[]): VerificationData | null;
