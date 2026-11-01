/**
 * Session utility to safely clear auth session without destroying business data
 * (panti requests, active claims, surplus listings, cart, etc.)
 */
export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  try {
    const authKeys = [
      'replate_onboarding_profile',
      'replate_registered_user',
      'replate_is_fresh_account',
      'replate_consumer_verification_status',
      'nextauth.message',
    ];
    authKeys.forEach((key) => localStorage.removeItem(key));

    // Clear session cookies
    document.cookie = 'replate_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'replate_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  } catch (_) {}
}

