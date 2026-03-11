import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  Gamepad2,
  Link2,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { ToolCategory } from "./registry";

type IconOptions = {
  size: number;
  className?: string;
};

const CATEGORY_ICONS: Partial<Record<ToolCategory, LucideIcon>> = {
  "AI Tools": Sparkles,
  Encoding: Link2,
  Playground: Gamepad2,
  Utilities: Wrench,
};

const DEFAULT_ICON: LucideIcon = ArrowRightLeft;

export function getCategoryIcon(category: string, options: IconOptions) {
  const { size, className } = options;
  const Icon = CATEGORY_ICONS[category as ToolCategory] ?? DEFAULT_ICON;
  return <Icon size={size} className={className} />;
}
