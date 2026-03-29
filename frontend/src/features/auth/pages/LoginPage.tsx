import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { login } from "../services/authService";
import { useAuthForm } from "../hooks/useAuthForm";

export function LoginPage() {
  const { formState, updateField } = useAuthForm({ name: "", email: "", password: "", confirmPassword: "", country: "", baseCurrency: "", currencySymbol: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string; global?: string; info?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const infoMessage = (location.state as { message?: string } | null)?.message;

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!formState.email) nextErrors.email = "Email is required.";
    if (!formState.password) nextErrors.password = "Password is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const resp = await login({ email: formState.email, password: formState.password });
      localStorage.setItem("accessToken", resp.tokens.accessToken);
      localStorage.setItem("refreshToken", resp.tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(resp.user));
      const role = resp.user.role?.toUpperCase();
      if (role === "ADMIN") {
        navigate("/admin-dashboard", { replace: true });
      } else if (role === "MANAGER") {
        navigate("/manager-dashboard", { replace: true });
      } else {
        navigate("/expenses", { replace: true });
      }
    } catch (error) {
      setErrors({ global: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card title="Login">
        <form onSubmit={handleSubmit} className="space-y-4">
          {infoMessage ? <p className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">{infoMessage}</p> : null}
          {errors.global ? <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-700 dark:bg-rose-900 dark:text-rose-200">{errors.global}</p> : null}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formState.email}
              onChange={(event) => updateField("email", event.target.value)}
              error={errors.email}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formState.password}
              onChange={(event) => updateField("password", event.target.value)}
              error={errors.password}
            />
          </div>

          <Button type="submit" isLoading={isLoading}>
            Login
          </Button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-300">
            New? <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200">Create an account</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
