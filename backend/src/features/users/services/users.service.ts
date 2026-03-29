import { prisma } from '../../../lib/prisma';

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  managerId?: string | null;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  managerId?: string | null;
}

export class UserService {
  async createUser(input: CreateUserInput) {
    return prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        password: input.password,
        role: input.role,
        managerId: input.managerId,
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
