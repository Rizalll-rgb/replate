import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {
      // Body might be empty
    }

    const { role, email } = body;

    let effectiveRole = role || 'FOOD_CONSUMER';
    if (email) {
      const lower = String(email).toLowerCase();
      if (lower.includes('pak.kumis') || lower.includes('provider') || lower.includes('rotiboy') || lower.includes('majapahit')) {
        effectiveRole = 'FOOD_PROVIDER';
      } else if (lower.includes('panti') || lower.includes('yayasan') || lower.includes('kasih')) {
        effectiveRole = 'FOOD_BENEFICIARY';
      } else if (lower.includes('foodbank') || lower.includes('volunteer') || lower.includes('rescue')) {
        effectiveRole = 'RESCUE_VOLUNTEER';
      } else if (lower.includes('admin')) {
        effectiveRole = 'SUPER_ADMIN';
      } else if (lower.includes('budi') || lower.includes('consumer')) {
        effectiveRole = 'FOOD_CONSUMER';
      }
    }

    let targetUrl = '/dashboard/consumer';
    if (effectiveRole === 'FOOD_PROVIDER' || effectiveRole === 'PROVIDER') {
      targetUrl = '/dashboard/provider';
    } else if (effectiveRole === 'FOOD_BENEFICIARY' || effectiveRole === 'YAYASAN') {
      targetUrl = '/dashboard/yayasan';
    } else if (effectiveRole === 'RESCUE_VOLUNTEER' || effectiveRole === 'RESCUE_PARTNER') {
      targetUrl = '/dashboard/rescue-partner';
    } else if (effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'ADMIN') {
      targetUrl = '/dashboard/admin';
    }

    const res = NextResponse.json({
      success: true,
      role: effectiveRole,
      targetUrl,
    });

    // Set cookies directly via Set-Cookie headers on response
    res.cookies.set('replate_demo_session', effectiveRole, {
      path: '/',
      maxAge: 86400 * 7, // 7 days
      sameSite: 'lax',
      httpOnly: false,
    });

    res.cookies.set('replate_role', effectiveRole, {
      path: '/',
      maxAge: 86400 * 7,
      sameSite: 'lax',
      httpOnly: false,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Gagal menyimpan sesi demo' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/replate_demo_session=([^;]+)/);
  const currentRole = match ? decodeURIComponent(match[1]) : null;

  return NextResponse.json({
    activeDemoSession: currentRole,
    isLoggedIn: !!currentRole,
  });
}
