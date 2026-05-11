import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { firebaseStorage } from "@/lib/firebase"

export function dataUrlToFile(dataUrl: string, filename: string) {
  const [meta, content] = dataUrl.split(",")
  const mime = meta.match(/data:(.*?);base64/)?.[1] || "image/jpeg"
  const binary = atob(content)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new File([bytes], filename, { type: mime })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.URL.revokeObjectURL(url)
}

export async function uploadReportPdf(userId: string, reportId: string, blob: Blob) {
  if (!firebaseStorage) {
    throw new Error("Firebase Storage is not configured.")
  }

  const pdfRef = ref(firebaseStorage, `reports/${userId}/${reportId}/burn_report.pdf`)
  await uploadBytes(pdfRef, blob, {
    contentType: "application/pdf",
  })
  return getDownloadURL(pdfRef)
}
