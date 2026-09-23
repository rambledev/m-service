interface TabItem<T extends string> {
  key: T;
  label: string;
  count?: number;
}

export default function Tabs<T extends string>({
  items,
  active,
  onChange,
}: {
  items: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div
      className="flex gap-1 rounded-xl border bg-[var(--surface-2)] p-1 shadow-sm"
      style={{ borderColor: "var(--border-hairline)" }}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: isActive ? "var(--brand-primary)" : "transparent",
              color: isActive ? "#fff" : "var(--text-secondary)",
            }}
          >
            {item.label}
            {item.count !== undefined && ` (${item.count})`}
          </button>
        );
      })}
    </div>
  );
}
