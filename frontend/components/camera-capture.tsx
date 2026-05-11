"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, X, RotateCcw, Check, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface CameraCaptureProps {
  onCapture: (file: File, imageUrl: string) => void
  onClose: () => void
}

type CameraState = "requesting" | "ready" | "captured" | "error"

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const capturedBlobRef = useRef<Blob | null>(null)
  
  const [cameraState, setCameraState] = useState<CameraState>("requesting")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize camera
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        setCameraState("requesting")
        setErrorMessage(null)

        const constraints = {
          video: {
            facingMode: { ideal: "environment" }, // Prefer back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch((err) => {
            console.error("Error playing video:", err)
          })
        }

        setCameraState("ready")
      } catch (error) {
        let message = "Unable to access your camera."
        
        if (error instanceof DOMException) {
          if (error.name === "NotAllowedError") {
            message = "Camera permission denied. Please allow camera access in your browser settings."
          } else if (error.name === "NotFoundError") {
            message = "No camera device found on your device."
          } else if (error.name === "NotReadableError") {
            message = "Camera is in use by another application."
          }
        }
        
        setErrorMessage(message)
        setCameraState("error")
      }
    }

    initializeCamera()

    return () => {
      // Cleanup: stop all camera tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop()
        })
      }
    }
  }, [])

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext("2d")
    if (!context) return

    // Set canvas dimensions to match video
    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight

    // Draw current video frame to canvas
    context.drawImage(videoRef.current, 0, 0)

    // Convert canvas to data URL for preview
    const imageData = canvasRef.current.toDataURL("image/jpeg", 0.95)
    setCapturedImage(imageData)

    // Convert canvas to blob immediately and store in ref for later use
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          capturedBlobRef.current = blob
        }
      },
      "image/jpeg",
      0.95
    )

    setCameraState("captured")

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
    }
  }

  const handleRetake = async () => {
    setCapturedImage(null)
    capturedBlobRef.current = null
    setCameraState("requesting")
    setErrorMessage(null)
    setIsSubmitting(false)

    try {
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err)
        })
      }

      setCameraState("ready")
    } catch (error) {
      let message = "Unable to access your camera."
      
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          message = "Camera permission denied."
        } else if (error.name === "NotFoundError") {
          message = "No camera device found."
        } else if (error.name === "NotReadableError") {
          message = "Camera is in use by another application."
        }
      }
      
      setErrorMessage(message)
      setCameraState("error")
    }
  }

  const handleSubmit = async () => {
    if (!capturedImage) {
      setErrorMessage("No image captured. Please capture a photo first.")
      return
    }

    if (!capturedBlobRef.current) {
      setErrorMessage("Failed to process the captured image. Please try again.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const blob = capturedBlobRef.current
      const file = new File([blob], `camera_capture_${Date.now()}.jpg`, {
        type: "image/jpeg",
      })

      // Call the parent callback with the file and image URL
      onCapture(file, capturedImage)
      // Note: Component will close automatically when parent updates state
    } catch (error) {
      console.error("Error processing image:", error)
      setErrorMessage("Failed to process the captured image. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
    }
    onClose()
  }

  return (
    <Card className="overflow-hidden shadow-lg border-0 bg-card w-full">
      <CardContent className="p-0">
        {/* Camera Error State */}
        {cameraState === "error" && (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm text-destructive">
                <p className="font-medium">Camera Access Error</p>
                <p className="mt-1">{errorMessage}</p>
              </div>
            </div>
            <Button onClick={handleClose} variant="outline" className="w-full">
              Close Camera
            </Button>
          </div>
        )}

        {/* Camera Ready State - Live Preview */}
        {cameraState === "requesting" && (
          <div className="p-6 text-center">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Initializing camera...
            </p>
          </div>
        )}

        {cameraState === "ready" && (
          <div className="space-y-4 p-4">
            <div className="relative w-full bg-black rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-auto aspect-video object-cover"
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCapture}
                className="flex-1 gap-2 bg-primary hover:bg-primary/90"
              >
                <Camera className="h-4 w-4" />
                Capture Photo
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Captured Image Preview State */}
        {cameraState === "captured" && capturedImage && (
          <div className="space-y-4 p-4">
            <div className="relative w-full bg-muted rounded-2xl overflow-hidden">
              <img
                src={capturedImage}
                alt="Captured image"
                className="w-full h-auto max-h-[400px] object-contain"
              />
            </div>
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <p className="text-xs text-destructive">{errorMessage}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Use This Photo
                  </>
                )}
              </Button>
              <Button
                onClick={handleRetake}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
