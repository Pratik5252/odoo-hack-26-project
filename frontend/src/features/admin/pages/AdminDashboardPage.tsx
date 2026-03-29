import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Dialog } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  createTeamUser,
  fetchTeamUsers,
  sendUserPassword,
  type ManagerOption,
  type TeamUser,
} from "../services/adminApi";
import { LogoutButton } from "../../../components/layout/LogoutButton";
import { useAuth } from "../../auth/context/AuthContext";

type Role = "Manager" | "Employee";

interface UserRow {
  id: string;
  user: string;
  role: Role;
  /** Selected manager user id, or null for “No manager” */
  managerId: string | null;
  email: string;
  passwordSent?: boolean;
}

interface Approver {
  id: string;
  name: string;
  isRequired: boolean;
}

interface ApprovalRule {
  id: string;
  userId: string;
  user: string;
  ruleDescription: string;
  managerId: string | null;
  isManagerApprover: boolean;
  approvers: Approver[];
  approvalsSequential: boolean;
  minimumApprovalPercentage: string;
}

const ROLE_OPTIONS: Role[] = ["Manager", "Employee"];
const SELECT_STYLE =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

const INITIAL_APPROVAL_RULES: ApprovalRule[] = [];

function createDefaultApprovalRule(user: UserRow): ApprovalRule {
  return {
    id: `rule-${Date.now()}`,
    userId: user.id,
    user: user.user,
    ruleDescription: "",
    managerId: user.managerId,
    isManagerApprover: false,
    approvers: [],
    approvalsSequential: false,
    minimumApprovalPercentage: "50",
  };
}

function formatManagerOption(m: ManagerOption): string {
  return m.name?.trim() || m.email;
}

function mapTeamUserToRow(u: TeamUser): UserRow {
  return {
    id: u.id,
    user: u.name?.trim() || u.email.split("@")[0] || u.email,
    role: u.role === "MANAGER" ? "Manager" : "Employee",
    managerId: u.managerId,
    email: u.email,
  };
}

