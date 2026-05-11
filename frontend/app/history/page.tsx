"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Download, FileText, History, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import {
  deleteReportHistory,
  getCachedReportHistory,
  getReportHistory,
  removeReportFromCache,
  updateReportHistory,
  type ReportHistoryRecord,
} from "@/lib/report-history"
import { downloadReport } from "@/lib/api"
import { saveAnalysisSession } from "@/lib/analysis-session"
import { dataUrlToFile, downloadBlob, uploadReportPdf } from "@/lib/report-utils"

function formatReportDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString()
}

export default function HistoryPage() {
  const router = useRouter()
  const { user, loading: authLoading, isConfigured } = useAuth()
  const [activeSection, setActiveSection] = useState("history")
  const [reports, setReports] = useState<ReportHistoryRecord[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [loadingReports, setLoadingReports] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!isConfigured || !user || !user.emailVerified)) {
      router.replace("/auth")
    }
  }, [authLoading, isConfigured, router, user])

  useEffect(() => {
    if (authLoading || !user || !user.emailVerified) {
      return
    }

    let active = true
    const cachedReports = getCachedReportHistory(user.uid)

    if (cachedReports) {
      setReports(cachedReports)
      setSelectedReportId((currentSelectedId) => {
        if (currentSelectedId && cachedReports.some((report) => report.id === currentSelectedId)) {
          return currentSelectedId
        }
        return cachedReports[0]?.id ?? null
      })
      setLoadingReports(false)
    }

    const loadReports = async () => {
      if (!cachedReports) {
        setLoadingReports(true)
      }
      setHistoryError(null)

      try {
        const fetchedReports = await getReportHistory(user.uid)
        if (!active) {
          return
        }

        setReports(fetchedReports)
        setSelectedReportId((currentSelectedId) => {
          if (currentSelectedId && fetchedReports.some((report) => report.id === currentSelectedId)) {
            return currentSelectedId
          }
          return fetchedReports[0]?.id ?? null
        })
      } catch (error) {
        if (!active) {
          return
        }
        setHistoryError(error instanceof Error ? error.message : "Unable to load report history.")
      } finally {
        if (active) {
          setLoadingReports(false)
        }
      }
    }

    void loadReports()

    return () => {
      active = false
    }
  }, [authLoading, user])

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? null,
    [reports, selectedReportId]
  )

  const handleDownload = async (report: ReportHistoryRecord) => {
    setDownloadingId(report.id)
    setHistoryError(null)

    try {
      if (report.pdfUrl) {
        const anchor = document.createElement("a")
        anchor.href = report.pdfUrl
        anchor.target = "_blank"
        anchor.rel = "noreferrer"
        anchor.download = "burn_report.pdf"
        anchor.click()
        return
      }

      const reportFile = dataUrlToFile(report.imageDataUrl, `${report.burnType.replace(/\s+/g, "_").toLowerCase()}.jpg`)
      const blob = await downloadReport({
        file: reportFile,
        class_name: report.burnType,
        confidence: report.confidence,
        probabilities: [
          report.probabilities.firstDegree,
          report.probabilities.secondDegree,
          report.probabilities.thirdDegree,
        ],
        advice: report.advice,
      })

      downloadBlob(blob, "burn_report.pdf")

      const pdfUrl = await uploadReportPdf(user!.uid, report.id, blob)
      await updateReportHistory(user!.uid, report.id, { pdfUrl })
      setReports((currentReports) =>
        currentReports.map((currentReport) =>
          currentReport.id === report.id ? { ...currentReport, pdfUrl } : currentReport
        )
      )
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "Unable to download report.")
    } finally {
      setDownloadingId(null)
    }
  }

  const handleViewInAnalysis = (report: ReportHistoryRecord) => {
    if (!user) {
      return
    }

    saveAnalysisSession({
      userId: user.uid,
      reportId: report.id,
      uploadedImage: report.imageDataUrl,
      prediction: {
        burnDegree: report.burnType,
        riskLevel: report.riskLevel,
        confidence: report.confidence,
        probabilities: report.probabilities,
        advice: report.advice,
      },
    })
    router.push("/app")
  }

  const handleDelete = async (reportId: string) => {
    if (!user) {
      return
    }

    const previousReports = reports
    const nextReports = previousReports.filter((report) => report.id !== reportId)

    setDeletingId(reportId)
    setHistoryError(null)
    setReports(nextReports)
    setSelectedReportId((currentSelectedId) => {
      if (currentSelectedId && currentSelectedId !== reportId) {
        return currentSelectedId
      }
      return nextReports[0]?.id ?? null
    })
    removeReportFromCache(user.uid, reportId)

    try {
      await deleteReportHistory(reportId)
    } catch (error) {
      setReports(previousReports)
      setSelectedReportId((currentSelectedId) => currentSelectedId ?? previousReports[0]?.id ?? null)
      setHistoryError(error instanceof Error ? error.message : "Unable to delete report.")
    } finally {
      setDeletingId(null)
    }
  }

  if (authLoading || !user || !user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="pb-20">
        <section className="bg-gradient-to-b from-primary/5 via-background to-background py-14">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
                <History className="h-4 w-4" />
                Report History
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground">Your saved reports</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Review previous burn assessments, open report details, redownload PDFs, or remove entries you no longer need.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {historyError && (
            <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {historyError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="shadow-lg border-0 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="h-6 w-6 text-primary" />
                  Saved Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingReports ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-border bg-muted/30 p-4 animate-pulse"
                      >
                        <div className="flex gap-4">
                          <div className="h-20 w-20 rounded-xl bg-muted" />
                          <div className="flex-1 space-y-3">
                            <div className="h-5 w-40 rounded bg-muted" />
                            <div className="h-4 w-28 rounded bg-muted" />
                            <div className="h-4 w-24 rounded bg-muted" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reports.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-muted/30 p-10 text-center">
                    <p className="text-lg font-medium text-foreground">No reports yet.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Generate a burn prediction from the dashboard and it will appear here automatically.
                    </p>
                    <Button className="mt-6" onClick={() => router.push("/app")}>
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className={`rounded-2xl border p-4 transition-colors ${
                          selectedReportId === report.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex gap-4">
                            <img
                              src={report.imageDataUrl}
                              alt={report.burnType}
                              className="h-20 w-20 rounded-xl object-cover border border-border bg-muted/40"
                            />
                            <div className="space-y-2">
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">{report.burnType}</h3>
                                <p className="text-sm text-muted-foreground capitalize">
                                  Risk level: {report.riskLevel}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                {formatReportDate(report.date)}
                              </div>
                              <p className="text-sm text-foreground">
                                Confidence: <span className="font-semibold">{report.confidence.toFixed(2)}%</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewInAnalysis(report)}>
                              View Report
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownload(report)}
                              disabled={downloadingId === report.id}
                            >
                              {downloadingId === report.id ? "Downloading..." : "Download PDF"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(report.id)}
                              disabled={deletingId === report.id}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {deletingId === report.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Report Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedReport ? (
                  <div className="space-y-6">
                    <img
                      src={selectedReport.imageDataUrl}
                      alt={selectedReport.burnType}
                      className="w-full rounded-2xl border border-border bg-muted/40 object-cover"
                    />

                    <div className="grid grid-cols-2 gap-4 rounded-2xl bg-muted/30 p-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Burn Type</p>
                        <p className="mt-1 font-semibold text-foreground">{selectedReport.burnType}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Confidence</p>
                        <p className="mt-1 font-semibold text-foreground">{selectedReport.confidence.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Risk Level</p>
                        <p className="mt-1 font-semibold capitalize text-foreground">{selectedReport.riskLevel}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Date</p>
                        <p className="mt-1 font-semibold text-foreground">{formatReportDate(selectedReport.date)}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground">Probability Breakdown</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                          <span className="text-foreground">1st Degree Burn</span>
                          <span className="font-semibold text-foreground">
                            {selectedReport.probabilities.firstDegree.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                          <span className="text-foreground">2nd Degree Burn</span>
                          <span className="font-semibold text-foreground">
                            {selectedReport.probabilities.secondDegree.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                          <span className="text-foreground">3rd Degree Burn</span>
                          <span className="font-semibold text-foreground">
                            {selectedReport.probabilities.thirdDegree.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground">Medical Guidance</h3>
                      <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm leading-6 text-foreground whitespace-pre-line">
                        {selectedReport.advice}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="gap-2"
                        onClick={() => handleDownload(selectedReport)}
                        disabled={downloadingId === selectedReport.id}
                      >
                        <Download className="h-4 w-4" />
                        {downloadingId === selectedReport.id ? "Downloading..." : "Download PDF"}
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(selectedReport.id)}
                        disabled={deletingId === selectedReport.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === selectedReport.id ? "Deleting..." : "Delete Report"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-muted/30 p-10 text-center">
                    <p className="text-lg font-medium text-foreground">Select a saved report</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Choose a report from the list to view its full details here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
