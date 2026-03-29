"use client"

import { AlertCircle, CheckCircle, Clock } from "lucide-react"

interface NotificationBannerProps {
  type: "pending" | "approved" | "warning"
  message: string
  details?: string
}

export function NotificationBanner({ type, message, details }: NotificationBannerProps) {
  const getStyles = () => {
    switch (type) {
      case "approved":
        return {
          bg: "bg-[#D1FAE5]",
          border: "border-[#059669]",
          icon: <CheckCircle className="w-5 h-5 text-[#059669]" />,
          textColor: "text-[#059669]"
        }
      case "pending":
        return {
          bg: "bg-[#FEF3C7]",
          border: "border-[#92400E]",
          icon: <Clock className="w-5 h-5 text-[#92400E]" />,
          textColor: "text-[#92400E]"
        }
      case "warning":
        return {
          bg: "bg-[#FEE2E2]",
          border: "border-[#991B1B]",
          icon: <AlertCircle className="w-5 h-5 text-[#991B1B]" />,
          textColor: "text-[#991B1B]"
        }
    }
  }

  const styles = getStyles()

  return (
    <div className={`${styles.bg} border-[2px] border-[${styles.border}] rounded-lg p-4 flex items-start gap-3`}>
      <div className="flex-shrink-0">{styles.icon}</div>
      <div className="flex-1">
        <p className={`font-bold text-sm uppercase tracking-wider ${styles.textColor}`}>
          {message}
        </p>
        {details && (
          <p className={`text-xs ${styles.textColor} mt-1 opacity-80`}>
            {details}
          </p>
        )}
      </div>
    </div>
  )
}
