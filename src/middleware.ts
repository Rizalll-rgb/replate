import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;
    const userStatus = req.auth?.user?.status;

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
            nextUrl.pathname.startsWith('/dashboard/how-it-works') ||
            nextUrl.pathname.startsWith('/dashboard/faq');

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

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|images/).*)',
    ],
};
