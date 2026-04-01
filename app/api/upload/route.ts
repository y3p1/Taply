import { NextRequest } from 'next/server'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-utils'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// POST /api/upload — Upload selfie image
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const { image } = body // base64 data URL

    if (!image) {
      return errorResponse('No image provided', 400)
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      // Fallback: return base64 as-is (for development without Cloudinary)
      return successResponse({ url: image, provider: 'local' })
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'taply/selfies',
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
      ],
      public_id: `${user!.id}_${Date.now()}`,
    })

    return successResponse({ url: result.secure_url, provider: 'cloudinary' })
  } catch (error) {
    console.error('Upload error:', error)
    return errorResponse('Failed to upload image', 500)
  }
}
