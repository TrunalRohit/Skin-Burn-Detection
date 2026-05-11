import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import { firestoreDb } from "@/lib/firebase"

export type ReportHistoryRecord = {
  id: string
  userId: string
  email: string
  burnType: string
  confidence: number
  riskLevel: "low" | "moderate" | "high" | "unknown"
  date: string
  createdAtMs: number
  imageDataUrl: string
  pdfUrl: string | null
  advice: string
  probabilities: {
    firstDegree: number
    secondDegree: number
    thirdDegree: number
  }
}

type CreateReportHistoryInput = Omit<ReportHistoryRecord, "id">

const reportHistoryCache = new Map<string, ReportHistoryRecord[]>()

function getReportsCollection() {
  if (!firestoreDb) {
    throw new Error("Firestore is not configured.")
  }

  return collection(firestoreDb, "reports")
}

export function getCachedReportHistory(userId: string) {
  return reportHistoryCache.get(userId) || null
}

export async function saveReportHistory(report: CreateReportHistoryInput) {
  const reportsCollection = getReportsCollection()
  const savedReport = await addDoc(reportsCollection, {
    ...report,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  const savedRecord: ReportHistoryRecord = {
    id: savedReport.id,
    ...report,
  }

  const currentReports = reportHistoryCache.get(report.userId) || []
  reportHistoryCache.set(
    report.userId,
    [savedRecord, ...currentReports].sort((a, b) => b.createdAtMs - a.createdAtMs)
  )

  return savedRecord
}

export async function updateReportHistory(
  userId: string,
  reportId: string,
  updates: Partial<Omit<ReportHistoryRecord, "id" | "userId" | "email">>
) {
  if (!firestoreDb) {
    throw new Error("Firestore is not configured.")
  }

  const reportRef = doc(firestoreDb, "reports", reportId)
  await updateDoc(reportRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })

  const currentReports = reportHistoryCache.get(userId)
  if (currentReports) {
    reportHistoryCache.set(
      userId,
      currentReports.map((report) =>
        report.id === reportId ? { ...report, ...updates } : report
      )
    )
  }
}

export async function getReportHistory(userId: string) {
  const reportsCollection = getReportsCollection()
  const snapshot = await getDocs(query(reportsCollection, where("userId", "==", userId)))

  const reports = snapshot.docs
    .map((reportDoc) => {
      const data = reportDoc.data() as Omit<ReportHistoryRecord, "id">
      return {
        id: reportDoc.id,
        ...data,
      }
    })
    .sort((a, b) => b.createdAtMs - a.createdAtMs)

  reportHistoryCache.set(userId, reports)
  return reports
}

export async function getReportById(reportId: string) {
  if (!firestoreDb) {
    throw new Error("Firestore is not configured.")
  }

  const snapshot = await getDoc(doc(firestoreDb, "reports", reportId))
  if (!snapshot.exists()) {
    return null
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<ReportHistoryRecord, "id">),
  }
}

export async function deleteReportHistory(reportId: string) {
  if (!firestoreDb) {
    throw new Error("Firestore is not configured.")
  }

  await deleteDoc(doc(firestoreDb, "reports", reportId))
}

export function removeReportFromCache(userId: string, reportId: string) {
  const currentReports = reportHistoryCache.get(userId)
  if (!currentReports) {
    return
  }

  reportHistoryCache.set(
    userId,
    currentReports.filter((report) => report.id !== reportId)
  )
}
