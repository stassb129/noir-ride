import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'ru',
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Redirect /admin paths to /ru/admin (admin panel is always in Russian)
  if (pathname.startsWith('/admin')) {
    const newUrl = new URL(`/ru${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }
  
  // Apply intl middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(ru|en)/:path*', '/admin/:path*']
};
