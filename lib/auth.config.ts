import type { NextAuthConfig } from 'next-auth';
import { Role } from '@prisma/client';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';

export default {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.name = token.name ?? '';
        session.user.email = token.email ?? '';
        session.user.image = token.picture ?? '';
        session.user.role = token.role as Role;
        session.user.id = token.sub as string;
        session.user.createdAt = token.createdAt as Date;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.name = user.name ?? '';
        token.email = user.email ?? '';
        token.picture = user.image ?? '';
        token.role = user.role ?? Role.USER;
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = auth?.user?.role === Role.ADMIN;
      const isOnDashboard = nextUrl.pathname.startsWith('/admin');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/admin', nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
