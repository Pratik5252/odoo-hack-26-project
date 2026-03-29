import { prisma } from "../../../lib/prisma";
import { AppError, Errors } from "../../../utils/errorHandler";

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  userId: string;
  isManageApproved: boolean;
  isApprovalSequence: boolean;
  approvers?: Array<{
    approverId: string;
    position?: number;
    isRequired?: boolean;
  }>;
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  isManageApproved?: boolean;
  isApprovalSequence?: boolean;
}

export const workflowService = {
  async createWorkflow(input: CreateWorkflowInput) {
    const {
      name,
      description,
      userId,
      isManageApproved,
      isApprovalSequence,
      approvers,
    } = input;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw Errors.NotFound("User not found");
    }

    // Verify all approvers exist if provided
    if (approvers && approvers.length > 0) {
      const approverIds = approvers.map((a) => a.approverId);
      const approvingUsers = await prisma.user.findMany({
        where: { id: { in: approverIds } },
      });

      if (approvingUsers.length !== approverIds.length) {
        throw Errors.NotFound("One or more approver IDs do not exist");
      }
    }

    // Create workflow with approvers in atomic transaction
    const workflow = await prisma.workflow.create({
      data: {
        name,
        decription: description,
        userId,
        isManageApproved,
        isApprovalSequence,
        approvers:
          approvers && approvers.length > 0
            ? {
                createMany: {
                  data: approvers.map((approver) => ({
                    approverId: approver.approverId,
                    position: approver.position || null,
                    isRequired: approver.isRequired || false,
                  })),
                },
              }
            : undefined,
      },
      include: {
        approvers: {
          include: {
            approver: true,
          },
        },
      },
    });

    return workflow;
  },

  async getWorkflowById(workflowId: string) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        user: true,
        approvers: {
          include: {
            approver: true,
          },
        },
      },
    });

    if (!workflow) {
      throw Errors.NotFound("Workflow not found");
    }

    return workflow;
  },

  async getAllWorkflows(userId?: string) {
    const workflows = await prisma.workflow.findMany({
      ...(userId && { where: { userId } }),
      include: {
        user: true,
        approvers: {
          include: {
            approver: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return workflows;
  },

  async updateWorkflow(workflowId: string, input: UpdateWorkflowInput) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw Errors.NotFound("Workflow not found");
    }

    const updated = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        name: input.name || workflow.name,
        decription:
          input.description !== undefined
            ? input.description
            : workflow.decription,
        isManageApproved:
          input.isManageApproved !== undefined
            ? input.isManageApproved
            : workflow.isManageApproved,
        isApprovalSequence:
          input.isApprovalSequence !== undefined
            ? input.isApprovalSequence
            : workflow.isApprovalSequence,
      },
      include: {
        approvers: {
          include: {
            approver: true,
          },
        },
      },
    });

    return updated;
  },

  async deleteWorkflow(workflowId: string) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw Errors.NotFound("Workflow not found");
    }

    await prisma.workflow.delete({
      where: { id: workflowId },
    });

    return { message: "Workflow deleted successfully" };
  },
};
