import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingDown, TrendingUp, Zap } from "lucide-react";

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

function formatPeso(value) {
  return peso.format(Number(value || 0));
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

export default function CmaRecommendationCard({
  valuation,
  isLoading = false,
  onApplyRecommended,
  showApplyButton = false,
  title = "CMA Price Recommendation",
}) {
  if (!valuation) return null;

  const demandScore = Number(valuation?.adjustments?.demand_score || 0);
  const hasComparables = Array.isArray(valuation?.comparables) && valuation.comparables.length > 0;

  return (
    <Card className="overflow-hidden border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader className="border-b border-primary/10 bg-primary/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
        </div>
        <CardDescription>System recommendation only. You still decide the final asking price.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommended Price</p>
            <p className="text-3xl font-black text-primary">{formatPeso(valuation.recommended_price)}</p>
            <p className="text-sm text-muted-foreground">
              Price per sqm: <span className="font-semibold text-foreground">{formatPeso(valuation.price_per_sqm)}</span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested Band</p>
            <p className="text-lg font-bold text-foreground">
              {formatPeso(valuation?.suggested_range?.min)} - {formatPeso(valuation?.suggested_range?.max)}
            </p>
            {showApplyButton && onApplyRecommended && (
              <Button type="button" variant="outline" size="sm" onClick={onApplyRecommended}>
                Use Suggested Price
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border bg-background p-3">
            <p className="text-xs text-muted-foreground">Condition</p>
            <p className="font-semibold text-foreground">x{Number(valuation?.adjustments?.condition || 1).toFixed(2)}</p>
          </div>
          <div className="rounded-lg border bg-background p-3">
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="font-semibold text-foreground">x{Number(valuation?.adjustments?.location || 1).toFixed(2)}</p>
          </div>
          <div className="rounded-lg border bg-background p-3">
            <p className="text-xs text-muted-foreground">Amenities</p>
            <p className="font-semibold text-foreground">{formatPeso(valuation?.adjustments?.amenity_impact)}</p>
          </div>
          <div className={`rounded-lg border p-3 ${demandScore >= 0 ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
            <p className="text-xs text-muted-foreground">Demand</p>
            <p className="flex items-center gap-1 font-semibold text-foreground">
              {demandScore >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> : <TrendingDown className="h-3.5 w-3.5 text-amber-700" />}
              {formatPercent(demandScore)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why this recommendation</p>
          <p className="text-sm text-muted-foreground">{valuation.explanation}</p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comparables</p>
          {hasComparables ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {valuation.comparables.map((comp) => (
                <div key={comp.id} className="rounded-lg border bg-background p-3">
                  <p className="truncate text-xs font-semibold text-foreground">{comp.name}</p>
                  <p className="text-sm font-bold text-primary">{formatPeso(comp.price)}</p>
                  <p className="text-xs text-muted-foreground">{comp.sqm} sqm</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border bg-background p-3 text-sm text-muted-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>No close comparables found yet. Recommendation is based on baseline area rates and modifiers.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
