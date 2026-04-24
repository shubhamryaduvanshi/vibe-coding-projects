import { jsx as _jsx } from "react/jsx-runtime";
import clsx from "clsx";
export const Card = ({ children, className, ...props }) => (_jsx("div", { className: clsx("rounded-xl border border-zinc-800 bg-zinc-950/90 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]", className), ...props, children: children }));
