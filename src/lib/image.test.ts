import { describe, expect, it } from 'vitest'

import {
  buildOutputFilename,
  clampQuality,
  computeTargetSize,
  extensionOf,
  formatBytes,
  formatFromMime,
  isLossyFormat,
  isPossibleAnimated,
  mimeOf,
} from './image'

describe('格式映射', () => {
  it('mime 与格式互转', () => {
    expect(mimeOf('png')).toBe('image/png')
    expect(mimeOf('jpeg')).toBe('image/jpeg')
    expect(mimeOf('webp')).toBe('image/webp')
    expect(formatFromMime('image/png')).toBe('png')
    expect(formatFromMime('IMAGE/JPEG')).toBe('jpeg')
    expect(formatFromMime('image/bmp')).toBeNull()
  })

  it('扩展名映射（jpeg 输出为 jpg）', () => {
    expect(extensionOf('jpeg')).toBe('jpg')
    expect(extensionOf('png')).toBe('png')
    expect(extensionOf('webp')).toBe('webp')
  })

  it('有损格式判断', () => {
    expect(isLossyFormat('jpeg')).toBe(true)
    expect(isLossyFormat('webp')).toBe(true)
    expect(isLossyFormat('png')).toBe(false)
  })

  it('动图格式判断', () => {
    expect(isPossibleAnimated('image/gif')).toBe(true)
    expect(isPossibleAnimated('image/webp')).toBe(true)
    expect(isPossibleAnimated('image/apng')).toBe(true)
    expect(isPossibleAnimated('image/png')).toBe(false)
    expect(isPossibleAnimated('image/jpeg')).toBe(false)
  })
})

describe('computeTargetSize', () => {
  it('无选项时保持原尺寸', () => {
    expect(computeTargetSize(1920, 1080)).toEqual({ width: 1920, height: 1080 })
  })

  it('按比例缩放', () => {
    expect(computeTargetSize(1000, 500, { scale: 0.5 })).toEqual({ width: 500, height: 250 })
  })

  it('最大边长约束且保持宽高比（只缩不放）', () => {
    expect(computeTargetSize(2000, 1000, { maxWidth: 1000 })).toEqual({ width: 1000, height: 500 })
    expect(computeTargetSize(1000, 2000, { maxHeight: 500 })).toEqual({ width: 250, height: 500 })
    expect(computeTargetSize(800, 600, { maxWidth: 1000 })).toEqual({ width: 800, height: 600 })
  })

  it('宽高同时约束取更小因子', () => {
    expect(computeTargetSize(4000, 3000, { maxWidth: 1000, maxHeight: 1000 })).toEqual({
      width: 1000,
      height: 750,
    })
  })

  it('比例与边长约束叠加', () => {
    expect(computeTargetSize(2000, 1000, { scale: 0.5, maxWidth: 800 })).toEqual({
      width: 800,
      height: 400,
    })
  })

  it('结果至少 1×1', () => {
    expect(computeTargetSize(10, 10, { scale: 0.01 })).toEqual({ width: 1, height: 1 })
  })
})

describe('buildOutputFilename', () => {
  it('替换扩展名并加后缀', () => {
    expect(buildOutputFilename('photo.PNG', 'jpeg')).toBe('photo-webtools.jpg')
    expect(buildOutputFilename('a.b.c.png', 'webp')).toBe('a.b.c-webtools.webp')
  })

  it('无扩展名与后缀去重', () => {
    expect(buildOutputFilename('photo', 'png')).toBe('photo-webtools.png')
    expect(buildOutputFilename('photo-webtools.png', 'png')).toBe('photo-webtools.png')
  })
})

describe('clampQuality / formatBytes', () => {
  it('质量钳制在 [0.1, 1]', () => {
    expect(clampQuality(0)).toBe(0.1)
    expect(clampQuality(2)).toBe(1)
    expect(clampQuality(0.75)).toBe(0.75)
    expect(clampQuality(Number.NaN)).toBe(0.8)
  })

  it('字节格式化', () => {
    expect(formatBytes(500)).toBe('500 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.00 MB')
    expect(formatBytes(-1)).toBe('—')
  })
})
