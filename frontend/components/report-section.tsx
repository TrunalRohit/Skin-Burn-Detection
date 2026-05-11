"use client"

import { FileText, Download, Image, TrendingUp, Stethoscope, MapPin, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PredictionData } from "@/app/app/page"

interface ReportSectionProps {
  prediction: PredictionData
  isLoading?: boolean
  onDownload: () => void
}

export function ReportSection({ prediction, isLoading, onDownload }: ReportSectionProps) {
  const reportItems = [
    { icon: Image, label: "Uploaded burn image", included: true },
    { icon: TrendingUp, label: "Burn degree classification", included: true },
    { icon: TrendingUp, label: "Confidence analysis", included: true },
    { icon: Stethoscope, label: "Medical guidance", included: true },
    { icon: MapPin, label: "Nearby specialist summary", included: true },
  ]

  return (
    <Card className="shadow-lg border-0 bg-card" id="report">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-primary" />
          Analysis Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Summary */}
        <div className="rounded-2xl bg-muted/30 p-4 space-y-4">
          <h4 className="font-semibold text-foreground">Report Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Burn Type
              </p>
              <p className="font-semibold text-foreground mt-1">
                {prediction.burnDegree}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Confidence
              </p>
              <p className="font-semibold text-foreground mt-1">
                {prediction.confidence}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Risk Level
              </p>
              <p
                className={`font-semibold mt-1 capitalize ${
                  prediction.riskLevel === "low"
                    ? "text-success"
                    : prediction.riskLevel === "moderate"
                    ? "text-warning-foreground"
                    : "text-destructive"
                }`}
              >
                {prediction.riskLevel}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Date
              </p>
              <p className="font-semibold text-foreground mt-1">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Report includes:
          </h4>
          <div className="space-y-2">
            {reportItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-sm"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                  <Check className="h-3.5 w-3.5 text-success" />
                </div>
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Download Button */}
        <Button
          onClick={onDownload}
          className="w-full gap-2"
          size="lg"
          disabled={isLoading}
        >
          <Download className="h-5 w-5" />
          {isLoading ? "Generating PDF…" : "Download Report (PDF)"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Report is generated from your latest analysis and ready to save.
        </p>
      </CardContent>
    </Card>
  )
}
