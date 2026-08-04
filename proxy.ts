import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  const hasSession = request.cookies.has('atlas_session');

  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = { matcher: ['/', '/admin/:path*'] };