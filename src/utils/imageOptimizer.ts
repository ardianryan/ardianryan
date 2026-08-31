/**
 * Client-side browser image optimizer:
 * Converts uploaded media (PNG, JPG, HEIC, etc.) to modern high-efficiency WebP format
 * and scales down huge camera images for blazing SEO page speed.
 */
export async function convertAndOptimizeToWebP(
  file: File,
  maxWidth = 1920,
  maxHeight = 1200,
  quality = 0.85
): Promise<{ base64: string; fileName: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Maintain aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        const webpBase64 = canvas.toDataURL('image/webp', quality)
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        const webpFileName = `${nameWithoutExt}.webp`

        // Estimate size in bytes
        const stringLength = webpBase64.length - 'data:image/webp;base64,'.length
        const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.562489633438347

        resolve({
          base64: webpBase64,
          fileName: webpFileName,
          size: Math.round(sizeInBytes),
        })
      }
      img.onerror = () => reject(new Error('Failed to load image for optimization'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}
