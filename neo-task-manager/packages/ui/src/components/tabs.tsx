import clsx from "clsx";

interface TabsProps<T extends string> {
  value: T;
  items: Array<{ label: string; value: T }>;
  onChange: (next: T) => void;
}

export const Tabs = <T extends string>({
  value,
  items,
  onChange
}: TabsProps<T>) => (
  <div className="inline-flex rounded-lg border border-zinc-800 bg-black p-1">
    {items.map((item) => (
      <button
        key={item.value}
        className={clsx(
          "rounded-md px-3 py-2 text-sm transition",
          value === item.value
            ? "bg-red-600 text-white"
            : "text-zinc-400 hover:text-white"
        )}
        onClick={() => onChange(item.value)}
        type="button"
      >
        {item.label}
      </button>
    ))}
  </div>
);
