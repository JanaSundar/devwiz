import type { Metadata } from "next";
import TransformClient from "@/components/TransformClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";
import { constructMetadata } from "@/lib/metadata";
import { getTransformById } from "@/lib/registry";

type Props = {
  params: Promise<{ toolId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { toolId } = await params;
  const tool = getTransformById(toolId);

  if (!tool) return constructMetadata();

  return constructMetadata({
    title: tool.name,
    description:
      tool.placeholder ||
      `Transform ${tool.inputLang} to ${tool.outputLang} instantly.`,
    toolId: tool.id,
  });
}

export default function TransformPage() {
  return (
    <ToolPageLayout>
      <TransformClient />
    </ToolPageLayout>
  );
}
