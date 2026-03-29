import { useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

type Role = "Manager" | "Employee";

interface UserRow {
  id: string;
  user: string;
  role: Role;
  manager: string;
  email: string;
}

interface Approver {
  id: string;
  name: string;
  isRequired: boolean;
}

interface ApprovalRule {
  id: string;
  user: string;
  ruleDescription: string;
  manager: string;
  isManagerApprover: boolean;
  approvers: Approver[];
  approvalsSequential: boolean;
  minimumApprovalPercentage: string;
}

const ROLE_OPTIONS: Role[] = ["Manager", "Employee"];
const MANAGER_OPTIONS = ["Sarah", "David", "Rina", "No manager"];
const SELECT_STYLE =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

const INITIAL_USERS: UserRow[] = [
  {
    id: "u-1",
    user: "marc",
    role: "Manager",
    manager: "Sarah",
    email: "marc@gmail.com",
  },
  {
    id: "u-2",
    user: "alex",
    role: "Employee",
    manager: "David",
    email: "alex@company.com",
  },
];

const INITIAL_APPROVAL_RULES: ApprovalRule[] = [
  {
    id: "rule-1",
    user: "marc",
    ruleDescription: "Approval rule for miscellaneous expenses",
    manager: "Sarah",
    isManagerApprover: true,
    approvers: [
      { id: "approver-1", name: "John", isRequired: true },
      { id: "approver-2", name: "Mitchell", isRequired: false },
      { id: "approver-3", name: "Andreas", isRequired: false },
    ],
    approvalsSequential: false,
    minimumApprovalPercentage: "50",
  },
];

type TabType = "roles" | "approvals";

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("roles");
  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState<UserRow[]>(INITIAL_USERS);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>(INITIAL_APPROVAL_RULES);
  const [newUser, setNewUser] = useState<UserRow>({
    id: "new-row",
    user: "",
    role: "Employee",
    manager: "No manager",
    email: "",
  });

  const canAddUser = useMemo(() => {
    return newUser.user.trim() !== "" && newUser.email.trim() !== "";
  }, [newUser.email, newUser.user]);

  const updateExistingUser = (id: string, field: "user" | "role" | "manager" | "email", value: string) => {
    setUsers((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleAddUser = () => {
    if (!canAddUser) return;

    setUsers((prev) => [
      ...prev,
      {
        ...newUser,
        id: `u-${Date.now()}`,
        user: newUser.user.trim(),
        email: newUser.email.trim(),
      },
    ]);

    setNewUser({
      id: "new-row",
      user: "",
      role: "Employee",
      manager: "No manager",
      email: "",
    });
    setShowAddUser(false);
  };

  const updateApprovalRule = (ruleId: string, field: keyof ApprovalRule, value: any) => {
    setApprovalRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, [field]: value } : rule
      )
    );
  };

  const updateApproverRequired = (ruleId: string, approverId: string, isRequired: boolean) => {
    setApprovalRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              approvers: rule.approvers.map((app) =>
                app.id === approverId ? { ...app, isRequired } : app
              ),
            }
          : rule
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header */}
        <Card className="max-w-none bg-white/95 backdrop-blur dark:bg-slate-900/95">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Manage users, roles, and approval rules.</p>
            </div>
            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">System Admin</span>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex gap-2 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeTab === "roles"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            👥 Role Management
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("approvals")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeTab === "approvals"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            ✓ Approval Rules
          </button>
        </div>

        {/* Role Management Tab Content */}
        {activeTab === "roles" && (
          <div className="space-y-6">
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => setShowAddUser(!showAddUser)}
                className="sm:w-auto"
              >
                {showAddUser ? "✕ Cancel" : "+ Add User"}
              </Button>
            </div>

            {showAddUser && (
              <Card title="Add New User" className="max-w-none border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-800 dark:from-indigo-950 dark:to-slate-900">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <Label htmlFor="new-user-name">User Name</Label>
                    <Input
                      id="new-user-name"
                      aria-label="New user name"
                      value={newUser.user}
                      onChange={(event) => setNewUser((prev) => ({ ...prev, user: event.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-user-role">Role</Label>
                    <select
                      id="new-user-role"
                      aria-label="New user role"
                      value={newUser.role}
                      onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value as Role }))}
                      className={SELECT_STYLE}
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="new-user-manager">Manager</Label>
                    <select
                      id="new-user-manager"
                      aria-label="New user manager"
                      value={newUser.manager}
                      onChange={(event) => setNewUser((prev) => ({ ...prev, manager: event.target.value }))}
                      className={SELECT_STYLE}
                    >
                      {MANAGER_OPTIONS.map((manager) => (
                        <option key={manager} value={manager}>
                          {manager}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="new-user-email">Email</Label>
                    <Input
                      id="new-user-email"
                      aria-label="New user email"
                      type="email"
                      value={newUser.email}
                      onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="user@email.com"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" onClick={handleAddUser} disabled={!canAddUser} className="sm:w-auto">
                    Create User
                  </Button>
                </div>
              </Card>
            )}

            <Card title="Users" className="max-w-none">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[820px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
                      <th className="px-3 py-3 font-semibold">User</th>
                      <th className="px-3 py-3 font-semibold">Role</th>
                      <th className="px-3 py-3 font-semibold">Manager</th>
                      <th className="px-3 py-3 font-semibold">Email</th>
                      <th className="px-3 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 align-top last:border-b-0 dark:border-slate-800">
                        <td className="px-3 py-3">
                          <Input
                            aria-label={`User name ${item.user}`}
                            value={item.user}
                            onChange={(event) => updateExistingUser(item.id, "user", event.target.value)}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <select
                            aria-label={`Role for ${item.user}`}
                            value={item.role}
                            onChange={(event) => updateExistingUser(item.id, "role", event.target.value)}
                            className={SELECT_STYLE}
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <select
                            aria-label={`Manager for ${item.user}`}
                            value={item.manager}
                            onChange={(event) => updateExistingUser(item.id, "manager", event.target.value)}
                            className={SELECT_STYLE}
                          >
                            {MANAGER_OPTIONS.map((manager) => (
                              <option key={manager} value={manager}>
                                {manager}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <Input
                            aria-label={`Email for ${item.user}`}
                            type="email"
                            value={item.email}
                            onChange={(event) => updateExistingUser(item.id, "email", event.target.value)}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <Button type="button" className="text-xs sm:w-auto">
                            Send password
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 md:hidden">
                {users.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="mb-3 grid gap-3">
                      <div>
                        <Label htmlFor={`user-${item.id}`}>User</Label>
                        <Input
                          id={`user-${item.id}`}
                          aria-label={`User name ${item.user}`}
                          value={item.user}
                          onChange={(event) => updateExistingUser(item.id, "user", event.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`role-${item.id}`}>Role</Label>
                        <select
                          id={`role-${item.id}`}
                          aria-label={`Role for ${item.user}`}
                          value={item.role}
                          onChange={(event) => updateExistingUser(item.id, "role", event.target.value)}
                          className={SELECT_STYLE}
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`manager-${item.id}`}>Manager</Label>
                        <select
                          id={`manager-${item.id}`}
                          aria-label={`Manager for ${item.user}`}
                          value={item.manager}
                          onChange={(event) => updateExistingUser(item.id, "manager", event.target.value)}
                          className={SELECT_STYLE}
                        >
                          {MANAGER_OPTIONS.map((manager) => (
                            <option key={manager} value={manager}>
                              {manager}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`email-${item.id}`}>Email</Label>
                        <Input
                          id={`email-${item.id}`}
                          aria-label={`Email for ${item.user}`}
                          type="email"
                          value={item.email}
                          onChange={(event) => updateExistingUser(item.id, "email", event.target.value)}
                        />
                      </div>
                    </div>

                    <Button type="button">Send password</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Approval Rules Tab Content */}
        {activeTab === "approvals" && (
          <div>
            <Card title="Approval Rules" className="max-w-none">
              <div className="space-y-8">
                {approvalRules.map((rule) => (
                  <div key={rule.id} className="grid gap-6 rounded-xl border border-slate-200 p-6 dark:border-slate-700 lg:grid-cols-2">
                    {/* Left Column - Rule Configuration */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Rule Configuration</h3>

                      <div>
                        <Label htmlFor={`rule-user-${rule.id}`} className="font-medium">User</Label>
                        <Input
                          id={`rule-user-${rule.id}`}
                          aria-label={`Approval rule user ${rule.user}`}
                          value={rule.user}
                          onChange={(event) => updateApprovalRule(rule.id, "user", event.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`rule-manager-${rule.id}`} className="font-medium">Manager</Label>
                        <select
                          id={`rule-manager-${rule.id}`}
                          aria-label={`Manager for rule ${rule.id}`}
                          value={rule.manager}
                          onChange={(event) => updateApprovalRule(rule.id, "manager", event.target.value)}
                          className={SELECT_STYLE + " mt-1"}
                        >
                          {MANAGER_OPTIONS.map((manager) => (
                            <option key={manager} value={manager}>
                              {manager}
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Dynamic dropdown. Initially the manager set on user record should be set, admin can change manager for approval if required.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor={`rule-desc-${rule.id}`} className="font-medium">Description about rules</Label>
                        <Input
                          id={`rule-desc-${rule.id}`}
                          aria-label="Rule description"
                          value={rule.ruleDescription}
                          onChange={(event) => updateApprovalRule(rule.id, "ruleDescription", event.target.value)}
                          placeholder="e.g., Approval rule for miscellaneous expenses"
                          className="mt-1"
                        />
                      </div>

                      <div className="mt-6 rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                        <div className="mb-3 flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={`manager-approver-${rule.id}`}
                            aria-label="Is manager an approver"
                            checked={rule.isManagerApprover}
                            onChange={(event) => updateApprovalRule(rule.id, "isManagerApprover", event.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-2 focus:ring-amber-500 dark:border-slate-600"
                          />
                          <Label htmlFor={`manager-approver-${rule.id}`} className="mb-0 text-sm font-medium">
                            Is manager an approver?
                          </Label>
                        </div>
                        <p className="text-xs text-amber-900 dark:text-amber-200">
                          If this field is checked then by default the approval request would go to his/her manager first. Before going to other approvers.
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Approvers */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Approvers</h3>

                      <div className="space-y-2">
                        {rule.approvers.map((approver, index) => (
                          <div
                            key={approver.id}
                            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                              {index + 1}
                            </span>
                            <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                              {approver.name}
                            </span>
                            <input
                              type="checkbox"
                              id={`approver-required-${rule.id}-${approver.id}`}
                              aria-label={`${approver.name} is required`}
                              checked={approver.isRequired}
                              onChange={(event) =>
                                updateApproverRequired(rule.id, approver.id, event.target.checked)
                              }
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600"
                            />
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              approver.isRequired
                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                            }`}>
                              {approver.isRequired ? "Required" : "Optional"}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 space-y-4 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/20">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={`sequential-${rule.id}`}
                            aria-label="Approvers sequence"
                            checked={rule.approvalsSequential}
                            onChange={(event) => updateApprovalRule(rule.id, "approvalsSequential", event.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600"
                          />
                          <div>
                            <Label htmlFor={`sequential-${rule.id}`} className="mb-1 block text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                              Approvers Sequence
                            </Label>
                            <p className="text-xs text-indigo-800 dark:text-indigo-200">
                              If this field is ticked true then the above mentioned sequence of approvers matters, that is First the request goes to John, if he approves/rejects then only request goes to mitchell and so on.
                            </p>
                            <p className="mt-2 text-xs font-medium text-indigo-800 dark:text-indigo-200">
                              If the required approver rejects the request, then expense request is auto-rejected. If not ticked then send approver request to all approvers at the same time.
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-indigo-200 pt-4 dark:border-indigo-900/50">
                          <Label htmlFor={`min-approval-${rule.id}`} className="mb-2 block text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                            Minimum Approval Percentage
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id={`min-approval-${rule.id}`}
                              aria-label="Minimum approval percentage"
                              type="number"
                              min="0"
                              max="100"
                              value={rule.minimumApprovalPercentage}
                              onChange={(event) => updateApprovalRule(rule.id, "minimumApprovalPercentage", event.target.value)}
                              placeholder="50"
                              className="w-20"
                            />
                            <span className="flex items-center text-sm font-semibold text-indigo-900 dark:text-indigo-100">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
