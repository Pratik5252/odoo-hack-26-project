import { prisma } from '../../../lib/prisma';

export interface CreateManagerInput {
  email: string;
  name: string;
  password: string;
  department?: string | null;
}

export interface UpdateManagerInput {
  email?: string;
  name?: string;
  department?: string | null;
}

export class ManagerService {
  async getAllManagers() {
    return prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async getManagerById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async createManager(input: CreateManagerInput) {
    return prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        password: input.password,
        role: 'MANAGER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updateManager(id: string, input: UpdateManagerInput) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(input.email && { email: input.email }),
        ...(input.name && { name: input.name }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async deleteManager(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async getTeam(managerId: string) {
    return prisma.user.findMany({
      where: { managerId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async getTeamExpenses(managerId: string) {
    // Get all employees under this manager
    const teamMembers = await prisma.user.findMany({
      where: { managerId },
      select: { id: true },
    });

    const teamMemberIds = teamMembers.map((member) => member.id);

    // Get all expenses for these team members
    return prisma.expense.findMany({
      where: {
        userId: {
          in: teamMemberIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvals: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const managerService = new ManagerService();
