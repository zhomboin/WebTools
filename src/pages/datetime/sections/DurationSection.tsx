import { useMemo, useState } from 'react'

import { diffDuration, toDatetimeLocalValue } from '../../../lib/datetime'

export default function DurationSection() {
  const [startInput, setStartInput] = useState(() => toDatetimeLocalValue(new Date()))
  const [endInput, setEndInput] = useState(() => toDatetimeLocalValue(new Date(Date.now() + 3_600_000)))

  const duration = useMemo(() => {
    const start = new Date(startInput)
    const end = new Date(endInput)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null
    }
    return diffDuration(end, start)
  }, [startInput, endInput])

  return (
    <section className="section-card">
      <h2>时间差计算</h2>
      <div className="field">
        <label>
          开始时间（本地时区）
          <input
            type="datetime-local"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
          />
        </label>
        <label>
          结束时间（本地时区）
          <input
            type="datetime-local"
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
          />
        </label>
      </div>
      {duration && (
        <div className="result-list">
          <div className="result-row">
            <span className="result-label">时间差</span>
            <span className="result-value">{duration.humanize}</span>
          </div>
          <div className="result-row">
            <span className="result-label">分解</span>
            <span className="result-value">
              {duration.days} 天 {duration.hours} 小时 {duration.minutes} 分钟 {duration.seconds} 秒
            </span>
          </div>
          <div className="result-row">
            <span className="result-label">总毫秒数</span>
            <span className="result-value mono">{duration.totalMs}</span>
          </div>
        </div>
      )}
    </section>
  )
}
