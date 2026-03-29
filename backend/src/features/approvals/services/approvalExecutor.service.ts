import { prisma } from "../../../lib/prisma";
import { Errors } from "../../../utils/errorHandler";
import { approvalRuleService } from "./approvalRule.service";

/**
 * APPROVAL EXECUTOR SERVICE
 *
 * Orchestrates the approval flow for expenses based on workflow configuration:
 * - Sequential: Approvers must approve in order (hard stop on reject)
 * - Parallel: All approvers get requests simultaneously (final decision by rule)
 */

export interface ApprovalExecutionResult {
  success: boolean;
  expenseId: string;
  status: "APPROVED" | "REJECTED" | "PENDING_APPROVAL";
  currentApprovalStatus: string;
  reason: string;
  nextApproverEmail?: string; // For sequential mode
  allApprovals: Array<{
    id: string;
    approverId: string;
    approverEmail: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    approvedAt?: Date | null;
  }>;
}

export interface ApproverAction {
  id: string;
  workflowId: string;
  expenseId: string;
  approverId: string;
  action: "APPROVE" | "REJECT";
  comment?: string;
}

export const approvalExecutorService = {
  /**
   * Initialize approval flow when expense is submitted
   * Creates ExpenseApproval records based on workflow configuration
   */
  async initializeApprovals(
    expenseId: string,
    workflowId: string,
  ): Promise<ApprovalExecutionResult> {
    try {
      // Get workflow with approvers
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
          approvers: {
            include: { approver: { select: { id: true, email: true } } },
          },
        },
      });

      if (!workflow) {
        throw Errors.NotFound("Workflow not found");
      }

      if (workflow.approvers.length === 0) {
        // No approvers = auto-approve
        return {
          success: true,
          expenseId,
          status: "APPROVED",
          currentApprovalStatus: "No approvers configured",
          reason: "Workflow has no approvers - expense auto-approved",
          allApprovals: [],
        };
      }

      // Create ExpenseApproval records for all approvers
      const expenseApprovals = await Promise.all(
        workflow.approvers.map((approver) =>
          (prisma.expenseApproval as any).create({
            data: {
              expenseId,
              approverId: approver.approverId,
              status: "PENDING",
            },
            include: {
              approver: { select: { id: true, email: true } },
            },
          }),
        ),
      );

      // Determine initial status
      const nextApprover = workflow.isApprovalSequence
        ? workflow.approvers[0]
        : null;

      return {
        success: true,
        expenseId,
        status: "PENDING_APPROVAL",
        currentApprovalStatus: workflow.isApprovalSequence
          ? `Sequential approval: Waiting for ${nextApprover?.approver.email}`
          : "Parallel approval: Waiting for all approvers",
        nextApproverEmail: nextApprover?.approver.email,
        reason: "Approval flow initialized successfully",
        allApprovals: expenseApprovals.map((ea) => ({
          id: ea.id,
          approverId: ea.approverId,
          approverEmail: ea.approver.email,
          status: ea.status,
        })),
      };
    } catch (error: any) {
      if (error.isOperational) throw error;
      throw Errors.InternalServer(
        "Failed to initialize approvals: " + error.message,
      );
    }
  },

  /**
   * Process approver action (approve/reject)
   * Handles sequential progression and parallel evaluation
   */
  async processApprovalAction(
    expenseId: string,
    approverId: string,
    action: "APPROVE" | "REJECT",
    comment?: string,
  ): Promise<ApprovalExecutionResult> {
    try {
      // Get expense with workflow
      const expense = await (prisma.expense as any).findUnique({
        where: { id: expenseId },
      });

      if (!expense) {
        throw Errors.NotFound("Expense not found");
      }

      // Get all approvals for this expense
      const allApprovals = await (prisma.expenseApproval as any).findMany({
        where: { expenseId },
        include: {
          approver: { select: { id: true, email: true } },
        },
      });

      // Find the approval being updated
      const currentApproval = allApprovals.find(
        (a: any) => a.approverId === approverId,
      );
      if (!currentApproval) {
        throw Errors.NotFound("Approval record not found for this approver");
      }

      // Get workflow
      const workflow = await prisma.workflow.findUnique({
        where: { id: expense.workflowId || "unknown" },
        include: {
          approvers: {
            include: { approver: { select: { id: true, email: true } } },
          },
        },
      });

      if (!workflow) {
        throw Errors.NotFound("Workflow not found");
      }

      // Update the approval
      const updatedApproval = await (prisma.expenseApproval as any).update({
        where: { id: currentApproval.id },
        data: {
          status: action === "APPROVE" ? "APPROVED" : "REJECTED",
          comment: comment || null,
          approvedAt: new Date(),
        },
        include: {
          approver: { select: { id: true, email: true } },
        },
      });

      // SEQUENTIAL MODE: Hard stop on reject
      if (workflow.isApprovalSequence) {
        if (action === "REJECT") {
          // Update expense status to REJECTED
          await (prisma.expense as any).update({
            where: { id: expenseId },
            data: { status: "REJECTED" },
          });

          return {
            success: false,
            expenseId,
            status: "REJECTED",
            currentApprovalStatus: `Rejected by ${updatedApproval.approver.email}`,
            reason: `Expense rejected in sequential workflow at approver: ${updatedApproval.approver.email}`,
            allApprovals: allApprovals.map((a: any) => ({
              id: a.id,
              approverId: a.approverId,
              approverEmail: a.approver.email,
              status: a.status,
              approvedAt: a.approvedAt,
            })),
          };
        }

        // Sequential approve: Move to next approver
        const approverIndex = workflow.approvers.findIndex(
          (a) => a.approverId === approverId,
        );
        const nextApprover = workflow.approvers[approverIndex + 1];

        if (nextApprover) {
          // More approvers in sequence
          return {
            success: true,
            expenseId,
            status: "PENDING_APPROVAL",
            currentApprovalStatus: `Approved by ${updatedApproval.approver.email}. Waiting for next approver.`,
            nextApproverEmail: nextApprover.approver.email,
            reason: `Sequential approval progress: ${approverIndex + 1}/${workflow.approvers.length} approvers completed`,
            allApprovals: allApprovals.map((a: any) => ({
              id: a.id,
              approverId: a.approverId,
              approverEmail: a.approver.email,
              status: a.status,
              approvedAt: a.approvedAt,
            })),
          };
        } else {
          // All sequential approvers completed
          await (prisma.expense as any).update({
            where: { id: expenseId },
            data: { status: "APPROVED" },
          });

          return {
            success: true,
            expenseId,
            status: "APPROVED",
            currentApprovalStatus: "All sequential approvers approved",
            reason: `Expense approved: All ${workflow.approvers.length} approvers in sequence approved`,
            allApprovals: allApprovals.map((a: any) => ({
              id: a.id,
              approverId: a.approverId,
              approverEmail: a.approver.email,
              status: a.status,
              approvedAt: a.approvedAt,
            })),
          };
        }
      }

      // PARALLEL MODE: Use approval rule engine to determine final status
      const updatedAllApprovals = allApprovals.map((a: any) =>
        a.id === currentApproval.id ? updatedApproval : a,
      );

      // Evaluate against approval rule
      const ruleResult = await approvalRuleService.evaluateApprovalRule(
        workflow.id,
        updatedAllApprovals.map((a: any) => ({
          id: a.id,
          approverId: a.approverId,
          status: a.status,
          approvedAt: a.approvedAt,
        })),
      );

      // Check if all have been reviewed (no pending)
      const allReviewed = updatedAllApprovals.every(
        (a: any) => a.status !== "PENDING",
      );

      let finalStatus = "PENDING_APPROVAL";
      let finalSuccess = false;

      if (ruleResult.isApproved) {
        finalStatus = "APPROVED";
        finalSuccess = true;

        await (prisma.expense as any).update({
          where: { id: expenseId },
          data: { status: "APPROVED" },
        });
      } else if (allReviewed) {
        // All reviewed but rule not met
        finalStatus = "REJECTED";
        finalSuccess = false;

        await (prisma.expense as any).update({
          where: { id: expenseId },
          data: { status: "REJECTED" },
        });
      }

      return {
        success: finalSuccess,
        expenseId,
        status: finalStatus as "APPROVED" | "REJECTED" | "PENDING_APPROVAL",
        currentApprovalStatus: ruleResult.reason,
        reason: finalSuccess
          ? "Approval rule satisfied - expense approved"
          : allReviewed
            ? "All approvers reviewed - approval rule not satisfied"
            : "Awaiting more approvals",
        allApprovals: updatedAllApprovals.map((a: any) => ({
          id: a.id,
          approverId: a.approverId,
          approverEmail: a.approver.email,
          status: a.status as "PENDING" | "APPROVED" | "REJECTED",
          approvedAt: a.approvedAt,
        })),
      };
    } catch (error: any) {
      if (error.isOperational) throw error;
      throw Errors.InternalServer(
        "Failed to process approval action: " + error.message,
      );
    }
  },

  /**
   * Get current approval status for an expense
   */
  async getApprovalStatus(expenseId: string): Promise<ApprovalExecutionResult> {
    try {
      const expense = await (prisma.expense as any).findUnique({
        where: { id: expenseId },
      });

      if (!expense) {
        throw Errors.NotFound("Expense not found");
      }

      const allApprovals = await (prisma.expenseApproval as any).findMany({
        where: { expenseId },
        include: {
          approver: { select: { id: true, email: true } },
        },
      });

      const workflow = await prisma.workflow.findUnique({
        where: { id: expense.workflowId || "unknown" },
        include: {
          approvers: {
            include: { approver: { select: { id: true, email: true } } },
          },
        },
      });

      if (!workflow) {
        throw Errors.NotFound("Workflow not found");
      }

      // Determine current status
      let currentApprovalStatus = "";
      let nextApproverEmail: string | undefined = undefined;

      if (workflow.isApprovalSequence) {
        // Sequential: Find first non-approved
        const firstPending = allApprovals.find(
          (a: any) => a.status === "PENDING",
        );
        if (firstPending) {
          currentApprovalStatus = `Sequential mode: Waiting for ${firstPending.approver.email}`;
          nextApproverEmail = firstPending.approver.email;
        } else {
          currentApprovalStatus = "Sequential approval complete";
        }
      } else {
        // Parallel: Count pending
        const pendingCount = allApprovals.filter(
          (a: any) => a.status === "PENDING",
        ).length;
        currentApprovalStatus =
          pendingCount > 0
            ? `Parallel mode: ${pendingCount}/${allApprovals.length} approvals pending`
            : "All approvals received";
      }

      return {
        success: expense.status === "APPROVED",
        expenseId,
        status: expense.status as "APPROVED" | "REJECTED" | "PENDING_APPROVAL",
        currentApprovalStatus,
        nextApproverEmail,
        reason: `Current expense status: ${expense.status}`,
        allApprovals: allApprovals.map((a: any) => ({
          id: a.id,
          approverId: a.approverId,
          approverEmail: a.approver.email,
          status: a.status,
          approvedAt: a.approvedAt,
        })),
      };
    } catch (error: any) {
      if (error.isOperational) throw error;
      throw Errors.InternalServer(
        "Failed to get approval status: " + error.message,
      );
    }
  },
};
