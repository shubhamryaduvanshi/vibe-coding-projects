import { jsx as _jsx } from "react/jsx-runtime";
import clsx from "clsx";
export const Tabs = ({ value, items, onChange }) => (_jsx("div", { className: "inline-flex rounded-lg border border-zinc-800 bg-black p-1", children: items.map((item) => (_jsx("button", { className: clsx("rounded-md px-3 py-2 text-sm transition", value === item.value
            ? "bg-red-600 text-white"
            : "text-zinc-400 hover:text-white"), onClick: () => onChange(item.value), type: "button", children: item.label }, item.value))) }));
