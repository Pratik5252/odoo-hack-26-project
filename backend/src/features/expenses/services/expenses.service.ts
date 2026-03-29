import { prisma } from '../../../lib/prisma';

export interface CreateExpenseInput {
  userId: string;
  amount: number;
  category: string;
  description?: string | null;
  receiptUrl?: string | null;
}

export interface UpdateExpenseInput {
  amount?: number;
  category?: string;
  description?: string | null;
  receiptUrl?: string | null;
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export class ExpenseService {
  async getAllExpenses() {
    return prisma.expense.findMany({
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

  async getExpenseById(id: string) {
    return prisma.expense.findUnique({
      where: { id },
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
    });
  }

  async getExpensesByUserId(userId: string) {
    return prisma.expense.findMany({
      where: { userId },
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

  async createExpense(input: CreateExpenseInput) {
    return prisma.expense.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        category: input.category,
        description: input.description,
        receiptUrl: input.receiptUrl,
        status: 'DRAFT',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateExpense(id: string, input: UpdateExpenseInput) {
    return prisma.expense.update({
      where: { id },
      data: {
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.category && { category: input.category }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.receiptUrl !== undefined && { receiptUrl: input.receiptUrl }),
        ...(input.status && { status: input.status }),
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
    });
  }

  async deleteExpense(id: string) {
    return prisma.expense.delete({
      where: { id },
    });
  }

  async getExpensesByStatus(status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED') {
    return prisma.expense.findMany({
      where: { status },
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

export const expenseService = new ExpenseService();
