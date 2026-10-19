"use client"

import { useEffect, useState } from "react"

import { Banner } from "@modules/common/components/notice"

/**
 * Shown while the browser has no network. It reads navigator.onLine only
 * after mount (the server cannot know), and listens to the window's
 * online/offline events. Nothing is cached: the page just says so.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="content-container pt-4">
      <Banner
        tone="err"
        role="alert"
        title="Mất kết nối mạng"
        description="Một số thao tác có thể không chạy. Hãy kiểm tra mạng rồi thử lại."
      />
    </div>
  )
}
