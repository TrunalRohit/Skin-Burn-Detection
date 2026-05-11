import type { PredictionData } from "@/app/app/page"

const ANALYSIS_STORAGE_KEY = "current-analysis-session"

export type PersistedAnalysisSession = {
  userId: string
  reportId: string | null
  uploadedImage: string
  prediction: PredictionData
}

export function loadAnalysisSession() {
  if (typeof window === "undefined") {
    return null
  }

  const raw = localStorage.getItem(ANALYSIS_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as PersistedAnalysisSession
  } catch {
    localStorage.removeItem(ANALYSIS_STORAGE_KEY)
    return null
  }
}

export function saveAnalysisSession(session: PersistedAnalysisSession) {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(session))
}

export function clearAnalysisSession() {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(ANALYSIS_STORAGE_KEY)
}
