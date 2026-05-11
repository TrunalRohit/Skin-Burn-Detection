"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ImageUpload } from "@/components/image-upload"
import { PredictionResult } from "@/components/prediction-result"
import { ProbabilitiesChart } from "@/components/probabilities-chart"
import { MedicalAdvice } from "@/components/medical-advice"
import { NearbySpecialists } from "@/components/nearby-specialists"
const MapSection = dynamic(
  () => import("@/components/map-section").then((mod) => mod.MapSection),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  }
)
import { ReportSection } from "@/components/report-section"
import { Footer } from "@/components/footer"
import { predictImage, searchNearby, downloadReport } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"
import { saveReportHistory, updateReportHistory } from "@/lib/report-history"
import {
  clearAnalysisSession,
  loadAnalysisSession,
  saveAnalysisSession,
} from "@/lib/analysis-session"
import { dataUrlToFile, downloadBlob, uploadReportPdf } from "@/lib/report-utils"

export type AppState = "idle" | "analyzing" | "success" | "error"

export type PredictionData = {
  burnDegree: string
  riskLevel: "low" | "moderate" | "high" | "unknown"
  confidence: number
  probabilities: {
    firstDegree: number
    secondDegree: number
    thirdDegree: number
  }
  advice: string
}

export type NearbyPlace = {
  name: string
  type: string
  address: string
  phone: string
  rating: number | null
  distance_km: number
  maps_url: string
  lat?: number
  lon?: number
}

const getCurrentLocation = (
  onSuccess: (coords: { latitude: number; longitude: number }) => void,
  onError: (message: string) => void
) => {
  if (typeof window === "undefined" || !navigator.geolocation) {
    onError('Geolocation is not supported by your browser.')
    return
  }

  if (!window.isSecureContext && window.location.hostname !== 'localhost') {
    onError('Geolocation requires HTTPS or localhost. Please access the app over a secure connection.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        onError('Unable to read your location coordinates.')
        return
      }
      onSuccess({ latitude, longitude })
    },
    (error) => {
      let errorMessage = ''
      let suggestion = 'Please enter your location manually.'
      
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Location permission was denied.'
        suggestion = 'Please enable location access in your browser settings.'
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Location information is unavailable on this device.'
        suggestion = 'Your device may not have location services enabled.'
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'Location request timed out.'
        suggestion = 'Please ensure location services are enabled and try again.'
      }
      
      onError(`${errorMessage} ${suggestion}`)
    },
    { 
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 300000
    }
  )
}

