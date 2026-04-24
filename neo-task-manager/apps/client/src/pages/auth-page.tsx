import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input } from "@neo/ui";
import { login, register } from "../api/auth";
import { useAuthStore } from "../features/auth/auth-store";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const mutation = useMutation({
    mutationFn: async () =>
      mode === "login"
        ? login({ email: form.email, password: form.password })
        : register(form),
    onSuccess: ({ user }) => {
      setUser(user);
      navigate("/board");
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-soft">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.4em] text-red-500">Jira-style SaaS</div>
          <h1 className="mt-2 text-3xl font-semibold">neoTaskManager</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Shared team board, realtime updates, and reporting in one dark workspace.
          </p>
        </div>

        <div className="mb-4 flex gap-2">
          <Button
            variant={mode === "login" ? "primary" : "secondary"}
            className="flex-1"
            onClick={() => setMode("login")}
          >
            Login
          </Button>
          <Button
            variant={mode === "register" ? "primary" : "secondary"}
            className="flex-1"
            onClick={() => setMode("register")}
          >
            Register
          </Button>
        </div>

        <div className="space-y-3">
          {mode === "register" ? (
            <Input
              placeholder="Full name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          ) : null}
          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          <Button className="w-full" onClick={() => mutation.mutate()}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

