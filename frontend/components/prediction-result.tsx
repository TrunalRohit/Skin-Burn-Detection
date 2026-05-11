import { AlertTriangle, CheckCircle, AlertOctagon, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PredictionData } from "@/app/app/page"

interface PredictionResultProps {
  prediction: PredictionData
}

export function PredictionResult({ prediction }: PredictionResultProps) {
  const getRiskStyles = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return {
          bg: "bg-success/10",
          border: "border-success/30",
          text: "text-success",
          icon: CheckCircle,
          label: "Low Risk",
        }
      case "moderate":
        return {
          bg: "bg-warning/10",
          border: "border-warning/30",
          text: "text-warning-foreground",
          icon: AlertTriangle,
          label: "Moderate Risk",
        }
      case "high":
        return {
          bg: "bg-destructive/10",
          border: "border-destructive/30",
          text: "text-destructive",
          icon: AlertOctagon,
          label: "High Risk",
        }
      default:
        return {
          bg: "bg-muted",
          border: "border-border",
          text: "text-foreground",
          icon: CheckCircle,
          label: "Unknown",
        }
    }
  }

  const riskStyles = getRiskStyles(prediction.riskLevel)
  const RiskIcon = riskStyles.icon

  return (
    <Card className="shadow-lg border-0 bg-card overflow-hidden">
      <div className={`h-1.5 w-full ${
        prediction.riskLevel === "low" ? "bg-success" :
        prediction.riskLevel === "moderate" ? "bg-warning" : "bg-destructive"
      }`} />
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="h-5 w-5 text-primary" />
          Analysis Result
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Burn Degree */}
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Detected Burn Type
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {prediction.burnDegree}
          </p>
        </div>

        {/* Risk Level Badge */}
        <div className="flex justify-center">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${riskStyles.bg} ${riskStyles.border}`}
          >
            <RiskIcon className={`h-5 w-5 ${riskStyles.text}`} />
            <span className={`font-semibold ${riskStyles.text}`}>
              {riskStyles.label}
            </span>
          </div>
        </div>

        {/* Confidence */}
        <div className="rounded-2xl bg-muted/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Confidence Level
            </span>
            <span className="text-lg font-bold text-primary">
              {prediction.confidence}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000"
              style={{ width: `${prediction.confidence}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
