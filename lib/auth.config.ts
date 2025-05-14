import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/schemas/auth";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export default {
    pages: {
        signIn: "/login",
        error: "/login",
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
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // check info user 
                const validatedFields = loginSchema.safeParse(credentials);

                if (!validatedFields.success) {
                    return null;
                }

                const { email, password } = validatedFields.data;

                // find user by email
                const user = await prisma.user.findUnique({
                    where: { email }
                });

                if (!user?.password) {
                    return null;
                }

                // check email verified
                if (!user.emailVerified) {
                    throw new Error("EmailNotVerified");
                }

                // check password
                const passwordMatch = await compare(
                    password,
                    user.password
                );

                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            // Allow login via OAuth without requiring email verification
            if (account?.provider !== "credentials") return true;

            // Prevent users from logging in if their email is not verified
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email! }
            });

            return !!(existingUser?.emailVerified);
        },
        session: async ({ session, token }) => {
            if (session.user) {
                session.user.name = token.name ?? "";
                session.user.email = token.email ?? "";
                session.user.image = token.picture ?? "";
                session.user.role = token.role as Role;
                session.user.id = token.sub as string;
                session.user.createdAt = token.createdAt as Date;
            }
            return session;
        },
        jwt: async ({ token, user }) => {
            if (user) {
                token.name = user.name ?? "";
                token.email = user.email ?? "";
                token.picture = user.image ?? "";
                token.role = user.role ?? Role.USER;
            }
            return token;
        },
        // authorized({ auth, request: { nextUrl } }) {
        //     const isLoggedIn = auth?.user.role === Role.ADMIN;
        //     const isOnDashboard = nextUrl.pathname.startsWith('/admin');
        //     if (isOnDashboard) {
        //         if (isLoggedIn) return true;
        //         return false;
        //     } else if (isLoggedIn) {
        //         return Response.redirect(new URL('/admin', nextUrl));
        //     }
        //     return true;
        // },
    },
} satisfies NextAuthConfig;