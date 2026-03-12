import ToolPageLayout from "@/components/tooling/ToolPageLayout";
import UnitConverterClient from "@/components/UnitConverterClient";

export const metadata = {
  title: "Unit Converter - DevWiz",
  description:
    "Convert between length, weight, temperature, time, and data size units.",
};

export default function UnitConverterPage() {
  return (
    <ToolPageLayout>
      <UnitConverterClient />
    </ToolPageLayout>
  );
}
