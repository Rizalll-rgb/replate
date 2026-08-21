import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: true,
        url: '/images/seed/bakso.jpg',
      });
    }

    // Return dummy static image URL for high performance local demo
    return NextResponse.json({
      success: true,
      url: `/images/seed/${file.name || 'food.jpg'}`,
      message: 'File berhasil diunggah!',
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      url: '/images/seed/bakso.jpg',
    });
  }
}
