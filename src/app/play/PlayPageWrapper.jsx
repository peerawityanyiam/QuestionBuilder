"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

const PlayQuiz = dynamic(() => import("./PlayQuiz"), { ssr: false })

export default function PlayPageWrapper() {
  return (
    <Suspense fallback={<p className="p-6 text-center">Loading quiz...</p>}>
      <PlayQuiz />
    </Suspense>
  )
}
