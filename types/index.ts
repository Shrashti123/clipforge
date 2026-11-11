export interface Video {
    id: string
    userId: string
    title: string
    description: string
    publicId: string
    originalSize: number
    compressedSize: number
    duration: number
    createdAt: Date
    updatedAt: Date
}
