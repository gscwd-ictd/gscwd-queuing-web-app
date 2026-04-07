import { PrismaAdapter } from '@auth/prisma-adapter';
import {
  AccountStatus as PrismaAccountStatus,
  PrismaClient,
  Role as PrismaRole,
  User as PrismaUser,
  Route as PrismaRoute,
} from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import type { NextAuthOptions } from 'next-auth';
import { addHours } from 'date-fns';

const prisma = new PrismaClient();

type User = PrismaUser & {
  counterId?: string;
};

const SESSION_HOURS = 11;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: SESSION_HOURS * 60 * 60,
    updateAge: 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  events: {
    async signOut({ token }) {
      if (token.id && token.counterId) {
        await prisma.userSession.delete({
          where: { userId: token.id, counterId: token.counterId },
        });
      }
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { label: 'password', type: 'password' },
        counterId: { label: 'counter', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('Email not found. Please check your email.');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Incorrect password. Please try again.');
        }

        if (user.accountStatus !== PrismaAccountStatus.active) {
          throw new Error('Account is inactive. Please contact administrator to gain access.');
        }

        if (credentials.counterId) {
          const counter = await prisma.counter.findUnique({
            where: { id: credentials.counterId },
            include: { userSession: true },
          });

          if (!counter) {
            throw new Error('Counter not found.');
          }

          if (counter.departmentId !== user.departmentId) {
            throw new Error('Counter belongs to a different department.');
          }

          const existingCounterSession = await prisma.userSession.findFirst({
            where: {
              counterId: credentials.counterId,
              expiresAt: { gt: new Date() },
            },
          });

          if (existingCounterSession) {
            const countersInDepartment = await prisma.counter.findMany({
              where: { departmentId: user.departmentId },
              select: { id: true },
            });

            const activeSessions = await prisma.userSession.findMany({
              where: {
                counterId: { in: countersInDepartment.map((c) => c.id) },
                expiresAt: { gt: new Date() },
              },
            });

            const allOccupied = activeSessions.length >= countersInDepartment.length;

            if (!allOccupied) {
              throw new Error('Counter already assigned to another user.');
            }
          }

          await prisma.userSession.create({
            data: {
              userId: user.id,
              counterId: credentials.counterId,
              expiresAt: addHours(new Date(), SESSION_HOURS),
            },
          });
        }

        const primaryUserData = {
          id: user.id,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          email: user.email,
          departmentId: user.departmentId,
          role: user.role,
          imageUrl: user.imageUrl,
          accountStatus: user.accountStatus,
          position: user.position,
          allowedRoutes: user.allowedRoutes,
          startTransactionHotkey: user.startTransactionHotkey,
          transferHotkey: user.transferHotkey,
          completeTransactionHotkey: user.completeTransactionHotkey,
          ringHotkey: user.ringHotkey,
          markAsLapsedHotkey: user.markAsLapsedHotkey,
          nextTicketHotkey: user.nextTicketHotkey,
          nextLapsedTicketHotkey: user.nextLapsedTicketHotkey,
          nextSpecialTicketHotkey: user.nextSpecialTicketHotkey,
          nextLapsedSpecialTicketHotkey: user.nextLapsedSpecialTicketHotkey,
        };

        let counter = null;
        if (credentials.counterId) {
          counter = await prisma.counter.findUnique({
            where: { id: credentials.counterId },
          });
        }

        switch (user.role) {
          case PrismaRole.user:
            return {
              ...primaryUserData,
              counterId: credentials.counterId ?? null,
              assignedTransactionId: credentials.counterId
                ? counter?.transactionId ?? null
                : user.assignedTransactionId ?? null,
            };

          case PrismaRole.superuser:
            return {
              ...primaryUserData,
              counterId: credentials.counterId ?? null,
              assignedTransactionId: credentials.counterId
                ? counter?.transactionId ?? null
                : user.assignedTransactionId ?? null,
            };

          case PrismaRole.admin:
            return primaryUserData;

          case PrismaRole.superadmin:
            return primaryUserData;

          default:
            return primaryUserData;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as User).id;
        token.role = (user as User).role;
        token.firstName = (user as User).firstName;
        token.middleName = (user as User).middleName || '';
        token.lastName = (user as User).lastName;
        token.nameExtension = (user as User).nameExtension || undefined;
        token.email = (user as User).email;
        token.imageUrl = (user as User).imageUrl || '';
        token.position = (user as User).position;
        token.departmentId = (user as User).departmentId || undefined;
        token.assignedTransactionId = (user as User).assignedTransactionId || undefined;
        token.counterId = (user as User).counterId || undefined;
        token.accountStatus = (user as User).accountStatus;
        token.startTransactionHotkey = (user as User).startTransactionHotkey || null;
        token.transferHotkey = (user as User).transferHotkey || null;
        token.completeTransactionHotkey = (user as User).completeTransactionHotkey || null;
        token.ringHotkey = (user as User).ringHotkey || null;
        token.markAsLapsedHotkey = (user as User).markAsLapsedHotkey || null;
        token.nextTicketHotkey = (user as User).nextTicketHotkey || null;
        token.nextLapsedTicketHotkey = (user as User).nextLapsedTicketHotkey || null;
        token.nextSpecialTicketHotkey = (user as User).nextSpecialTicketHotkey || null;
        token.nextLapsedSpecialTicketHotkey = (user as User).nextLapsedSpecialTicketHotkey || null;
        token.allowedRoutes = (user as User).allowedRoutes || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as PrismaRole;
        session.user.allowedRoutes = token.allowedRoutes as PrismaRoute['path'][];
        session.user.firstName = token.firstName as string;
        session.user.middleName = token.middleName as string;
        session.user.lastName = token.lastName as string;
        session.user.nameExtension = token.nameExtension as string;
        session.user.imageUrl = token.imageUrl as string;
        session.user.position = token.position as string;
        session.user.departmentId = token.departmentId as string;
        session.user.assignedTransactionId = token.assignedTransactionId as string;
        session.user.counterId = token.counterId as string;
        session.user.accountStatus = token.accountStatus as PrismaAccountStatus;
        session.user.startTransactionHotkey = token.startTransactionHotkey as string;
        session.user.transferHotkey = token.transferHotkey as string;
        session.user.completeTransactionHotkey = token.completeTransactionHotkey as string;
        session.user.ringHotkey = token.ringHotkey as string;
        session.user.markAsLapsedHotkey = token.markAsLapsedHotkey as string;
        session.user.nextTicketHotkey = token.nextTicketHotkey as string;
        session.user.nextLapsedTicketHotkey = token.nextLapsedTicketHotkey as string;
        session.user.nextSpecialTicketHotkey = token.nextSpecialTicketHotkey as string;
        session.user.nextLapsedSpecialTicketHotkey = token.nextLapsedSpecialTicketHotkey as string;
      }
      return session;
    },
  },
};
