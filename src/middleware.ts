import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { nextUrl } = req;
    const queryDemoRole = nextUrl.searchParams.get('demo_role');
    const demoCookieRaw = req.cookies.get('replate_demo_session')?.value || queryDemoRole;
    let demoRole: string | undefined;
    if (demoCookieRaw) {
        const upper = demoCookieRaw.toUpperCase();
        if (upper.includes('CONSUMER')) demoRole = 'CONSUMER';
        else if (upper.includes('PROVIDER')) demoRole = 'PROVIDER';
        else if (upper.includes('YAYASAN') || upper.includes('BENEFICIARY')) demoRole = 'YAYASAN';
        else if (upper.includes('RESCUE') || upper.includes('VOLUNTEER')) demoRole = 'RESCUE_PARTNER';
        else if (upper.includes('ADMIN')) demoRole = 'ADMIN';
        else demoRole = demoCookieRaw;
    }

    const isLoggedIn = !!req.auth || !!demoRole;
    let userRole = req.auth?.user?.role || (demoRole as any);
    if (userRole === 'FOOD_CONSUMER') userRole = 'CONSUMER';
    if (userRole === 'FOOD_PROVIDER') userRole = 'PROVIDER';
    if (userRole === 'FOOD_BENEFICIARY') userRole = 'YAYASAN';
    if (userRole === 'RESCUE_VOLUNTEER') userRole = 'RESCUE_PARTNER';
    if (userRole === 'SUPER_ADMIN') userRole = 'ADMIN';

    const userStatus = req.auth?.user?.status || 'APPROVED';

    // Public routes - always accessible
    const publicRoutes = [
        '/',
        '/login',
        '/register',
        '/about',
        '/info',
        '/explore',
        '/how-it-works',
        '/impact',
        '/faq',
        '/logout',
        '/pending-approval',
        '/account-rejected',
        '/account-suspended',
        '/track-status',
    ];
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isOnboardingRoute = nextUrl.pathname.startsWith('/onboarding');
    const isTrackingRoute = nextUrl.pathname.startsWith('/track/');
    const isApiAuth = nextUrl.pathname.startsWith('/api/auth');
    const isApi = nextUrl.pathname.startsWith('/api/');
    const isStatic = nextUrl.pathname.startsWith('/_next/') || nextUrl.pathname.startsWith('/images/');

    // Always allow static, tracking, onboarding, and auth API routes
    if (isStatic || isTrackingRoute || isApiAuth || isOnboardingRoute || isPublicRoute) {
        return NextResponse.next();
    }

    // Protected dashboard routes
    if (nextUrl.pathname.startsWith('/dashboard')) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', nextUrl));
        }

        // Check if user is approved (except for consumers who auto-approve)
        if (userStatus === 'PENDING' && userRole !== 'CONSUMER') {
            return NextResponse.redirect(new URL('/pending-approval', nextUrl));
        }

        if (userStatus === 'REJECTED') {
            return NextResponse.redirect(new URL('/account-rejected', nextUrl));
        }

        if (userStatus === 'SUSPENDED') {
            return NextResponse.redirect(new URL('/account-suspended', nextUrl));
        }

        // Role-based route protection
        const roleRoutes: Record<string, string> = {
            PROVIDER: '/dashboard/provider',
            CONSUMER: '/dashboard/consumer',
            YAYASAN: '/dashboard/yayasan',
            RESCUE_PARTNER: '/dashboard/rescue-partner',
            ADMIN: '/dashboard/admin',
        };

        // Redirect /dashboard to role-specific dashboard
        if (nextUrl.pathname === '/dashboard') {
            if (userRole && roleRoutes[userRole]) {
                return NextResponse.redirect(new URL(roleRoutes[userRole], nextUrl));
            }
        }

        // Shared dashboard routes accessible to all authenticated roles
        const isSharedDashboardRoute =
            nextUrl.pathname.startsWith('/dashboard/explore') ||
            nextUrl.pathname.startsWith('/dashboard/profile') ||
            nextUrl.pathname.startsWith('/dashboard/info') ||
            nextUrl.pathname.startsWith('/dashboard/cart') ||
            nextUrl.pathname.startsWith('/dashboard/checkout') ||
            nextUrl.pathname.startsWith('/dashboard/how-it-works') ||
            nextUrl.pathname.startsWith('/dashboard/faq') ||
            nextUrl.pathname.startsWith('/dashboard/tracking');

        // Ensure users can only access their role's dashboard (or shared dashboard routes)
        if (userRole && userRole !== 'ADMIN' && !isSharedDashboardRoute) {
            const allowedPath = roleRoutes[userRole];
            if (allowedPath && !nextUrl.pathname.startsWith(allowedPath)) {
                return NextResponse.redirect(new URL(allowedPath, nextUrl));
            }
        }
    }

    // Protect API routes (except auth)
    if (isApi && !isApiAuth) {
        if (!isLoggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    const res = NextResponse.next();
    if (demoRole && !req.cookies.get('replate_demo_session')?.value) {
        res.cookies.set('replate_demo_session', demoRole, {
            path: '/',
            maxAge: 86400 * 7,
            sameSite: 'lax',
        });
        res.cookies.set('replate_role', demoRole, {
            path: '/',
            maxAge: 86400 * 7,
            sameSite: 'lax',
        });
    }
    return res;
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|images/).*)',
    ],
};
