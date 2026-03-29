import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { LogoutButton } from "../../../components/layout/LogoutButton";
import { Card } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";

type ApprovalStatus = "pending" | "approved" | "rejected";
type TabType = "review" | "processed";
type FilterStatus = "all" | "approved" | "rejected";

interface ApprovalRequest {
  id: string;
  approvalSubject: string;
  requestOwner: string;
  category: string;
  requestStatus: ApprovalStatus;
  totalAmount: number;
  currency: string;
}

const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: "approval-1",
    approvalSubject: "none",
    requestOwner: "Sarah",
    category: "Food",
    requestStatus: "pending",
    totalAmount: 49396,
    currency: "₹",
  },
  {
    id: "approval-2",
    approvalSubject: "Travel Reimbursement",
    requestOwner: "John",
    category: "Travel",
    requestStatus: "pending",
    totalAmount: 25000,
    currency: "₹",
  },
  {
    id: "approval-3",
    approvalSubject: "Office Supplies",
    requestOwner: "Alex",
    category: "Supplies",
    requestStatus: "pending",
    totalAmount: 5500,
    currency: "₹",
  },
];

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-900/30",
  approved: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-200 dark:border-green-900/30",
  rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-200 dark:border-red-900/30",
};

export function ManagerDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("processed");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);

  const handleApprove = (id: string) => {
    setApprovals((prev) =>
      prev.map((approval) =>
        approval.id === id ? { ...approval, requestStatus: "approved" as ApprovalStatus } : approval
      )
    );
  };

  const handleReject = (id: string) => {
    setApprovals((prev) =>
      prev.map((approval) =>
        approval.id === id ? { ...approval, requestStatus: "rejected" as ApprovalStatus } : approval
      )
    );
  };

  const pendingApprovals = approvals.filter((a) => a.requestStatus === "pending");
  const processedApprovals = approvals.filter((a) => a.requestStatus !== "pending");

  const getFilteredProcessedApprovals = () => {
    if (filterStatus === "all") return processedApprovals;
    return processedApprovals.filter((a) => a.requestStatus === filterStatus);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header */}
        <Card className="max-w-none bg-white/95 backdrop-blur dark:bg-slate-900/95">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">Manager's View</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Review and approve expense requests from your team.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                {pendingApprovals.length} Pending
              </span>
              <span className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-200">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                {processedApprovals.filter((a) => a.requestStatus === "approved").length} Approved
              </span>
              <LogoutButton />
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="inline-flex gap-1 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("review")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "review"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
            }`}
          >
            📋 Review
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("processed")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "processed"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
            }`}
          >
            ✓ Processed
          </button>
        </div>

        {/* Approvals to Review Tab */}
        {activeTab === "review" && (
          <Card title="Approvals to review" className="max-w-none">
            {pendingApprovals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12 dark:border-slate-700">
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">No pending approvals</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All requests have been reviewed!</p>
                </div>
              </div>
            ) : (
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1000px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
                      <th className="px-3 py-2 font-medium text-left">Subject</th>
                      <th className="px-3 py-2 font-medium text-left">Owner</th>
                      <th className="px-3 py-2 font-medium text-left">Category</th>
                      <th className="px-3 py-2 font-medium text-left">Status</th>
                      <th className="px-3 py-2 font-medium text-left">Amount</th>
                      <th className="px-3 py-2 font-medium text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApprovals.map((approval) => (
                      <tr key={approval.id} className="border-b border-slate-100 align-middle last:border-b-0 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2">
                          <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{approval.approvalSubject}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs text-slate-700 dark:text-slate-300">{approval.requestOwner}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {approval.category}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-full border px-1.5 py-0.5 text-xs font-medium ${STATUS_COLORS[approval.requestStatus]}`}
                          >
                            {approval.requestStatus.charAt(0).toUpperCase() + approval.requestStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                            {approval.currency} {approval.totalAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              onClick={() => handleApprove(approval.id)}
                              className="bg-green-600 px-0.5 py-0.5 text-[10px] leading-none hover:bg-green-700"
                            >
                              ✓
                            </Button>
                            <Button
                              type="button"
                              onClick={() => handleReject(approval.id)}
                              className="bg-red-600 px-0.1 py-0.5 text-[10px] leading-none hover:bg-red-700"
                            >
                              ✕
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile View */}
            <div className="space-y-4 md:hidden">
              {pendingApprovals.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-8 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">No pending approvals</p>
                </div>
              ) : (
                pendingApprovals.map((approval) => (
                  <div key={approval.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="mb-4 grid gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Approval Subject</Label>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{approval.approvalSubject}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Request Owner</Label>
                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{approval.requestOwner}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Category</Label>
                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{approval.category}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status</Label>
                          <span
                            className={`mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_COLORS[approval.requestStatus]}`}
                          >
                            {approval.requestStatus.charAt(0).toUpperCase() + approval.requestStatus.slice(1)}
                          </span>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Amount</Label>
                          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {approval.currency} {approval.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <Button
                        type="button"
                        onClick={() => handleApprove(approval.id)}
                        className="flex-1 bg-green-600 px-1.5 py-0.5 text-[10px] leading-none hover:bg-green-700"
                      >
                        ✓
                      </Button>
                      <Button type="button" onClick={() => handleReject(approval.id)} className="flex-1 bg-red-600 px-1.5 py-0.5 text-[10px] leading-none hover:bg-red-700">
                        ✕
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* Processed Requests Tab */}
        {activeTab === "processed" && (
          <div className="space-y-6">
            {/* Filter Section */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Label htmlFor="status-filter" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Filter:
              </Label>
              <select
                id="status-filter"
                aria-label="Filter by status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-auto rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                ({getFilteredProcessedApprovals().length})
              </span>
            </div>

            {/* Processed Requests Table */}
            {getFilteredProcessedApprovals().length === 0 ? (
              <Card className="max-w-none">
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12 dark:border-slate-700">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">No processed requests</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No requests match the selected filter.</p>
                </div>
              </Card>
            ) : (
              <Card title="Processed Requests" className="max-w-none">
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[1000px] text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
                        <th className="px-3 py-2 font-medium text-left">Subject</th>
                        <th className="px-3 py-2 font-medium text-left">Owner</th>
                        <th className="px-3 py-2 font-medium text-left">Category</th>
                        <th className="px-3 py-2 font-medium text-left">Status</th>
                        <th className="px-3 py-2 font-medium text-left">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredProcessedApprovals().map((approval) => (
                        <tr key={approval.id} className="border-b border-slate-100 align-middle last:border-b-0 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-3 py-2">
                            <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{approval.approvalSubject}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-xs text-slate-700 dark:text-slate-300">{approval.requestOwner}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {approval.category}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded-full border px-1.5 py-0.5 text-xs font-medium ${STATUS_COLORS[approval.requestStatus]}`}
                            >
                              {approval.requestStatus.charAt(0).toUpperCase() + approval.requestStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                              {approval.currency} {approval.totalAmount.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 md:hidden">
                  {getFilteredProcessedApprovals().map((approval) => (
                    <div key={approval.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {approval.approvalSubject} · {approval.requestOwner}
                          </p>
                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                            {approval.currency} {approval.totalAmount.toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_COLORS[approval.requestStatus]}`}
                        >
                          {approval.requestStatus.charAt(0).toUpperCase() + approval.requestStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/20">
          <p className="text-sm text-indigo-900 dark:text-indigo-200">
            <span className="font-semibold">Note:</span> Once an expense is approved/rejected, the record becomes read-only. The status in the request status field and the action buttons become invisible.
          </p>
        </div>
      </div>
    </div>
  );
}
