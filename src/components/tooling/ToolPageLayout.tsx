import type { ReactNode } from "react";

type ToolPageLayoutProps = {
  children: ReactNode;
};

export default function ToolPageLayout({ children }: ToolPageLayoutProps) {
  return (
    <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-auto lg:overflow-hidden">
      {children}
    </main>
  );
}
