import { prisma } from '../../../lib/prisma';

export interface CreateEmployeeInput {
  email: string;
  name: string;
  password: string;
  department?: string | null;
  role?: string;
}

export interface UpdateEmployeeInput {
  email?: string;
  name?: string;
  department?: string | null;
  role?: string;
}

export class EmployeeService {
  async getAllEmployees() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async getEmployeeById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async createEmployee(input: CreateEmployeeInput) {
    return prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        password: input.password,
        role: 'EMPLOYEE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async updateEmployee(id: string, input: UpdateEmployeeInput) {
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
        createdAt: true,
      },
    });
  }

  async deleteEmployee(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const employeeService = new EmployeeService();
