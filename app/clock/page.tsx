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
  const [location, setLocation] = useState<{ city: string; coords: string; lat: number; lng: number } | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [clockTime, setClockTime] = useState<string>("")
  const [error, setError] = useState("")

  // Check current clock status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/clock')
        if (res.ok) {
          const data = await res.json()
          setIsClockedIn(data.data.isClockedIn)
        }
      } catch (e) {
        console.error('Failed to check clock status:', e)
      }
    }
    checkStatus()
  }, [])

  // Get user location via real GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          // Use reverse geocoding API
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
              { headers: { 'User-Agent': 'Taply-MVP/1.0' } }
            )
            const data = await res.json()
            const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown'
            const state = data.address?.state || data.address?.country || ''
            setLocation({
              city: `${city}, ${state}`,
              coords: `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
              lat: latitude,
              lng: longitude,
            })
          } catch {
            setLocation({
              city: "Location detected",
              coords: `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
              lat: latitude,
              lng: longitude,
            })
          }
        },
        (err) => {
          console.error('Geolocation error:', err)
          setError("GPS access denied. Please enable location services.")
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      setError("Geolocation is not supported by this browser.")
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
      } catch {
        console.log("[Taply] Camera access denied or not available")
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true)
      setError("")
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = canvasRef.current.toDataURL("image/jpeg", 0.7)
        setCapturedImage(imageData)
        
        // Stop camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }

        try {
          // Upload selfie
          let selfieUrl = imageData
          try {
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: imageData }),
            })
            if (uploadRes.ok) {
              const uploadData = await uploadRes.json()
              selfieUrl = uploadData.data.url
            }
          } catch {
            // Use base64 fallback
          }

          // Clock in/out
          const clockType = isClockedIn ? 'CLOCK_OUT' : 'CLOCK_IN'
          const clockRes = await fetch('/api/clock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: clockType,
              latitude: location?.lat,
              longitude: location?.lng,
              selfieUrl,
            }),
          })

          if (!clockRes.ok) {
            const data = await clockRes.json()
            throw new Error(data.error || 'Clock operation failed')
          }

          setClockTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
          setStep(3)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to clock in/out')
        } finally {
          setIsCapturing(false)
        }
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

      {/* Error banner */}
      {error && (
        <div className="px-5 py-2">
          <div className="bg-[#FEE2E2] border-[2px] border-[#991B1B] rounded-lg p-3">
            <p className="text-sm font-semibold text-[#991B1B]">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: Confirmation */}
      {step === 1 && (
        <div className="px-5 py-8">
          <h1 className="text-4xl font-bold text-[#6B21A8] uppercase leading-tight">
            {isClockedIn ? "Time Out" : "Time In"}<br />Verification
          </h1>
          <p className="text-[#6B7280] mt-4 text-lg">
            {isClockedIn
              ? "Ready to end your shift? We'll capture your selfie and location to verify your clock-out."
              : "Ready to start your shift? We'll capture your selfie and location to verify your clock-in."}
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
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 border-[#1A1A1A] ${location ? 'bg-[#40E0D0]' : 'bg-[#FEF3C7]'}`}>
                  <MapPin className="w-5 h-5 text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="font-bold text-[#1A1A1A]">GPS Location</p>
                  <p className="text-xs text-[#6B7280]">
                    {location ? `✓ ${location.city}` : 'Detecting your location...'}
                  </p>
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
              disabled={!location}
            >
              {location ? 'Continue to Camera' : 'Waiting for GPS...'}
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
            Please verify your identity to {isClockedIn ? 'clock out' : 'clock in'}.
          </p>
          
          {/* Camera View */}
          <div className="mt-6 relative">
            <div className="absolute -inset-3 border-[3px] border-dashed border-[#40E0D0] rounded-xl pointer-events-none z-10" />
            <div className="border-[4px] border-[#1A1A1A] rounded-xl bg-[#2A2A2A] p-3 shadow-[6px_6px_0px_#1A1A1A] overflow-hidden relative">
              <div className="absolute top-2 left-3 z-20 flex items-center gap-2 bg-[#1A1A1A]/80 px-2 py-1 rounded">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Preview</span>
              </div>
              <div className="aspect-[4/3] bg-[#1A1A1A] rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-40 h-52 border-2 border-white/30 rounded-full" />
                </div>
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
              <span>{isCapturing ? "Processing..." : `Capture & ${isClockedIn ? 'Clock Out' : 'Clock In'}`}</span>
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
            {isClockedIn ? "Clocked Out!" : "Clocked In!"}
          </h1>
          <p className="text-[#6B7280] mt-4 text-lg">
            {isClockedIn ? "Your shift has ended. Great work today!" : "Your shift has started. Stay productive!"}
          </p>
          
          {capturedImage && (
            <div className="mt-8 inline-block">
              <div className="border-[3px] border-[#1A1A1A] rounded-xl overflow-hidden shadow-[4px_4px_0px_#1A1A1A] w-32 h-32 mx-auto">
                <img 
                  src={capturedImage} 
                  alt="Captured selfie" 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
            </div>
          )}
          
          <div className="mt-8 space-y-3 text-left">
            <div className="border-[3px] border-[#1A1A1A] rounded-lg p-4 bg-[#F5F5F5] shadow-[4px_4px_0px_#1A1A1A]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Time</span>
                <span className="font-bold text-[#1A1A1A]">{clockTime}</span>
              </div>
            </div>
            <div className="border-[3px] border-[#1A1A1A] rounded-lg p-4 bg-[#F5F5F5] shadow-[4px_4px_0px_#1A1A1A]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Location</span>
                <span className="font-bold text-[#1A1A1A]">{location?.city || "N/A"}</span>
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
