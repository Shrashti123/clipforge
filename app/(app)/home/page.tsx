"use client"
import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import VideoCard from "@/components/VideoCard"
import { Video } from "@/types"

function Home() {
    const [videos, setVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchVideos = useCallback(async () => {
        try {
            const response = await axios.get("/api/videos")
            if (Array.isArray(response.data)) {
                setVideos(response.data)
            } else {
                throw new Error("Unexpected response format")
            }
        } catch (err) {
            console.error(err)
            setError("Failed to fetch videos")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchVideos()
    }, [fetchVideos])

    // Fixed: the original handler returned a function instead of running it,
    // so the download button did nothing.
    const handleDownload = useCallback((url: string, title: string) => {
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `${title}.mp4`)
        link.setAttribute("target", "_blank")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }, [])

    const handleDelete = useCallback(async (id: string) => {
        if (!window.confirm("Delete this video permanently?")) return
        try {
            await axios.delete(`/api/videos/${id}`)
            setVideos((prev) => prev.filter((v) => v.id !== id))
        } catch (err) {
            console.error(err)
            setError("Failed to delete video")
        }
    }, [])

    if (loading) {
        return <div className="p-4"><span className="loading loading-spinner loading-md" /></div>
    }

    return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">My Videos</h1>
          {error && (
            <div role="alert" className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          {videos.length === 0 ? (
            <div className="text-center text-lg text-gray-500">
              You haven&apos;t uploaded any videos yet
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard
                    key={video.id}
                    video={video}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )
}

export default Home
