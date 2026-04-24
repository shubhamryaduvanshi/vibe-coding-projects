import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Modal = ({ open, title, onClose, footer, children }) => {
    if (!open) {
        return null;
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4", children: _jsxs("div", { className: "w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-zinc-800 px-6 py-4", children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: title }), _jsx("button", { className: "text-zinc-400 hover:text-white", onClick: onClose, children: "Close" })] }), _jsx("div", { className: "max-h-[70vh] overflow-y-auto px-6 py-5", children: children }), footer ? (_jsx("div", { className: "border-t border-zinc-800 px-6 py-4", children: footer })) : null] }) }));
};
