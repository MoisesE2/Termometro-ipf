import type { AdminRole } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  email: string;
  role: AdminRole;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: AdminRole;
};
