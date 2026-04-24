import clsx from "clsx";
import type { HTMLAttributes, PropsWithChildren } from "react";

export const Card = ({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
  <div
    className={clsx(
      "rounded-xl border border-zinc-800 bg-zinc-950/90 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

