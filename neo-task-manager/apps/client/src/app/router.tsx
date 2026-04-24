import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../components/app-shell";
import { ProtectedRoute } from "../components/protected-route";
import { AuthPage } from "../pages/auth-page";
import { BoardPage } from "../pages/board-page";
import { ReportsPage } from "../pages/reports-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/board" replace />
  },
  {
    path: "/auth",
    element: <AuthPage />
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/board",
        element: <BoardPage />
      },
      {
        path: "/reports/time",
        element: <ReportsPage />
      }
    ]
  }
]);

