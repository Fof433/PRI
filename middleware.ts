import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // We extract the pathname from the requested URL
    const { pathname } = request.nextUrl;

    // 1. Keep the /maintenance route accessible
    if (pathname === '/maintenance') {
        return NextResponse.next();
    }

    // 2. Block all other routes with a 503 and custom message
    return new NextResponse('Site temporarily unavailable for maintenance.', {
        status: 503,
        headers: {
            // 3. Retry-After set to 2592000 seconds (30 days) to preserve SEO
            'Retry-After': '2592000',
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}

// 4. Proper matcher configuration
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (public images directory)
         * 
         * We don't exclude /maintenance here so the middleware still executes and
         * explicitly allows it via the NextResponse.next() logic above.
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    ],
};
