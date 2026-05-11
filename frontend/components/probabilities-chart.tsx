import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProbabilitiesChartProps {
  probabilities: {
    firstDegree: number
    secondDegree: number
    thirdDegree: number
  }
}

export function ProbabilitiesChart({ probabilities }: ProbabilitiesChartProps) {
  const data = [
    {
      label: "1st Degree Burn",
      value: probabilities.firstDegree,
      description: "Superficial burn",
      color: "bg-success",
    },
    {
      label: "2nd Degree Burn",
      value: probabilities.secondDegree,
      description: "Partial thickness",
      color: "bg-warning",
    },
    {
      label: "3rd Degree Burn",
      value: probabilities.thirdDegree,
      description: "Full thickness",
      color: "bg-destructive",
    },
  ]

  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart3 className="h-5 w-5 text-primary" />
          Classification Probabilities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <span className="text-lg font-bold text-foreground">
                {item.value.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