export function AdminDashboardPage() {
  const { accessToken } = useAuth();
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [teamLoadError, setTeamLoadError] = useState<string | null>(null);

  const managers = useMemo((): ManagerOption[] => {
    return teamUsers
      .filter((u) => u.role === "MANAGER")
      .map((u) => ({ id: u.id, name: u.name, email: u.email }));
  }, [teamUsers]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>(INITIAL_APPROVAL_RULES);
  const [approvalModalUserId, setApprovalModalUserId] = useState<string | null>(null);
  const [sendingPasswordUserId, setSendingPasswordUserId] = useState<string | null>(null);
  const [sendPasswordError, setSendPasswordError] = useState<string | null>(null);
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUser, setNewUser] = useState<UserRow>({
    id: "new-row",
    user: "",
    role: "Employee",
    managerId: null,
    email: "",
  });

  useEffect(() => {
    if (!accessToken) {
      setUsersLoading(false);
      return;
    }

    let cancelled = false;
    setTeamLoadError(null);
    setUsersLoading(true);

    void (async () => {
      try {
        const list = await fetchTeamUsers(accessToken);
        if (cancelled) return;
        setTeamUsers(list);
        setUsers(list.map(mapTeamUserToRow));
      } catch (e) {
        if (!cancelled) {
          setTeamLoadError(e instanceof Error ? e.message : "Could not load users.");
          setTeamUsers([]);
          setUsers([]);
        }
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const canAddUser = useMemo(() => {
    const hasBasics =
      newUser.user.trim() !== "" && newUser.email.trim() !== "" && newUserPassword.length >= 8;
    if (!hasBasics) return false;
    if (newUser.role === "Employee") {
      return Boolean(newUser.managerId);
    }
    return true;
  }, [newUser.email, newUser.managerId, newUser.role, newUser.user, newUserPassword.length]);

  const activeRule = useMemo(
    () => approvalRules.find((r) => r.userId === approvalModalUserId) ?? null,
    [approvalRules, approvalModalUserId]
  );

  const updateExistingUser = (id: string, field: "user" | "role" | "managerId" | "email", value: string | null) => {
    setUsers((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleAddUser = async () => {
    if (!canAddUser || !accessToken) return;

    setCreateUserError(null);
    setCreatingUser(true);
    try {
      await createTeamUser(accessToken, {
        email: newUser.email.trim(),
        name: newUser.user.trim(),
        password: newUserPassword,
        role: newUser.role === "Manager" ? "MANAGER" : "EMPLOYEE",
        managerId: newUser.role === "Employee" ? newUser.managerId : null,
      });
      const list = await fetchTeamUsers(accessToken);
      setTeamUsers(list);
      setUsers(list.map(mapTeamUserToRow));
      setNewUser({
        id: "new-row",
        user: "",
        role: "Employee",
        managerId: null,
        email: "",
      });
      setNewUserPassword("");
      setShowAddUser(false);
    } catch (e) {
      setCreateUserError(e instanceof Error ? e.message : "Failed to create user.");
    } finally {
      setCreatingUser(false);
    }
  };

  const openApprovalModal = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setApprovalRules((prev) => {
      const exists = prev.some((r) => r.userId === userId);
      if (exists) {
        return prev.map((r) =>
          r.userId === userId ? { ...r, user: user.user, managerId: user.managerId } : r
        );
      }
      return [...prev, createDefaultApprovalRule(user)];
    });
    setApprovalModalUserId(userId);
  };

  const markPasswordSent = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, passwordSent: true } : u))
    );
  };

  const handleSendPassword = async (row: UserRow) => {
    const email = row.email.trim();
    if (!email) {
      setSendPasswordError("Add an email for this user before sending a password.");
      return;
    }

    setSendPasswordError(null);
    setSendingPasswordUserId(row.id);
    try {
      await sendUserPassword(email);
      markPasswordSent(row.id);
    } catch (err) {
      setSendPasswordError(err instanceof Error ? err.message : "Could not send password.");
    } finally {
      setSendingPasswordUserId(null);
    }
  };

  const updateApprovalRule = (ruleId: string, field: keyof ApprovalRule, value: unknown) => {
    setApprovalRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, [field]: value } : rule))
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

  const renderApprovalRuleForm = (rule: ApprovalRule) => (
    <div className="grid gap-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700 lg:grid-cols-2 lg:p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Rule Configuration</h3>

        <div>
          <Label htmlFor={`rule-user-${rule.id}`} className="font-medium">
            User
          </Label>
          <Input
            id={`rule-user-${rule.id}`}
            aria-label={`Approval rule user ${rule.user}`}
            value={rule.user}
            onChange={(event) => updateApprovalRule(rule.id, "user", event.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`rule-manager-${rule.id}`} className="font-medium">
            Manager
          </Label>
          <select
            id={`rule-manager-${rule.id}`}
            aria-label={`Manager for rule ${rule.id}`}
            value={rule.managerId ?? ""}
            onChange={(event) => {
              const v = event.target.value;
              updateApprovalRule(rule.id, "managerId", v === "" ? null : v);
            }}
            className={SELECT_STYLE + " mt-1"}
          >
            <option value="">No manager</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {formatManagerOption(m)}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Dynamic dropdown. Initially the manager set on user record should be set, admin can change manager for
            approval if required.
          </p>
        </div>

        <div>
          <Label htmlFor={`rule-desc-${rule.id}`} className="font-medium">
            Description about rules
          </Label>
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
            If this field is checked then by default the approval request would go to his/her manager first. Before
            going to other approvers.
          </p>
        </div>
      </div>

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
              <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">{approver.name}</span>
              <input
                type="checkbox"
                id={`approver-required-${rule.id}-${approver.id}`}
                aria-label={`${approver.name} is required`}
                checked={approver.isRequired}
                onChange={(event) => updateApproverRequired(rule.id, approver.id, event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600"
              />
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  approver.isRequired
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
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
              <Label
                htmlFor={`sequential-${rule.id}`}
                className="mb-1 block text-sm font-semibold text-indigo-900 dark:text-indigo-100"
              >
                Approvers Sequence
              </Label>
              <p className="text-xs text-indigo-800 dark:text-indigo-200">
                If this field is ticked true then the above mentioned sequence of approvers matters, that is First the
                request goes to John, if he approves/rejects then only request goes to mitchell and so on.
              </p>
              <p className="mt-2 text-xs font-medium text-indigo-800 dark:text-indigo-200">
                If the required approver rejects the request, then expense request is auto-rejected. If not ticked then
                send approver request to all approvers at the same time.
              </p>
            </div>
          </div>

          <div className="border-t border-indigo-200 pt-4 dark:border-indigo-900/50">
            <Label
              htmlFor={`min-approval-${rule.id}`}
              className="mb-2 block text-sm font-semibold text-indigo-900 dark:text-indigo-100"
            >
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
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Card className="max-w-none bg-white/95 backdrop-blur dark:bg-slate-900/95">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-[30px]">Admin Dashboard</h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300 sm:text-sm">Manage users, roles, and approval rules.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                System Admin
              </span>
              <LogoutButton />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <div className="flex gap-3">
            <Button type="button" onClick={() => setShowAddUser(!showAddUser)} className="sm:w-auto">
              {showAddUser ? "✕ Cancel" : "+ Add User"}
            </Button>
          </div>

          {showAddUser && (
            <Card title="Add New User" className="max-w-none border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-800 dark:from-indigo-950 dark:to-slate-900">
              {createUserError ? (
                <p
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                  role="alert"
                >
                  {createUserError}
                </p>
              ) : null}
              {teamLoadError ? (
                <p
                  className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
                  role="alert"
                >
                  {teamLoadError}
                </p>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                    onChange={(event) => {
                      const role = event.target.value as Role;
                      setNewUser((prev) => ({
                        ...prev,
                        role,
                        managerId: role === "Manager" ? null : prev.managerId,
                      }));
                    }}
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

                {newUser.role === "Employee" ? (
                  <div>
                    <Label htmlFor="new-user-manager">Manager</Label>
                    <select
                      id="new-user-manager"
                      aria-label="New user manager"
                      value={newUser.managerId ?? ""}
                      onChange={(event) => {
                        const v = event.target.value;
                        setNewUser((prev) => ({ ...prev, managerId: v === "" ? null : v }));
                      }}
                      className={SELECT_STYLE}
                    >
                      <option value="">Select a manager</option>
                      {managers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {formatManagerOption(m)}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Required for employees.</p>
                  </div>
                ) : null}

                <div className={newUser.role === "Employee" ? "" : "md:col-span-2"}>
                  <Label htmlFor="new-user-password">Temporary password</Label>
                  <Input
                    id="new-user-password"
                    aria-label="New user password"
                    type="password"
                    autoComplete="new-password"
                    value={newUserPassword}
                    onChange={(event) => setNewUserPassword(event.target.value)}
                    placeholder="At least 8 characters"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Stored securely; share via “Send password” if you prefer email delivery.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  onClick={() => void handleAddUser()}
                  disabled={!canAddUser || creatingUser}
                  isLoading={creatingUser}
                  className="sm:w-auto"
                >
                  Create User
                </Button>
              </div>
            </Card>
          )}

          <Card title="Users" className="max-w-none">
            {teamLoadError && (
              <p
                className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
                role="alert"
              >
                {teamLoadError}
              </p>
            )}
            {sendPasswordError && (
              <p
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                role="alert"
              >
                {sendPasswordError}
              </p>
            )}
            {usersLoading ? (
              <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading users…</p>
            ) : null}
            {!usersLoading && (
              <>
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
                          value={item.managerId ?? ""}
                          onChange={(event) => {
                            const v = event.target.value;
                            updateExistingUser(item.id, "managerId", v === "" ? null : v);
                          }}
                          className={SELECT_STYLE}
                        >
                          <option value="">No manager</option>
                          {managers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {formatManagerOption(m)}
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
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            className="!bg-transparent !text-indigo-700 border border-indigo-300 hover:!bg-indigo-50 dark:border-indigo-600 dark:!text-indigo-200 dark:hover:!bg-indigo-950/50 text-xs sm:w-auto"
                            onClick={() => openApprovalModal(item.id)}
                          >
                            Approval Rules
                          </Button>
                          {!item.passwordSent && (
                            <Button
                              type="button"
                              className="text-xs sm:w-auto"
                              disabled={sendingPasswordUserId === item.id}
                              onClick={() => void handleSendPassword(item)}
                            >
                              {sendingPasswordUserId === item.id ? "Sending…" : "Send password"}
                            </Button>
                          )}
                        </div>
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
                        value={item.managerId ?? ""}
                        onChange={(event) => {
                          const v = event.target.value;
                          updateExistingUser(item.id, "managerId", v === "" ? null : v);
                        }}
                        className={SELECT_STYLE}
                      >
                        <option value="">No manager</option>
                        {managers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {formatManagerOption(m)}
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

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="!bg-transparent !text-indigo-700 border border-indigo-300 hover:!bg-indigo-50 dark:border-indigo-600 dark:!text-indigo-200 dark:hover:!bg-indigo-950/50"
                      onClick={() => openApprovalModal(item.id)}
                    >
                      Approval Rules
                    </Button>
                    {!item.passwordSent && (
                      <Button
                        type="button"
                        disabled={sendingPasswordUserId === item.id}
                        onClick={() => void handleSendPassword(item)}
                      >
                        {sendingPasswordUserId === item.id ? "Sending…" : "Send password"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
              </>
            )}
          </Card>
        </div>
      </div>

      <Dialog
        isOpen={approvalModalUserId !== null && activeRule !== null}
        onClose={() => setApprovalModalUserId(null)}
        title="Approval Rules"
        panelClassName="max-w-5xl"
      >
        {activeRule && renderApprovalRuleForm(activeRule)}
      </Dialog>
    </div>
  );
}
