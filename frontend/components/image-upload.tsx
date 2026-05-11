"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, Camera, ImageIcon, RotateCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CameraCapture } from "@/components/camera-capture"
import type { AppState } from "@/app/app/page"

interface ImageUploadProps {
  appState: AppState
  uploadedImage: string | null
  onImageUpload: (file: File, imageUrl: string) => void
  onReset: () => void
}

export function ImageUpload({
  appState,
  uploadedImage,
  onImageUpload,
  onReset,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const handleFileSelect = useCallback(
    (file: File) => {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          onImageUpload(file, e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraClick = () => {
    setIsCameraOpen(true)
  }

  const handleCameraClose = () => {
    setIsCameraOpen(false)
  }

  return (
    <Card className="overflow-hidden shadow-lg border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ImageIcon className="h-5 w-5 text-primary" />
          Upload Burn Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Camera is open */}
        {isCameraOpen && (
          <CameraCapture
            onCapture={(file, imageUrl) => {
              onImageUpload(file, imageUrl)
              setIsCameraOpen(false)
            }}
            onClose={handleCameraClose}
          />
        )}

        {/* Camera is closed - show normal upload UI */}
        {!isCameraOpen && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
            />

            {appState === "idle" && !uploadedImage && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 transition-all hover:border-primary/50 hover:bg-muted/50 min-h-[280px] cursor-pointer"
                onClick={handleUploadClick}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-lg font-medium text-foreground">
                    Drag and drop your image here
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Upload a clear image of the burn area
                </p>
              </div>
            )}

            {appState === "analyzing" && uploadedImage && (
              <div className="relative rounded-2xl overflow-hidden min-h-[280px]">
                <img
                  src={uploadedImage}
                  alt="Uploaded burn image"
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-lg font-medium text-foreground">
                    Analyzing image...
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Our AI is processing your burn image
                  </p>
                </div>
              </div>
            )}

            {(appState === "success" || appState === "error") && uploadedImage && (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={uploadedImage}
                    alt="Uploaded burn image"
                    className="w-full h-auto max-h-[300px] object-contain bg-muted/30 rounded-2xl"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={onReset}
                  className="w-full gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Upload New Image
                </Button>
              </div>
            )}

            {appState === "idle" && !uploadedImage && (
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button onClick={handleUploadClick} className="flex-1 gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCameraClick}
                  className="flex-1 gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Use Camera
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
