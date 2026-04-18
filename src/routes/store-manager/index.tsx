// Store-manager route — thin layout shell. All view/chart logic lives
// in `src/components/store-manager/{charts,views}/`, data fetch + anomaly
// detection lives in `useStoreReport(branchId)`.
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BranchInfoBar } from "@/components/store-manager/BranchInfoBar";
import { currentMonthYear } from "@/data/constants";
import { allBranches } from "@/data/mock-branches";
import { HADERA_BRANCH_ID } from "@/data/getBranchReport";
import { useStoreReport } from "@/hooks/useStoreReport";
import { OverviewView } from "@/components/store-manager/views/OverviewView";
import { InventoryView } from "@/components/store-manager/views/InventoryView";
import { HRView } from "@/components/store-manager/views/HRView";
import { DepartmentsView } from "@/components/store-manager/views/DepartmentsView";
import { AlertsView } from "@/components/store-manager/views/AlertsView";
import { AIView } from "@/components/store-manager/views/AIView";

const branchOptions = allBranches.map((b) => ({
  value: b.id,
  label: `${b.name} #${b.branchNumber}`,
}));

const VIEW_TITLES: Record<string, string> = {
  inventory: "מלאי",
  hr: "כח אדם",
  departments: "מחלקות",
  alerts: "התראות",
  ai: "ניתוח AI",
};

function StoreManagerPage() {
  const { view } = Route.useSearch();
  const [selectedBranchId, setSelectedBranchId] = useState(HADERA_BRANCH_ID);
  const { report, anomalies } = useStoreReport(selectedBranchId);

  const renderView = () => {
    switch (view) {
      case "inventory":
        return <InventoryView report={report} />;
      case "hr":
        return <HRView report={report} />;
      case "departments":
        return <DepartmentsView report={report} anomalies={anomalies} />;
      case "alerts":
        return <AlertsView report={report} />;
      case "ai":
        return <AIView report={report} branchId={selectedBranchId} />;
      default:
        return <OverviewView report={report} branchId={selectedBranchId} />;
    }
  };

  return (
    <PageContainer key={`${selectedBranchId}-${view}`}>
      {/* Branch Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Select
            value={selectedBranchId}
            onValueChange={setSelectedBranchId}
            dir="rtl"
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="בחר סניף" />
            </SelectTrigger>
            <SelectContent>
              {branchOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs w-fit">
            {currentMonthYear()}
          </Badge>
        </div>
      </div>
      {view !== "overview" && (
        <h2 className="text-lg font-bold text-[#2D3748] text-center">
          {VIEW_TITLES[view] ?? ""}
        </h2>
      )}

      {/* Branch Info Header */}
      <BranchInfoBar info={report.info} />

      {/* View Content */}
      {renderView()}
    </PageContainer>
  );
}

export const Route = createFileRoute("/store-manager/")({
  component: StoreManagerPage,
  validateSearch: (search: Record<string, unknown>) => ({
    view: (search.view as string) || "overview",
  }),
});
