import Link from "next/link";
import { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { LucideIcon, Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "danger" | "dangerSolid" | "ghost";
type Size = "sm" | "md";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps & {
  href: string;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-2 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
};

const variantStyle: Record<Variant, { className: string; style?: CSSProperties }> = {
  primary: {
    className: "text-white shadow-sm hover:shadow-md",
    style: { backgroundColor: "var(--brand-primary)" },
  },
  secondary: {
    className:
      "border text-[var(--text-secondary)] hover:bg-[var(--surface-1)] bg-[var(--surface-2)]",
    style: { borderColor: "var(--border-hairline)" },
  },
  danger: {
    className: "border hover:bg-[var(--status-critical-soft)]",
    style: { borderColor: "var(--status-critical)", color: "var(--status-critical)" },
  },
  dangerSolid: {
    className: "text-white shadow-sm hover:shadow-md",
    style: { backgroundColor: "var(--status-critical)" },
  },
  ghost: {
    className: "text-[var(--text-secondary)] hover:bg-[var(--surface-1)]",
  },
};

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    icon: Icon,
    loading = false,
    fullWidth = false,
    children,
    className = "",
  } = props;

  const styleConfig = variantStyle[variant];
  const composedClassName = [
    "inline-flex items-center justify-center rounded-lg font-semibold transition disabled:opacity-60 disabled:pointer-events-none",
    sizeClass[size],
    styleConfig.className,
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {children}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={composedClassName} style={styleConfig.style}>
        {content}
      </Link>
    );
  }

  // Strip the styling-only props before spreading the rest onto the native <button> element.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _variant, size: _size, icon: _icon, loading: _loading, fullWidth: _fullWidth, children: _children, className: _className, href: _href, ...nativeButtonProps } = props as ButtonAsButton;

  return (
    <button
      {...nativeButtonProps}
      disabled={nativeButtonProps.disabled || loading}
      className={composedClassName}
      style={styleConfig.style}
    >
      {content}
    </button>
  );
}
