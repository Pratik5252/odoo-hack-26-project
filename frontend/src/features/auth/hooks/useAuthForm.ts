import { useState } from "react";

export interface AuthFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  baseCurrency: string;
  currencySymbol: string;
}

export function useAuthForm(initialState: AuthFormState = { name: "", email: "", password: "", confirmPassword: "", country: "", baseCurrency: "", currencySymbol: "" }) {
  const [formState, setFormState] = useState<AuthFormState>(initialState);

  const updateField = (field: keyof AuthFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormState(initialState);
  };

  return { formState, updateField, resetForm };
}
