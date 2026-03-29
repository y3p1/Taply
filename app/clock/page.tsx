"use client"

import { useState, useRef, useEffect } from "react"
import { BrutalistButton } from "@/components/brutalist/brutalist-button"
import { Camera, Check, MapPin, X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ClockInPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [step, setStep] = useState(1)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [location, setLocation] = useState<{ city: string; coords: string } | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation({
            city: "San Francisco, CA",
            coords: `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W`
          })
        },
        () => {
          setLocation({
            city: "San Francisco, CA",
            coords: "37.7749° N, 122.4194° W"
          })
        }
      )
    }
  }, [])

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 }
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error) {
        console.log("[v0] Camera access denied or not available")
      }
    }

    if (step === 2) {
      initCamera()
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [step])

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true)
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = canvasRef.current.toDataURL("image/jpeg")
        setCapturedImage(imageData)
        
        // Stop camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
        
        // Move to success step
        setTimeout(() => {
          setStep(3)
          setIsCapturing(false)
        }, 500)
      }
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white bg-[#6B21A8] px-2.5 py-1 rounded">STEP {step} OF 3</span>
        </div>
        <button 
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center text-[#6B21A8] hover:bg-[#F5F5F5] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>

      {/* Step 1: Confirmation */}
      {step === 1 && (
        <div className="px-5 py-8">
          <h1 className="text-4xl font-bold text-[#6B21A8] uppercase leading-tight">
            Time In<br />Verification
          </h1>
          <p className="text-[#6B7280] mt-4 text-lg">
            Ready to start your shift? We&apos;ll capture your selfie and location to verify your clock-in.
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="border-[3px] border-[#1A1A1A] rounded-lg p-4 bg-[#F5F5F5] shadow-[4px_4px_0px_#1A1A1A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#40E0D0] rounded-lg flex items-center justify-center border-2 border-[#1A1A1A]">
                  <Camera className="w-5 h-5 text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="font-bold text-[#1A1A1A]">Selfie Capture</p>
                  <p className="text-xs text-[#6B7280]">We&apos;ll use your camera to verify identity</p>
                </div>
              </div>
            </div>
            
            <div className="border-[3px] border-[#1A1A1A] rounded-lg p-4 bg-[#F5F5F5] shadow-[4px_4px_0px_#1A1A1A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#40E0D0] rounded-lg flex items-center justify-center border-2 border-[#1A1A1A]">
                  <MapPin className="w-5 h-5 text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="font-bold text-[#1A1A1A]">GPS Location</p>
                  <p className="text-xs text-[#6B7280]">Your location will be recorded automatically</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10">
            <BrutalistButton
              variant="primary"
              size="xl"
              fullWidth
              onClick={() => setStep(2)}
            >
              Continue to Camera
            </BrutalistButton>
          </div>
        </div>
      )}

      {/* Step 2: Camera Capture */}
      {step === 2 && (
        <div className="px-5 py-4">
          <h1 className="text-4xl font-bold text-[#6B21A8] uppercase leading-tight">
            Selfie<br />Verification
          </h1>
          <p className="text-[#6B7280] mt-2">
            Please verify your identity to clock in.
          </p>
          
          {/* Camera View */}
          <div className="mt-6 relative">
            {/* Dashed border frame */}
            <div className="absolute -inset-3 border-[3px] border-dashed border-[#40E0D0] rounded-xl pointer-events-none z-10" />
            
            {/* Camera frame styled like DSLR */}
            <div className="border-[4px] border-[#1A1A1A] rounded-xl bg-[#2A2A2A] p-3 shadow-[6px_6px_0px_#1A1A1A] overflow-hidden relative">
              {/* Top bar with live indicator */}
              <div className="absolute top-2 left-3 z-20 flex items-center gap-2 bg-[#1A1A1A]/80 px-2 py-1 rounded">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Preview</span>
              </div>
              
              {/* Video feed */}
              <div className="aspect-[4/3] bg-[#1A1A1A] rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-40 h-52 border-2 border-white/30 rounded-full" />
                </div>
              </div>
              
              {/* Camera controls decoration */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 space-y-2">
                <div className="w-6 h-6 bg-[#3A3A3A] rounded-full border border-[#4A4A4A]" />
                <div className="w-8 h-8 bg-[#3A3A3A] rounded-full border-2 border-[#4A4A4A]" />
              </div>
            </div>
          </div>
          
          {/* Capture Button */}
          <div className="mt-6">
            <BrutalistButton
              variant="accent"
              size="xl"
              fullWidth
              onClick={handleCapture}
              disabled={isCapturing}
            >
              <Camera className="w-6 h-6" />
              <span>{isCapturing ? "Capturing..." : "Capture & Clock In"}</span>
            </BrutalistButton>
          </div>
          
          {/* Location Status */}
          {location && (
            <div className="mt-6 border-[3px] border-[#1A1A1A] rounded-lg p-4 bg-white shadow-[4px_4px_0px_#1A1A1A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Location Verified</p>
                  <p className="font-bold text-[#1A1A1A] mt-1 flex items-center gap-1">
                    <span className="text-[#22C55E]">●</span> {location.city}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{location.coords}</p>
                </div>
                <div className="w-8 h-8 bg-[#D1FAE5] rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-[#059669]" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="px-5 py-8 text-center">
          <div className="w-24 h-24 mx-auto bg-[#D1FAE5] rounded-full flex items-center justify-center border-[4px] border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A]">
            <Check className="w-12 h-12 text-[#059669]" strokeWidth={3} />
          </div>
          
          <h1 className="text-4xl font-bold text-[#6B21A8] uppercase leading-tight mt-8">
            Clocked In!
          </h1>
          <p className="text-[#6B7280] mt-4 text-lg">
            Your shift has started. Stay productive!
          </p>
          
          {/* Captured selfie preview */}
          {capturedImage && (
            <div className="mt-8 inline-block">
              <div className="border-[3px] border-[#1A1A1A] rounded-xl overflow-hidden shadow-[4px_4px_0px_#1A1A1A] w-32 h-32 mx-auto">
                <img 
                  src={capturedImage || "/placeholder.svg"} 
                  alt="Captured selfie" 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
            </div>
          )}
          
          {/* Details */}
          <div className="mt-8 space-y-3 text-left">
            <div className="border-[3px] border-[#1A1A1A] rounded-lg p-4 bg-[#F5F5F5] shadow-[4px_4px_0px_#1A1A1A]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Time</span>
                <span className="font-bold text-[#1A1A1A]">
                  {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
            <div className="border-[3px] border-[#1A1A1A] rounded-lg p-4 bg-[#F5F5F5] shadow-[4px_4px_0px_#1A1A1A]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Location</span>
                <span className="font-bold text-[#1A1A1A]">{location?.city || "San Francisco, CA"}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-10">
            <BrutalistButton
              variant="primary"
              size="xl"
              fullWidth
              onClick={() => router.push("/")}
            >
              Back to Dashboard
            </BrutalistButton>
          </div>
        </div>
      )}
    </main>
  )
}
