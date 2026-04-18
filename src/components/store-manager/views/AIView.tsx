// AI view: just renders the streaming AI briefing rows.
import type { BranchFullReport } from "@/data/hadera-real";
import { StoreAIBriefing } from "@/components/store-manager/StoreAIBriefing";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";

export interface AIViewProps {
  report: BranchFullReport;
  branchId: string;
}

export function AIView({ report, branchId }: AIViewProps) {
  const { rows, isLoading, isStreaming, error, retry } = useAIAnalysis(
    branchId,
    report
  );
  return (
    <StoreAIBriefing
      rows={rows}
      isLoading={isLoading}
      isStreaming={isStreaming}
      error={error}
      onRetry={retry}
    />
  );
}
