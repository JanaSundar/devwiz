import type { ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";

type ToolHeaderProps = {
  title: string;
  badge?: string;
  rightSlot?: ReactNode;
  poweredBy?: {
    label: string;
    href: string;
    icon?: ReactNode;
  };
};

export default function ToolHeader({
  title,
  badge,
  rightSlot,
  poweredBy,
}: ToolHeaderProps) {
  const poweredByLink = poweredBy ? (
    <a
      href={poweredBy.href}
      target="_blank"
      rel="noreferrer"
      className="whitespace-nowrap flex items-center gap-1 px-2 py-1 text-[9px] md:text-[10px] text-txt-muted hover:text-accent rounded-md btn-glass tr-smooth"
    >
      {poweredBy.label}
      {poweredBy.icon}
    </a>
  ) : null;

  return (
    <div className="px-4 md:px-6 py-4 border-b border-border min-w-0">
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 pl-10 md:pl-0 min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-txt truncate">
            {title}
          </h2>
          {badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/15 shrink-0">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 w-auto shrink-0 overflow-x-auto">
          <div className="hidden md:block">{poweredByLink}</div>
          <div className="flex items-center gap-2 [&_button]:text-[0px] [&_a]:text-[0px] md:[&_button]:text-xs md:[&_a]:text-xs">
            {rightSlot}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
