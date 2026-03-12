import DateUtilitiesClient from "@/components/DateUtilitiesClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "Date Utilities - DevWiz",
  description:
    "Format, add/subtract, compare dates, and get boundaries using date-fns.",
};

export default function DateUtilitiesPage() {
  return (
    <ToolPageLayout>
      <DateUtilitiesClient />
    </ToolPageLayout>
  );
}
