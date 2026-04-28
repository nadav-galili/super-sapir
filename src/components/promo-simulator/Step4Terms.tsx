import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePromoTaxonomy } from "@/contexts/PromoTaxonomyContext";
import { formatCurrency } from "@/lib/format";
import type { PromoMetrics } from "@/lib/promo-simulator/calc";
import type { SliceSetter, TermsSlice } from "@/lib/promo-simulator/state";

interface Step4TermsProps {
  terms: TermsSlice;
  metrics: PromoMetrics;
  onChange: SliceSetter<TermsSlice>;
}

const LABEL = "text-[15px] font-medium text-[#4A5568] mb-1.5 block";
const INPUT_CLS =
  "flex h-10 w-full items-center rounded-[10px] border border-[#E7E0D8] bg-white px-3 py-2 text-[16px] text-[#2D3748] shadow-sm transition-colors hover:bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#DC4E59]/20 focus:border-[#DC4E59]/40";

export function Step4Terms({ terms, metrics: m, onChange }: Step4TermsProps) {
  const { promoDetails } = usePromoTaxonomy();
  const details = terms.promoType ? promoDetails[terms.promoType] : undefined;

  const conditionLabel = details?.conditionLabel ?? "תנאי";
  const conditionPlaceholder =
    details?.conditionPlaceholder ?? "למשל: ביחידה בודדת";
  const benefitLabel = details?.benefitLabel ?? "הטבה";
  const benefitPlaceholder = details?.benefitPlaceholder ?? "למשל: 25% הנחה";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border-[#E7E0D8] rounded-[16px]">
        <CardHeader>
          <CardTitle className="text-2xl text-[#2D3748]">התניה והטבה</CardTitle>
          <p className="text-lg text-[#4A5568]">
            הגדר את מנגנון המבצע ואת עומק ההטבה
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className={LABEL}>סוג מבצע נבחר</label>
            <div className="flex h-10 w-full items-center rounded-[10px] border border-[#E7E0D8] bg-[#FAF8F5] px-3 text-[16px] text-[#2D3748]">
              {terms.promoType || (
                <span className="text-[#A0AEC0]">טרם נבחר</span>
              )}
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="f-condition">
              {conditionLabel}
            </label>
            <input
              id="f-condition"
              type="text"
              value={terms.conditionText}
              onChange={(e) => onChange({ conditionText: e.target.value })}
              placeholder={conditionPlaceholder}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="f-benefit">
              {benefitLabel}
            </label>
            <input
              id="f-benefit"
              type="text"
              value={terms.benefitText}
              onChange={(e) => onChange({ benefitText: e.target.value })}
              placeholder={benefitPlaceholder}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={LABEL} htmlFor="f-discount">
                עומק הטבה / הנחה (%)
              </label>
              <span
                className="text-xl font-mono font-bold"
                style={{ color: "#2EC4D5" }}
                dir="ltr"
              >
                {terms.discountPct}%
              </span>
            </div>
            <input
              id="f-discount"
              type="range"
              min={0}
              max={50}
              step={1}
              value={terms.discountPct}
              onChange={(e) =>
                onChange({ discountPct: Number(e.target.value) })
              }
              className="w-full h-2 rounded-[5px] accent-[#2EC4D5]"
              style={{
                background: `linear-gradient(90deg, #2EC4D5 0%, #2EC4D5 ${(terms.discountPct / 50) * 100}%, #E7E0D8 ${(terms.discountPct / 50) * 100}%, #E7E0D8 100%)`,
              }}
              dir="ltr"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-[#E7E0D8] rounded-[16px]">
          <CardHeader>
            <CardTitle className="text-xl text-[#2D3748]">תרגום עסקי</CardTitle>
            <p className="text-[16px] text-[#4A5568]">
              מה המשמעות הפיננסית של הבחירה
            </p>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-[#F1EBE3]">
              <Row label="מחיר רגיל" value={formatCurrency(terms.unitPrice)} />
              <Row
                label="מחיר אפקטיבי אחרי הנחה"
                value={formatCurrency(m.effectivePrice)}
                highlight
              />
              <Row label="רווח ליחידה" value={formatCurrency(m.unitMargin)} />
              <Row label="משמעות ההטבה" value={`${terms.discountPct}% הנחה`} />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-[16px] text-[#4A5568]">{label}</dt>
      <dd
        className={`text-xl font-mono font-semibold ${highlight ? "text-[#DC4E59]" : "text-[#2D3748]"}`}
        dir="ltr"
      >
        {value}
      </dd>
    </div>
  );
}
