import { jsx as _jsx } from "react/jsx-runtime";
import clsx from "clsx";
export const Button = ({ children, className, variant = "primary", ...props }) => (_jsx("button", { className: clsx("inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60", variant === "primary" &&
        "border-red-600 bg-red-600 text-white hover:bg-red-500", variant === "secondary" &&
        "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800", variant === "ghost" &&
        "border-transparent bg-transparent text-zinc-200 hover:bg-zinc-900", className), ...props, children: children }));
