import type { ReactNode } from "react";

type ToolPageLayoutProps = {
  children: ReactNode;
};

export default function ToolPageLayout({ children }: ToolPageLayoutProps) {
  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {children}
    </main>
  );
}
