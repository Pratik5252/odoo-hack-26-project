import { prisma } from "../../../lib/prisma";
import { Errors } from "../../../utils/errorHandler";

export interface AddApproverInput {
  workflowId: string;
  approverId: string;
  isRequired: boolean;
}

export const approverService = {
  async addApprover(input: AddApproverInput) {
    const { workflowId, approverId, isRequired } = input;

    // Verify workflow exists
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw Errors.NotFound("Workflow not found");
    }

    // Verify approver user exists
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
    });

    if (!approver) {
      throw Errors.NotFound("Approver user not found");
    }

    // Check if already added
    const existing = await prisma.approver.findUnique({
      where: {
        workflowId_approverId: {
          workflowId,
          approverId,
        },
      },
    });

    if (existing) {
      throw Errors.Conflict("Approver already added to this workflow");
    }

    const approverRecord = await prisma.approver.create({
      data: {
        workflowId,
        approverId,
        isRequired,
      },
      include: {
        approver: true,
      },
    });

    return approverRecord;
  },

  async removeApprover(workflowId: string, approverId: string) {
    const approver = await prisma.approver.findUnique({
      where: {
        workflowId_approverId: {
          workflowId,
          approverId,
        },
      },
    });

    if (!approver) {
      throw Errors.NotFound("Approver not found in this workflow");
    }

    await prisma.approver.delete({
      where: {
        workflowId_approverId: {
          workflowId,
          approverId,
        },
      },
    });

    return { message: "Approver removed successfully" };
  },

  async getWorkflowApprovers(workflowId: string) {
    const approvers = await prisma.approver.findMany({
      where: { workflowId },
      include: {
        approver: true,
      },
    });

    return approvers;
  },

  async updateApprover(
    workflowId: string,
    approverId: string,
    isRequired: boolean,
  ) {
    const approver = await prisma.approver.findUnique({
      where: {
        workflowId_approverId: {
          workflowId,
          approverId,
        },
      },
    });

    if (!approver) {
      throw Errors.NotFound("Approver not found in this workflow");
    }

    const updated = await prisma.approver.update({
      where: {
        workflowId_approverId: {
          workflowId,
          approverId,
        },
      },
      data: {
        isRequired,
      },
      include: {
        approver: true,
      },
    });

    return updated;
  },
};
