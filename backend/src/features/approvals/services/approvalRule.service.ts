import { prisma } from "../../../lib/prisma";
import { Errors } from "../../../utils/errorHandler";

export interface CreateApprovalRuleInput {
  workflowId: string;
  ruleType: "PERCENTAGE" | "SPECIFIC_APPROVER" | "HYBRID";
  percentageThreshold?: number;
  requiredApproverId?: string;
}

export interface ApprovalEvaluationResult {
  isApproved: boolean;
  approvedCount: number;
  requiredCount: number;
  specificApproverApproved?: boolean;
  reason: string;
}

/**
 * HYBRID APPROVAL RULE ENGINE
 *
 * Supports three approval rule types:
 * 1. PERCENTAGE: X% of approvers must approve (default 60%)
 * 2. SPECIFIC_APPROVER: A designated approver must approve
 * 3. HYBRID: Both percentage AND specific approver conditions must be met
 */
export const approvalRuleService = {
  async createOrUpdateRule(input: CreateApprovalRuleInput) {
    const { workflowId, ruleType, percentageThreshold, requiredApproverId } =
      input;

    // Verify workflow exists
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { approvers: true },
    });

    if (!workflow) {
      throw Errors.NotFound("Workflow not found");
    }

    // Validate rule type requirements
    if (
      ruleType === "PERCENTAGE" &&
      (!percentageThreshold ||
        percentageThreshold < 0 ||
        percentageThreshold > 100)
    ) {
      throw Errors.BadRequest("Percentage threshold must be between 0 and 100");
    }

    if (ruleType === "SPECIFIC_APPROVER" && !requiredApproverId) {
      throw Errors.BadRequest(
        "Required approver ID must be provided for SPECIFIC_APPROVER rule",
      );
    }

    if (ruleType === "HYBRID") {
      if (
        !percentageThreshold ||
        percentageThreshold < 0 ||
        percentageThreshold > 100
      ) {
        throw Errors.BadRequest(
          "Percentage threshold is required for HYBRID rule and must be between 0 and 100",
        );
      }
      if (!requiredApproverId) {
        throw Errors.BadRequest(
          "Required approver ID is required for HYBRID rule",
        );
      }
    }

    // Validate required approver exists and is in workflow approvers
    if (requiredApproverId) {
      const approver = await prisma.user.findUnique({
        where: { id: requiredApproverId },
      });

      if (!approver) {
        throw Errors.NotFound("Required approver not found");
      }

      const isApproverInWorkflow = workflow.approvers.some(
        (a) => a.approverId === requiredApproverId,
      );
      if (!isApproverInWorkflow) {
        throw Errors.BadRequest(
          "Required approver must be part of the workflow",
        );
      }
    }

    // Create or update approval rule (placeholder until migration)
    try {
      const prismaAny = prisma as any;
      const existingRule = await prismaAny.approvalRule.findUnique({
        where: { workflowId },
      });

      if (existingRule) {
        const updated = await prismaAny.approvalRule.update({
          where: { workflowId },
          data: {
            ruleType,
            percentageThreshold: percentageThreshold || null,
            requiredApproverId: requiredApproverId || null,
          },
        });
        return updated;
      }

      const created = await prismaAny.approvalRule.create({
        data: {
          workflowId,
          ruleType,
          percentageThreshold: percentageThreshold || null,
          requiredApproverId: requiredApproverId || null,
        },
      });
      return created;
    } catch (error: any) {
      throw Errors.InternalServer(
        "ApprovalRule feature requires running: npx prisma migrate dev --name add_approval_rules",
      );
    }
  },

  async getRule(workflowId: string) {
    try {
      const prismaAny = prisma as any;
      const rule = await prismaAny.approvalRule.findUnique({
        where: { workflowId },
        include: {
          requiredApprover: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      if (!rule) {
        return null;
      }

      return rule;
    } catch (error: any) {
      throw Errors.InternalServer(
        "ApprovalRule feature requires running: npx prisma migrate dev --name add_approval_rules",
      );
    }
  },

  async deleteRule(workflowId: string) {
    try {
      const prismaAny = prisma as any;
      await prismaAny.approvalRule.delete({
        where: { workflowId },
      });
      return { success: true, message: "Approval rule deleted successfully" };
    } catch (error: any) {
      if (error.code === "P2025") {
        throw Errors.NotFound("Approval rule not found");
      }
      throw Errors.InternalServer(
        "ApprovalRule feature requires running: npx prisma migrate dev --name add_approval_rules",
      );
    }
  },

  /**
   * HYBRID APPROVAL EVALUATION ENGINE
   *
   * Evaluates if an expense meets approval criteria based on the workflow's approval rule.
   *
   * Rules:
   * - PERCENTAGE: Requires X% of workflow approvers to approve
   * - SPECIFIC_APPROVER: Requires a specific designated approver to approve
   * - HYBRID: Requires BOTH percentage threshold AND specific approver approval
   * - NO RULE: Requires all approvers to approve
   */
  async evaluateApprovalRule(
    workflowId: string,
    expenseApprovals: Array<{
      id: string;
      approverId: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
      approvedAt?: Date | null;
    }>,
  ): Promise<ApprovalEvaluationResult> {
    try {
      // Get workflow with its rule
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { approvers: true },
      });

      if (!workflow) {
        throw Errors.NotFound("Workflow not found");
      }

      // Get approval rule (if exists)
      const prismaAny = prisma as any;
      const rule = await prismaAny.approvalRule
        .findUnique({
          where: { workflowId },
        })
        .catch(() => null);

      // Count approved and total approvals
      const approvedCount = expenseApprovals.filter(
        (a) => a.status === "APPROVED",
      ).length;
      const totalApprovals = expenseApprovals.length;

      // If no rule defined, all must approve (default behavior)
      if (!rule) {
        const isApproved = approvedCount === totalApprovals;
        return {
          isApproved,
          approvedCount,
          requiredCount: totalApprovals,
          reason: isApproved
            ? "All approvers have approved (no rule defined)"
            : `${approvedCount}/${totalApprovals} approvers approved. All required.`,
        };
      }

      // PERCENTAGE rule evaluation
      if (rule.ruleType === "PERCENTAGE") {
        const threshold = rule.percentageThreshold || 60;
        const requiredCount = Math.ceil((totalApprovals * threshold) / 100);
        const isApproved = approvedCount >= requiredCount;

        return {
          isApproved,
          approvedCount,
          requiredCount,
          reason: isApproved
            ? `Percentage rule satisfied: ${approvedCount}/${totalApprovals} approvals (${threshold}% = ${requiredCount} required)`
            : `Percentage rule not met: ${approvedCount}/${totalApprovals} approvals (${threshold}% = ${requiredCount} required)`,
        };
      }

      // SPECIFIC_APPROVER rule evaluation
      if (rule.ruleType === "SPECIFIC_APPROVER") {
        const specificApproval = expenseApprovals.find(
          (a) => a.approverId === rule.requiredApproverId,
        );
        const specificApproverApproved =
          specificApproval?.status === "APPROVED";

        return {
          isApproved: specificApproverApproved,
          approvedCount,
          requiredCount: 1,
          specificApproverApproved,
          reason: specificApproverApproved
            ? `Specific approver (${rule.requiredApproverId}) has approved`
            : `Specific approver (${rule.requiredApproverId}) has not approved or not found`,
        };
      }

      // HYBRID rule evaluation (most restrictive)
      if (rule.ruleType === "HYBRID") {
        const threshold = rule.percentageThreshold || 60;
        const requiredCount = Math.ceil((totalApprovals * threshold) / 100);
        const percentageMetCount = approvedCount >= requiredCount;

        const specificApproval = expenseApprovals.find(
          (a) => a.approverId === rule.requiredApproverId,
        );
        const specificApproverApproved =
          specificApproval?.status === "APPROVED";

        // HYBRID: BOTH conditions must be met
        const isApproved = percentageMetCount && specificApproverApproved;

        return {
          isApproved,
          approvedCount,
          requiredCount,
          specificApproverApproved,
          reason: isApproved
            ? `Hybrid rule satisfied: ${approvedCount}/${totalApprovals} approvals (${threshold}% = ${requiredCount} required) AND specific approver approved`
            : `Hybrid rule not met: ${
                !percentageMetCount
                  ? `${approvedCount}/${totalApprovals} approvals (need ${threshold}% = ${requiredCount})`
                  : ""
              } ${!specificApproverApproved ? "AND specific approver has not approved" : ""}`,
        };
      }

      // Fallback
      return {
        isApproved: false,
        approvedCount,
        requiredCount: totalApprovals,
        reason: "Unknown rule type",
      };
    } catch (error: any) {
      if (error.isOperational) throw error;
      throw Errors.InternalServer(
        "Error evaluating approval rule: " + error.message,
      );
    }
  },

  /**
   * Legacy method for checking if all approvals are complete
   * Kept for backward compatibility
   */
  async checkApprovalRule(workflowId: string, approvals: any[]) {
    const result = await this.evaluateApprovalRule(workflowId, approvals);
    return result.isApproved;
  },
};
