import type { Metadata } from "next";
import ExcalidrawClient from "@/components/ExcalidrawClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata: Metadata = {
  title: "Whiteboard - DevWiz",
  description: "An infinite canvas whiteboard powered by Excalidraw.",
  openGraph: {
    images: [
      {
        url: "/api/og?template=tool&tool=Whiteboard&subtitle=Infinite+canvas+powered+by+Excalidraw",
        width: 1200,
        height: 630,
        alt: "Whiteboard - DevWiz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      "/api/og?template=tool&tool=Whiteboard&subtitle=Infinite+canvas+powered+by+Excalidraw",
    ],
  },
};

export default function WhiteboardPage() {
  return (
    <ToolPageLayout>
      <ExcalidrawClient />
    </ToolPageLayout>
  );
}
