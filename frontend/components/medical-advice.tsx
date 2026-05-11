"use client"

import { useState } from "react"
import {
  Stethoscope,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  AlertTriangle,
  Droplets,
  Thermometer,
  Bandage,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MedicalAdviceProps {
  burnDegree?: string
  advice?: string
}

const adviceData = {
  firstAid: [
    {
      icon: Droplets,
      title: "Cool the burn",
      description:
        "Run cool (not cold) water over the burn for 10-20 minutes. Do not use ice, as it can cause frostbite.",
    },
    {
      icon: Bandage,
      title: "Cover the burn",
      description:
        "Apply a sterile, non-fluffy dressing or clean cloth. Do not break any blisters that form.",
    },
    {
      icon: Thermometer,
      title: "Protect from infection",
      description:
        "Keep the burn clean and dry. Apply antibiotic ointment if available and change dressing daily.",
    },
  ],
  burnTypes: [
    {
      degree: "1st Degree Burn",
      severity: "Mild",
      severityColor: "text-success",
      description: "Affects only the outer layer (epidermis). Causes redness, minor swelling, and pain.",
      treatment: "Cool water, aloe vera, over-the-counter pain relievers. Usually heals within 7-10 days.",
      seekHelp: "Seek help if: covers a large area, affects face/joints, or symptoms worsen.",
    },
    {
      degree: "2nd Degree Burn",
      severity: "Moderate",
      severityColor: "text-warning-foreground",
      description: "Affects epidermis and part of dermis. Causes blistering, severe pain, and redness.",
      treatment: "Cool water, do not pop blisters, keep clean and covered. May need medical attention.",
      seekHelp: "Seek help if: larger than 3 inches, on face/hands/feet/groin, shows signs of infection.",
    },
    {
      degree: "3rd Degree Burn",
      severity: "Severe",
      severityColor: "text-destructive",
      description: "Destroys full thickness of skin. May appear white, brown, or black. Little to no pain due to nerve damage.",
      treatment: "Call emergency services immediately. Do not remove stuck clothing. Cover with clean cloth.",
      seekHelp: "Always seek emergency medical care immediately. This is a medical emergency.",
    },
  ],
  warnings: [
    "Do not apply butter, oil, toothpaste, or home remedies to burns",
    "Do not use ice or very cold water directly on burns",
    "Do not break blisters as this increases infection risk",
    "Do not remove clothing stuck to the burn",
  ],
}

export function MedicalAdvice({ burnDegree, advice }: MedicalAdviceProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("firstAid")

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // Parse advice string into structured list items
  const parseAdviceText = (text: string): string[] => {
    if (!text) return []
    
    // Split by common delimiters: bullets, periods with capitals, or newlines
    let items: string[] = []
    
    // First try splitting by bullet points or numbers
    if (text.includes("•")) {
      items = text.split("•").map(item => item.trim()).filter(item => item.length > 0)
    } else if (text.includes("\n")) {
      items = text.split("\n").map(item => item.trim()).filter(item => item.length > 0)
    } else {
      // Split by period followed by capital letter (sentence boundaries)
      items = text.split(/(?<=[.!?])\s+(?=[A-Z])|•/).map(item => item.trim()).filter(item => item.length > 0)
    }
    
    return items.map(item => {
      // Clean up any leading bullet points or numbers
      return item.replace(/^[•\d\.\-\s]+/, "").trim()
    }).filter(item => item.length > 0)
  }

  const adviceItems = advice ? parseAdviceText(advice) : []

  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Stethoscope className="h-5 w-5 text-primary" />
          Medical Guidance
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          General first aid information and burn care guidance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {advice && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-primary mb-3">Recommended Care</p>
            <ul className="space-y-2">
              {adviceItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-medium text-xs mt-0">
                    {index + 1}
                  </span>
                  <span className="text-foreground pt-0.5">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* First Aid Section */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <button
            onClick={() => toggleSection("firstAid")}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">First Aid Instructions</span>
            </div>
            {expandedSection === "firstAid" ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {expandedSection === "firstAid" && (
            <div className="px-4 pb-4 space-y-3">
              {adviceData.firstAid.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl bg-muted/30 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Burn Types Section */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <button
            onClick={() => toggleSection("burnTypes")}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <AlertCircle className="h-5 w-5 text-warning-foreground" />
              </div>
              <span className="font-semibold text-foreground">Burn Type Information</span>
            </div>
            {expandedSection === "burnTypes" ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {expandedSection === "burnTypes" && (
            <div className="px-4 pb-4 space-y-3">
              {adviceData.burnTypes.map((type, index) => (
                <div
                  key={index}
                  className={`rounded-xl border p-4 ${
                    burnDegree?.includes(type.degree.split(" ")[0])
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{type.degree}</h4>
                    <span className={`text-sm font-medium ${type.severityColor}`}>
                      {type.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {type.description}
                  </p>
                  <p className="text-sm text-foreground mb-2">
                    <strong>Treatment:</strong> {type.treatment}
                  </p>
                  <p className="text-sm text-destructive">
                    {type.seekHelp}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warnings Section */}
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 overflow-hidden">
          <button
            onClick={() => toggleSection("warnings")}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-destructive/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <span className="font-semibold text-foreground">Safety Warnings</span>
            </div>
            {expandedSection === "warnings" ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {expandedSection === "warnings" && (
            <div className="px-4 pb-4">
              <ul className="space-y-2">
                {adviceData.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-destructive mt-1">•</span>
                    <span className="text-foreground">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
