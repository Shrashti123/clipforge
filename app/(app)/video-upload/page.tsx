"use client"
import React, { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

const MAX_FILE_SIZE = 70 * 1024 * 1024 // 70 MB

function VideoUpload() {
    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        if (!file.type.startsWith("video/")) {
            setError("Please choose a video file.")
            return
        }
        if (file.size > MAX_FILE_SIZE) {
            setError("File is too large. Maximum size is 70 MB.")
            return
        }

        setError(null)
        setProgress(0)
        setIsUploading(true)

        try {
            // 1. Ask our server for a signature (also checks the user is signed in)
            const { data: sig } = await axios.post("/api/sign-upload")

            // 2. Upload straight to Cloudinary, bypassing our serverless body limit
            const form = new FormData()
            form.append("file", file)
            form.append("api_key", sig.apiKey)
            form.append("timestamp", String(sig.timestamp))
            form.append("signature", sig.signature)
            form.append("folder", sig.folder)
            form.append("transformation", sig.transformation)

            const { data: uploaded } = await axios.post(
                `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`,
                form,
                {
                    onUploadProgress: (ev) => {
                        if (ev.total) setProgress(Math.round((ev.loaded / ev.total) * 100))
                    },
                }
            )

            // 3. Save metadata; the server re-reads size/duration from Cloudinary
            await axios.post("/api/videos", {
                title,
                description,
                publicId: uploaded.public_id,
                originalSize: file.size,
            })

            router.push("/home")
        } catch (err) {
            console.error(err)
            setError("Upload failed. Please try again.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Upload Video</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                value={description}
                maxLength={1000}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Video File (max 70 MB)</span>
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="file-input file-input-bordered w-full"
                required
              />
            </div>

            {isUploading && (
              <progress className="progress progress-primary w-full" value={progress} max={100} />
            )}
            {error && (
              <div role="alert" className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              {isUploading ? `Uploading... ${progress}%` : "Upload Video"}
            </button>
          </form>
        </div>
      )
}

export default VideoUpload