export default function Home() {
  const router = useRouter()
  const { user, loading: authLoading, isConfigured } = useAuth()
  const [appState, setAppState] = useState<AppState>("idle")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [activeSection, setActiveSection] = useState<string>("analysis")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([])
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [nearbyError, setNearbyError] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number; label: string } | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [predictionError, setPredictionError] = useState<string | null>(null)
  const [reportHistoryId, setReportHistoryId] = useState<string | null>(null)
  const [hasRestoredSession, setHasRestoredSession] = useState(false)

  const mapSearchLabel = mapCenter?.label || ""
  const isNearbySearching = nearbyLoading || locationLoading
  const combinedSearchError = locationError || nearbyError

  const ensureReportHistoryRecord = async (imageDataUrl: string, nextPrediction: PredictionData) => {
    if (reportHistoryId) {
      return { id: reportHistoryId }
    }

    if (!user) {
      throw new Error("You must be logged in to save report history.")
    }

    const savedReport = await saveReportHistory({
      userId: user.uid,
      email: user.email || "",
      burnType: nextPrediction.burnDegree,
      confidence: nextPrediction.confidence,
      riskLevel: nextPrediction.riskLevel,
      date: new Date().toISOString(),
      createdAtMs: Date.now(),
      imageDataUrl,
      pdfUrl: null,
      advice: nextPrediction.advice,
      probabilities: nextPrediction.probabilities,
    })

    setReportHistoryId(savedReport.id)
    return savedReport
  }

  useEffect(() => {
    if (!authLoading && (!isConfigured || !user || !user.emailVerified)) {
      router.replace("/auth")
    }
  }, [authLoading, isConfigured, router, user])

  useEffect(() => {
    if (authLoading || !user || hasRestoredSession) {
      return
    }

    const savedSession = loadAnalysisSession()
    if (!savedSession || savedSession.userId !== user.uid) {
      clearAnalysisSession()
      setHasRestoredSession(true)
      return
    }

    setUploadedImage(savedSession.uploadedImage)
    setPrediction(savedSession.prediction)
    setReportHistoryId(savedSession.reportId)
    setAppState("success")
    setHasRestoredSession(true)
  }, [authLoading, hasRestoredSession, user])

  useEffect(() => {
    if (!user) {
      return
    }

    if (appState === "success" && uploadedImage && prediction) {
      saveAnalysisSession({
        userId: user.uid,
        reportId: reportHistoryId,
        uploadedImage,
        prediction,
      })
      return
    }

    if (appState === "idle") {
      clearAnalysisSession()
    }
  }, [appState, prediction, reportHistoryId, uploadedImage, user])

  if (authLoading || !user || !user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const handleImageUpload = async (file: File, imageUrl: string) => {
    setUploadedFile(file)
    setUploadedImage(imageUrl)
    setAppState("analyzing")
    setPrediction(null)
    setPredictionError(null)
    setReportHistoryId(null)

    try {
      const payload = await predictImage(file)
      const nextPrediction = {
        burnDegree: payload.class_name,
        riskLevel: payload.risk_level as PredictionData['riskLevel'],
        confidence: Number(payload.confidence.toFixed(2)),
        probabilities: {
          firstDegree: Number(payload.probabilities[0]?.toFixed(1) ?? 0),
          secondDegree: Number(payload.probabilities[1]?.toFixed(1) ?? 0),
          thirdDegree: Number(payload.probabilities[2]?.toFixed(1) ?? 0),
        },
        advice: payload.advice,
      }

      // Step 1: Update UI state FIRST - show result immediately on main page
      setPrediction(nextPrediction)
      setAppState("success")

      // Step 2: Save to Firestore history in BACKGROUND (parallel, non-blocking)
      // Do NOT await this - let it run in background
      if (user) {
        ensureReportHistoryRecord(imageUrl, nextPrediction)
          .then((savedReport) => {
            setReportHistoryId(savedReport.id)
          })
          .catch((historyError) => {
            // Silent fail - result is already shown on main page
            console.error("Background save to history failed:", historyError)
          })
      }
    } catch (error) {
      setPredictionError(error instanceof Error ? error.message : "Prediction failed.")
      setAppState("error")
    }
  }

  const handleReset = () => {
    setAppState("idle")
    setUploadedImage(null)
    setUploadedFile(null)
    setPrediction(null)
    setPredictionError(null)
    setReportHistoryId(null)
    clearAnalysisSession()
  }

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      setNearbyError("Please enter a location to search.")
      return
    }

    setNearbyLoading(true)
    setNearbyError(null)
    try {
      const response = await searchNearby({ address: searchQuery })
      setNearbyPlaces(response.places)
      setMapCenter({
        latitude: response.latitude,
        longitude: response.longitude,
        label: response.location_name,
      })
    } catch (error) {
      setNearbyError(error instanceof Error ? error.message : "Nearby search failed.")
      setNearbyPlaces([])
      setMapCenter(null)
    } finally {
      setNearbyLoading(false)
    }
  }

  const handleUseLocation = async () => {
    setNearbyError(null)
    setLocationError(null)
    setNearbyLoading(true)
    setLocationLoading(true)

    getCurrentLocation(
      async ({ latitude, longitude }) => {
        setCurrentLocation({ latitude, longitude })
        try {
          const response = await searchNearby({ latitude, longitude })
          setNearbyPlaces(response.places)
          setMapCenter({
            latitude: response.latitude,
            longitude: response.longitude,
            label: response.location_name,
          })
          setSearchQuery('Current Location')
        } catch (error) {
          setNearbyError(error instanceof Error ? error.message : 'Nearby search failed.')
          setNearbyPlaces([])
          setMapCenter(null)
        } finally {
          setNearbyLoading(false)
          setLocationLoading(false)
        }
      },
      (message) => {
        setLocationError(message)
        setNearbyError(message)
        setNearbyLoading(false)
        setLocationLoading(false)
      }
    )
  }

  const handleDownloadReport = async () => {
    if (!uploadedImage || !prediction) {
      return
    }

    setReportLoading(true)
    try {
      const reportFile =
        uploadedFile ||
        dataUrlToFile(
          uploadedImage,
          `${prediction.burnDegree.replace(/\s+/g, "_").toLowerCase()}_analysis.jpg`
        )

      const blob = await downloadReport({
        file: reportFile,
        class_name: prediction.burnDegree,
        confidence: prediction.confidence,
        probabilities: [
          prediction.probabilities.firstDegree,
          prediction.probabilities.secondDegree,
          prediction.probabilities.thirdDegree,
        ],
        advice: prediction.advice,
      })

      downloadBlob(blob, "burn_report.pdf")

      try {
        const ensuredReport = await ensureReportHistoryRecord(uploadedImage, prediction)
        const pdfUrl = await uploadReportPdf(user.uid, ensuredReport.id, blob)
        await updateReportHistory(user.uid, ensuredReport.id, {
          pdfUrl,
        })
      } catch (historyError) {
        console.error("Unable to update report history after download:", historyError)
      }
    } catch (error) {
      setPredictionError(error instanceof Error ? error.message : 'Report download failed.')
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="pb-20">
        <HeroSection />

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="analysis">
            <div className="space-y-6">
              <ImageUpload
                appState={appState}
                uploadedImage={uploadedImage}
                onImageUpload={(file, imageUrl) => handleImageUpload(file, imageUrl)}
                onReset={handleReset}
              />

              {appState === 'success' && prediction && (
                <PredictionResult prediction={prediction} />
              )}

              {appState === 'error' && predictionError && (
                <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                  {predictionError}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {appState === 'success' && prediction && (
                <>
                  <ProbabilitiesChart probabilities={prediction.probabilities} />
                  <ReportSection
                    prediction={prediction}
                    isLoading={reportLoading}
                    onDownload={handleDownloadReport}
                  />
                </>
              )}

              <MedicalAdvice burnDegree={prediction?.burnDegree} advice={prediction?.advice} />
            </div>
          </div>

          <div className="mt-16" id="specialists">
            <NearbySpecialists
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              nearbyPlaces={nearbyPlaces}
              onSearch={handleSearchLocation}
              onUseLocation={handleUseLocation}
              isSearching={isNearbySearching}
              searchError={combinedSearchError}
            />
          </div>

          <div className="mt-8" id="map">
            <MapSection
              center={mapCenter}
              nearbyPlaces={nearbyPlaces}
              searchLabel={mapSearchLabel}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
