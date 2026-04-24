import { jsx as _jsx } from "react/jsx-runtime";
import clsx from "clsx";
export const Input = ({ className, ...props }) => (_jsx("input", { className: clsx("w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none transition focus:border-red-500", className), ...props }));
export const TextArea = ({ className, ...props }) => (_jsx("textarea", { className: clsx("min-h-28 w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none transition focus:border-red-500", className), ...props }));
