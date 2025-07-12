// File: middleware.ts
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAdmin = token?.email === process.env.ADMIN_EMAIL;

    // --- DEBUGGING LOG ---
    // You can check your terminal where `npm run dev` is running to see this output.
    // It helps you see exactly what the middleware is comparing.
    console.log("MIDDLEWARE CHECK:");
    console.log("  - Path:", req.nextUrl.pathname);
    console.log("  - Token Email:", token?.email);
    console.log("  - Admin Email:", process.env.ADMIN_EMAIL);
    console.log("  - Is Admin?", isAdmin);
    // -------------------

    // If the user is trying to access an admin page and is NOT an admin,
    // redirect them to the main dashboard.
    if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Allow the request to proceed if everything is fine
    return NextResponse.next();
  },
  {
    callbacks: {
      // This authorized callback runs first.
      // It ensures the user is logged in before any other checks happen.
      // If it returns false, the user is redirected to the login page.
      authorized: ({ token }) => !!token,
    },
  }
);

// This config specifies which routes the middleware should protect.
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};