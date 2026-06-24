export const ACCESS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/** Bonus access granted to BOTH parties when a referred friend signs up. */
export const REFERRAL_BONUS_MS = 3 * 24 * 60 * 60 * 1000;

/** Hard ceiling on accumulated bonus access, to bound referral abuse (a user
 * farming free days with throwaway accounts can't run away unbounded). */
export const MAX_BONUS_ACCESS_MS = 60 * 24 * 60 * 60 * 1000;
