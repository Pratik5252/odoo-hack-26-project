import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../features/auth/context/AuthContext";

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      className="w-auto border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      onClick={() => {
        logout();
        navigate("/login", { replace: true });
      }}
    >
      Log out
    </Button>
  );
}
