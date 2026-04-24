import type { PropsWithChildren, ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
}

export const Modal = ({
  open,
  title,
  onClose,
  footer,
  children
}: PropsWithChildren<ModalProps>) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button className="text-zinc-400 hover:text-white" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <div className="border-t border-zinc-800 px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
};

