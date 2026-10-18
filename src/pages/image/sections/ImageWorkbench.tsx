import { Download, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import {
  buildOutputFilename,
  formatBytes,
  isPossibleAnimated,
  processImageFile,
  type ImageFormat,
  type ImageProcessOptions,
} from '../../../lib/image'

interface ResultEntry {
  status: 'done' | 'error'
  url?: string
  error?: string
  blob?: Blob
  format?: ImageFormat
  width?: number
  height?: number
  sourceWidth?: number
  sourceHeight?: number
}

interface WorkbenchProps {
  mode: 'compress' | 'convert'
}

export default function ImageWorkbench({ mode }: WorkbenchProps) {
  const [files, setFiles] = useState<File[]>([])
  const [results, setResults] = useState<ResultEntry[]>([])
  const [target, setTarget] = useState<'keep' | ImageFormat>(mode === 'convert' ? 'jpeg' : 'keep')
  const [quality, setQuality] = useState(0.8)
  const [maxSide, setMaxSide] = useState('')
  const urlsRef = useRef<string[]>([])

  useEffect(() => {
    if (files.length === 0) {
      return
    }
    let cancelled = false
    void (async () => {
      const side = Number(maxSide)
      const options: ImageProcessOptions = {
        targetFormat: target === 'keep' ? undefined : target,
        quality,
        ...(side > 0 ? { maxWidth: side, maxHeight: side } : {}),
      }
      const entries = await Promise.all(
        files.map(async (file): Promise<ResultEntry> => {
          try {
            const result = await processImageFile(file, options)
            return {
              status: 'done',
              url: URL.createObjectURL(result.blob),
              blob: result.blob,
              format: result.format,
              width: result.width,
              height: result.height,
              sourceWidth: result.sourceWidth,
              sourceHeight: result.sourceHeight,
            }
          } catch (err) {
            return { status: 'error', error: err instanceof Error ? err.message : String(err) }
          }
        }),
      )
      if (cancelled) {
        entries.forEach((entry) => {
          if (entry.url) {
            URL.revokeObjectURL(entry.url)
          }
        })
        return
      }
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      urlsRef.current = entries.flatMap((entry) => (entry.url ? [entry.url] : []))
      setResults(entries)
    })()
    return () => {
      cancelled = true
    }
  }, [files, target, quality, maxSide])

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const onPick = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return
    }
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    urlsRef.current = []
    setResults([])
    setFiles(Array.from(fileList))
  }

  const download = (file: File, entry: ResultEntry) => {
    if (!entry.url || !entry.format) {
      return
    }
    const anchor = document.createElement('a')
    anchor.href = entry.url
    anchor.download = buildOutputFilename(file.name, entry.format)
    anchor.click()
  }

  const busy = files.length > 0 && results.length !== files.length

  return (
    <div>
      <div className="field">
        <label>
          {mode === 'compress' ? '输出格式' : '目标格式'}
          <select value={target} onChange={(e) => setTarget(e.target.value as 'keep' | ImageFormat)}>
            {mode === 'compress' && <option value="keep">保持原格式</option>}
            <option value="jpeg">JPEG（有损）</option>
            <option value="png">PNG（无损）</option>
            <option value="webp">WebP（有损）</option>
          </select>
        </label>
        <label>
          质量（JPEG/WebP）：{Math.round(quality * 100)}%
          <input
            className="range-input"
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </label>
        <label>
          最大边长（px，可选）
          <input
            type="number"
            min={1}
            placeholder="不缩放"
            value={maxSide}
            onChange={(e) => setMaxSide(e.target.value)}
          />
        </label>
      </div>

      <label className="file-picker">
        <Upload size={14} aria-hidden="true" />
        选择图片（可多选）
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            onPick(e.target.files)
            e.target.value = ''
          }}
        />
      </label>

      {busy && <p className="hint-text">处理中…</p>}

      {files.length > 0 && results.length === files.length && (
        <table className="image-table">
          <thead>
            <tr>
              <th>预览</th>
              <th>文件</th>
              <th>原始</th>
              <th>输出</th>
              <th>节省</th>
              <th aria-label="操作"></th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => {
              const entry = results[index]!
              return (
                <tr key={`${file.name}-${index}`}>
                  <td className="thumb">
                    {entry.status === 'done' && entry.url ? (
                      <img src={entry.url} alt={`${file.name} 处理结果预览`} />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="file-cell">
                    {file.name}
                    {isPossibleAnimated(file.type) && (
                      <span className="warn-text">（动图仅保留首帧）</span>
                    )}
                  </td>
                  {entry.status === 'done' && entry.blob ? (
                    <>
                      <td className="num">
                        {entry.sourceWidth}×{entry.sourceHeight} · {formatBytes(file.size)}
                      </td>
                      <td className="num">
                        {entry.width}×{entry.height} · {formatBytes(entry.blob.size)}
                      </td>
                      {(() => {
                        const percent = Math.round((1 - entry.blob.size / file.size) * 100)
                        return (
                          <td className={percent > 0 ? 'ok-text' : 'muted-text'}>
                            {percent > 0 ? `-${percent}%` : `+${Math.abs(percent)}%`}
                          </td>
                        )
                      })()}
                      <td>
                        <button onClick={() => download(file, entry)}>
                          <Download size={14} aria-hidden="true" />
                          下载
                        </button>
                      </td>
                    </>
                  ) : (
                    <td colSpan={4} className="warn-text">
                      ✗ {entry.error}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <p className="hint-text">
        浏览器不支持输出 AVIF（HEIC 解码仅 Safari）；GIF / 动图 WebP / APNG 处理后只保留首帧；PNG
        为无损格式，减小体积需转为 JPEG/WebP 或缩小尺寸；所有处理均在本地完成。
      </p>
    </div>
  )
}
