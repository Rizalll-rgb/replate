import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { UserRole, UserStatus } from '@prisma/client';

declare module 'next-auth' {
    interface User {
        role: UserRole;
        status: UserStatus;
    }
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
            status: UserStatus;
            image?: string | null;
        };
    }
}

declare module '@auth/core/jwt' {
    interface JWT {
        role: UserRole;
        status: UserStatus;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'replate-secret-key-change-in-production-2026',
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email dan password wajib diisi');
                }

                const emailInput = (credentials.email as string).trim().toLowerCase();
                const altEmail = emailInput.includes('@replate.id')
                    ? emailInput.replace('@replate.id', '@foodbridge.id')
                    : emailInput.replace('@foodbridge.id', '@replate.id');

                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: emailInput },
                            { email: altEmail },
                        ],
                    },
                });

                if (!user) {
                    throw new Error('Email atau password salah');
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error('Email atau password salah');
                }

                if (user.status === 'SUSPENDED') {
                    throw new Error('Akun Anda telah dinonaktifkan');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    image: user.profileImage,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.status = user.status;
            }
            // Allow session update
            if (trigger === 'update' && session) {
                token.name = session.name;
                token.role = session.role;
                token.status = session.status;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub!;
                session.user.role = token.role;
                session.user.status = token.status;
            }
            return session;
        },
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }

            return true;
        },
    },
});
