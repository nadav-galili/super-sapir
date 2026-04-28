import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StepPlaceholderProps {
  stepNumber: number;
  title: string;
  sliceNumber: number;
}

export function StepPlaceholder({
  stepNumber,
  title,
  sliceNumber,
}: StepPlaceholderProps) {
  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardHeader>
        <CardTitle className="text-2xl text-[#2D3748]">
          שלב {stepNumber} — {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg text-[#A0AEC0]">
          TODO — coming in slice {sliceNumber}
        </p>
      </CardContent>
    </Card>
  );
}
