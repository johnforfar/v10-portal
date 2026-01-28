"use client"

import React, { useState, useEffect } from "react"
import { X } from "lucide-react"

interface StudioIframeProps {
  src: string
  title: string
  noBanner?: boolean
  customMessage?: string
}

export default function StudioIframe({ src, title, noBanner = false, customMessage }: StudioIframeProps) {
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Show modal after a short delay when loading an external studio link
    if (!noBanner && (src.includes("vercel.app") || customMessage)) {
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setShowModal(false)
    }
  }, [src, noBanner, customMessage])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase">Initializing Workspace...</p>
          </div>
        </div>
      )}

      <iframe
        src={src}
        title={title}
        className="w-full h-full border-none"
        onLoad={() => setIsLoading(false)}
        allow="accelerometer; border-red-500; camera; gyroscope; microphone; serial; usb"
      />

      {/* Access Restricted Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#1A1B1C] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center gap-10">
              <div className="size-24 rounded-2xl flex items-center justify-center border border-blue-600/20 shadow-lg overflow-hidden">
                <img src="/icon.png" alt="V10 Logo" className="w-16 h-16 object-contain" />
              </div>

              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  {customMessage ? "Platform Access" : "Studio Access Restricted"}
                </h3>
                <p className="text-xl text-white/60 leading-relaxed italic">
                  {customMessage || "\"PENDING CODE TRANSFER\""}
                </p>
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="w-full rounded-xl bg-blue-600 py-5 text-xl font-bold text-white transition-all hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-900/20"
              >
                {customMessage ? "Acknowledge and Continue" : "Acknowledge and Preview Demo"}
              </button>
              
              <p className="text-xs font-bold text-white/20 tracking-[0.2em] uppercase">OpenxAI Studio v10</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
