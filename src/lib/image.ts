export type ImageFormat = 'png' | 'jpeg' | 'webp'

export const SUPPORTED_OUTPUT_FORMATS: readonly ImageFormat[] = ['png', 'jpeg', 'webp']

const MIME_BY_FORMAT: Record<ImageFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

const EXTENSION_BY_FORMAT: Record<ImageFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
}

export class ImageProcessError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImageProcessError'
  }
}

export function mimeOf(format: ImageFormat): string {
  return MIME_BY_FORMAT[format]
}

export function formatFromMime(mime: string): ImageFormat | null {
  const normalized = mime.trim().toLowerCase()
  const entry = (Object.keys(MIME_BY_FORMAT) as ImageFormat[]).find(
    (format) => MIME_BY_FORMAT[format] === normalized,
  )
  return entry ?? null
}

export function extensionOf(format: ImageFormat): string {
  return EXTENSION_BY_FORMAT[format]
}

export function isLossyFormat(format: ImageFormat): boolean {
  return format === 'jpeg' || format === 'webp'
}

export function isPossibleAnimated(mime: string): boolean {
  const normalized = mime.trim().toLowerCase()
  return normalized === 'image/gif' || normalized === 'image/webp' || normalized === 'image/apng'
}

export function clampQuality(quality: number): number {
  if (!Number.isFinite(quality)) {
    return 0.8
  }
  return Math.min(1, Math.max(0.1, quality))
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '—'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export interface SizeOptions {
  scale?: number
  maxWidth?: number
  maxHeight?: number
}

// 保持宽高比，只缩不放；结果至少 1×1
export function computeTargetSize(
  width: number,
  height: number,
  options: SizeOptions = {},
): { width: number; height: number } {
  let scaledWidth = width
  let scaledHeight = height
  const { scale, maxWidth, maxHeight } = options
  if (scale !== undefined && scale > 0 && scale !== 1) {
    scaledWidth = width * scale
    scaledHeight = height * scale
  }
  const candidates: number[] = [1]
  if (maxWidth !== undefined && maxWidth > 0) {
    candidates.push(maxWidth / scaledWidth)
  }
  if (maxHeight !== undefined && maxHeight > 0) {
    candidates.push(maxHeight / scaledHeight)
  }
  const factor = Math.min(...candidates)
  return {
    width: Math.max(1, Math.round(scaledWidth * factor)),
    height: Math.max(1, Math.round(scaledHeight * factor)),
  }
}

export function buildOutputFilename(
  original: string,
  format: ImageFormat,
  suffix = '-webtools',
): string {
  const dot = original.lastIndexOf('.')
  const stem = dot > 0 ? original.slice(0, dot) : original
  const base = stem.endsWith(suffix) ? stem : `${stem}${suffix}`
  return `${base}.${EXTENSION_BY_FORMAT[format]}`
}

// ---- 以下为浏览器 Canvas 管线（依赖 createImageBitmap / OffscreenCanvas，纯逻辑已抽离至上方函数 ----

export interface ImageProcessOptions extends SizeOptions {
  targetFormat?: ImageFormat
  quality?: number
}

export interface ImageProcessResult {
  blob: Blob
  format: ImageFormat
  width: number
  height: number
  sourceWidth: number
  sourceHeight: number
}

export async function processImageFile(
  file: File,
  options: ImageProcessOptions = {},
): Promise<ImageProcessResult> {
  const sourceFormat = formatFromMime(file.type)
  const targetFormat = options.targetFormat ?? sourceFormat ?? 'png'
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new ImageProcessError('无法解码该图片（浏览器不支持的格式，如 HEIC 仅 Safari 可解码）')
  }
  try {
    const { width, height } = computeTargetSize(bitmap.width, bitmap.height, options)
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new ImageProcessError('无法创建画布上下文')
    }
    if (targetFormat === 'jpeg') {
      // JPEG 无透明通道，先铺白底避免透明区域变黑
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    const blob = await canvas.convertToBlob({
      type: MIME_BY_FORMAT[targetFormat],
      quality: isLossyFormat(targetFormat) ? clampQuality(options.quality ?? 0.8) : undefined,
    })
    return {
      blob,
      format: targetFormat,
      width,
      height,
      sourceWidth: bitmap.width,
      sourceHeight: bitmap.height,
    }
  } finally {
    bitmap.close()
  }
}
