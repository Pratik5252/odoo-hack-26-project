import { prisma } from '../../../lib/prisma';
import { hashPassword } from '../../../utils/password';

/** Strict company match (admin dashboard lists only users in the same company). */
function companyScopeStrict(companyId: string | null) {
  if (!companyId) {
    return { companyId: null };
  }
  return { companyId };
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  managerId?: string | null;
  companyId: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  managerId?: string | null;
}

export class UserService {
  async createUser(input: CreateUserInput) {
    const hashedPassword = await hashPassword(input.password);
    return prisma.user.create({
      data: {
        email: input.email.trim().toLowerCase(),
        name: input.name.trim(),
        password: hashedPassword,
        role: input.role,
        managerId: input.managerId ?? null,
        companyId: input.companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
      },
    });
  }

  /** Verify a manager belongs to the same company (for employee assignment). */
  async findManagerInCompany(managerId: string, companyId: string) {
    return prisma.user.findFirst({
      where: {
        id: managerId,
        role: 'MANAGER',
        companyId,
      },
      select: { id: true },
    });
  }

  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
        createdAt: true,
      },
    });
  }

  async getUsersByRole(role: string) {
    return prisma.user.findMany({
      where: { role: role as 'EMPLOYEE' | 'MANAGER' | 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Managers in the same company as the admin. */
  async getManagersByCompany(companyId: string | null) {
    return prisma.user.findMany({
      where: {
        role: 'MANAGER',
        ...companyScopeStrict(companyId),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
    });
  }

  /** Employees and managers for the admin dashboard (excludes ADMIN), same company only. */
  async getTeamEmployeesAndManagers(companyId: string | null) {
    return prisma.user.findMany({
      where: {
        role: { in: ['EMPLOYEE', 'MANAGER'] },
        ...companyScopeStrict(companyId),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
      },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
    });
  }

  async updateUser(id: string, input: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(input.email && { email: input.email }),
        ...(input.name && { name: input.name }),
        ...(input.role && { role: input.role }),
        ...(input.managerId !== undefined && { managerId: input.managerId }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
        createdAt: true,
      },
    });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const userService = new UserService();
