import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { signup } from "../services/authService";
import { useAuthForm } from "../hooks/useAuthForm";

interface CountryOption {
  label: string;
  value: string;
}

export function SignupPage() {
  const { formState, updateField } = useAuthForm({ name: "", email: "", password: "", confirmPassword: "", country: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; country?: string; global?: string }>({});
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setCountriesLoading(true);
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies");
        const data = await response.json();

        const options: CountryOption[] = data
          .map((country: any) => {
            const label = country.name?.common || "Unknown";
            const currency = country.currencies ? Object.keys(country.currencies)[0] : "";
            const value = currency ? `${label} (${currency})` : label;
            return { label: value, value };
          })
          .sort((a: CountryOption, b: CountryOption) => a.label.localeCompare(b.label));

        setCountries(options);
      } catch (err) {
        console.error("Failed to load countries", err);
        setCountries([]);
      } finally {
        setCountriesLoading(false);
      }
    };

    void loadCountries();
  }, []);

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!formState.name) nextErrors.name = "Name is required.";
    if (!formState.email) nextErrors.email = "Email is required.";
    if (!formState.password) nextErrors.password = "Password is required.";
    if (!formState.confirmPassword) nextErrors.confirmPassword = "Confirm password is required.";
    if (!formState.country) nextErrors.country = "Country is required.";
    if (formState.password && formState.confirmPassword && formState.password !== formState.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const resp = await signup({ name: formState.name, email: formState.email, password: formState.password, country: formState.country });
      console.log("Signup admin user created:", resp.user);
      navigate("/", { replace: true });
    } catch (error) {
      setErrors({ global: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card title="Create account">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.global ? <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-700 dark:bg-rose-900 dark:text-rose-200">{errors.global}</p> : null}

          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formState.name}
              onChange={(event) => updateField("name", event.target.value)}
              error={errors.name}
            />
          </div>

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

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formState.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              error={errors.confirmPassword}
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              value={formState.country}
              onChange={(event) => updateField("country", event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Select a country</option>
              {countriesLoading ? <option value="">Loading countries...</option> : null}
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
            {errors.country ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.country}</p> : null}
          </div>

          <Button type="submit" isLoading={isLoading}>
            Sign up
          </Button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-300">
            Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200">Login</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
