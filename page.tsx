"use client"

import { useState, useEffect } from "react"
import { LearningDashboard } from "@/components/learning-dashboard"
import { EngagementFeedback } from "@/components/engagement-feedback"
import { ContentDisplay } from "@/components/content-display"
import { WebcamCapture } from "@/components/webcam-capture"
import { Header } from "@/components/header"

export default function Home() {
  const [engagement, setEngagement] = useState<string>("neutral")
  const [contentType, setContentType] = useState<"text" | "video" | "quiz">("text")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Demo mode for testing without backend
  const [demoMode, setDemoMode] = useState<boolean>(true)

  // Demo function to simulate backend responses
  const simulateEngagementChange = () => {
    if (!demoMode) return

    const emotions = ["engaged", "confused", "bored", "interested"]
    const contentTypes: ("text" | "video" | "quiz")[] = ["text", "video", "quiz"]

    setIsLoading(true)

    setTimeout(() => {
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
      const randomContent = contentTypes[Math.floor(Math.random() * contentTypes.length)]

      setEngagement(randomEmotion)
      setContentType(randomContent)
      setIsLoading(false)
    }, 2000)
  }

  // For demo purposes, change engagement every 15 seconds
  useEffect(() => {
    if (!demoMode) return

    const interval = setInterval(() => {
      simulateEngagementChange()
    }, 15000)

    return () => clearInterval(interval)
  }, [demoMode])

  return (
    <main className="min-h-screen bg-gray-50">
      <Header demoMode={demoMode} setDemoMode={setDemoMode} onSimulate={simulateEngagementChange} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <WebcamCapture
                onFrame={(frame) => {
                  if (!demoMode) {
                    // Here you would send the frame to your backend
                    console.log("Frame captured, would send to backend")
                  }
                }}
                demoMode={demoMode}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <ContentDisplay contentType={contentType} engagement={engagement} isLoading={isLoading} />
            </div>
          </div>

          <div className="space-y-6">
            <EngagementFeedback engagement={engagement} isLoading={isLoading} />

            <LearningDashboard engagement={engagement} contentType={contentType} />
          </div>
        </div>
      </div>
    </main>
  )

}

