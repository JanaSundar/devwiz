import { ArrowRightLeft, Link2, Sparkles, Wrench } from "lucide-react";

type IconOptions = {
  size: number;
  className?: string;
};

export function getCategoryIcon(category: string, options: IconOptions) {
  const { size, className } = options;

  if (category === "AI Tools") {
    return <Sparkles size={size} className={className} />;
  }
  if (category === "Encoding") {
    return <Link2 size={size} className={className} />;
  }
  if (category === "Utilities") {
    return <Wrench size={size} className={className} />;
  }
  return <ArrowRightLeft size={size} className={className} />;
}
