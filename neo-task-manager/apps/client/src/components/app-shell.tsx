import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@neo/ui";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../api/auth";
import { useAuthStore } from "../features/auth/auth-store";

export const AppShell = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setUser(null);
      navigate("/auth");
    }
  });

  return (
    <div className="min-h-screen bg-board-grid bg-board-grid">
      <header className="sticky top-0 z-20 border-b border-zinc-900 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-red-500">
              Shared Delivery Board
            </div>
            <h1 className="text-2xl font-semibold text-white">neoTaskManager</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-400 md:inline">
              Signed in as {user?.name}
            </span>
            <Button variant="secondary" onClick={() => navigate("/board")}>
              Board
            </Button>
            <Button variant="secondary" onClick={() => navigate("/reports/time")}>
              Reports
            </Button>
            <Button onClick={() => logoutMutation.mutate()}>Logout</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

