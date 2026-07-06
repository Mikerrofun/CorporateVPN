import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/register"],
};

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // /admin/login — публичная страница, но залогиненного админа редиректим сразу в панель
  if (pathname === "/admin/login") {
    if (token?.isAdmin) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // /admin/* — только администратор
  if (pathname.startsWith("/admin")) {
    if (!token?.isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // /dashboard/* — только сотрудник с активной группой
  if (pathname.startsWith("/dashboard")) {
    if (!token || token.isAdmin || !token.groupId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // /register — только для незалогиненных сотрудников
  if (pathname === "/register") {
    if (token) {
      const dest = token.isAdmin ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
  }

  return NextResponse.next();
}
