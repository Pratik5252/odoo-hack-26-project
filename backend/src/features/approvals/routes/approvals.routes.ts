import { Router } from "express";
import { workflowController } from "../controllers/workflow.controller";
import { approvalRuleController } from "../controllers/approvalRule.controller";
import { approvalExecutorController } from "../controllers/approvalExecutor.controller";
import { authMiddleware } from "../../../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * Workflow Routes
 */

/**
 * POST /approvals/workflows
 * Create new workflow
 */
router.post("/workflows", workflowController.createWorkflow);

/**
 * GET /approvals/workflows
 * Get all workflows for authenticated user
 */
router.get("/workflows", workflowController.getAllWorkflows);

/**
 * GET /approvals/workflows/:id
 * Get specific workflow by ID
 */
router.get("/workflows/:id", workflowController.getWorkflow);

/**
 * PATCH /approvals/workflows/:id
 * Update workflow
 */
router.patch("/workflows/:id", workflowController.updateWorkflow);

/**
 * DELETE /approvals/workflows/:id
 * Delete workflow
 */
router.delete("/workflows/:id", workflowController.deleteWorkflow);

/**
 * Approval Rule Routes
 */

/**
 * POST /approvals/workflows/:workflowId/rule
 * Create or update approval rule for workflow
 */
router.post(
  "/workflows/:workflowId/rule",
  approvalRuleController.createOrUpdateRule,
);

/**
 * GET /approvals/workflows/:workflowId/rule
 * Get approval rule for workflow
 */
router.get("/workflows/:workflowId/rule", approvalRuleController.getRule);

/**
 * POST /approvals/workflows/:workflowId/rule/evaluate
 * Evaluate if approvals meet the approval rule criteria
 * Request Body: { approvals: Array<{id, approverId, status}> }
 * Response: { isApproved: boolean, approvedCount, requiredCount, reason }
 */
router.post(
  "/workflows/:workflowId/rule/evaluate",
  approvalRuleController.evaluateApprovals,
);

/**
 * DELETE /approvals/workflows/:workflowId/rule
 * Delete approval rule for workflow
 */
router.delete("/workflows/:workflowId/rule", approvalRuleController.deleteRule);

/**
 * Approval Executor Routes (Sequential vs Parallel Approval Flow)
 */

/**
 * POST /approvals/expenses/initialize
 * Initialize approval flow for an expense
 * Creates ExpenseApproval records based on workflow configuration
 * Sequential: Approvers must approve in order
 * Parallel: All approvers get requests simultaneously
 * Request Body: { expenseId, workflowId }
 */
router.post(
  "/expenses/initialize",
  approvalExecutorController.initializeApprovals,
);

/**
 * POST /approvals/expenses/:expenseId/approve
 * Process approver action (approve/reject expense)
 * Handles sequential hard-stop on reject
 * Handles parallel evaluation with approval rule engine
 * Request Body: { action: "APPROVE"|"REJECT", comment?: string }
 */
router.post(
  "/expenses/:expenseId/approve",
  approvalExecutorController.processApprovalAction,
);

/**
 * GET /approvals/expenses/:expenseId/status
 * Get current approval status for an expense
 * Returns all approvals, next approver (if sequential), and overall status
 */
router.get(
  "/expenses/:expenseId/status",
  approvalExecutorController.getApprovalStatus,
);

export default router;
