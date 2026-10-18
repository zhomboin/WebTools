import { useMemo, useState } from 'react'

import {
  formatInTimeZone,
  fromTimestamp,
  localTimeZone,
  relativeTime,
  toDatetimeLocalValue,
  toUnixTimestamp,
  type TimestampUnit,
} from '../../../lib/datetime'

export default function TimestampSection() {
  const [tsInput, setTsInput] = useState(() => String(Math.floor(Date.now() / 1000)))
  const [unit, setUnit] = useState<TimestampUnit>('auto')
  const [dateInput, setDateInput] = useState(() => toDatetimeLocalValue(new Date()))

  const tsResult = useMemo(() => fromTimestamp(tsInput, unit), [tsInput, unit])
  const dateValue = useMemo(() => {
    const date = new Date(dateInput)
    return Number.isNaN(date.getTime()) ? null : date
  }, [dateInput])

  return (
    <section className="tsec">
      <div className="tsec-head">
        <h2>时间戳 ⇄ 日期</h2>
        <span className="sub">秒 / 毫秒自动识别</span>
      </div>
      <div className="section-grid">
        <div>
          <h3>时间戳 → 日期</h3>
          <div className="field">
            <label>
              时间戳
              <input
                type="text"
                value={tsInput}
                onChange={(e) => setTsInput(e.target.value)}
                placeholder="如 1700000000"
              />
            </label>
            <label>
              单位
              <select value={unit} onChange={(e) => setUnit(e.target.value as TimestampUnit)}>
                <option value="auto">自动识别</option>
                <option value="s">秒</option>
                <option value="ms">毫秒</option>
              </select>
            </label>
          </div>
          {tsResult.ok && tsResult.date ? (
            <div className="result-list">
              <div className="result-row">
                <span className="result-label">本地（{localTimeZone()}）</span>
                <span className="result-value">
                  {formatInTimeZone(tsResult.date, localTimeZone(), 'zh-CN', {
                    dateStyle: 'full',
                    timeStyle: 'medium',
                  })}
                </span>
              </div>
              <div className="result-row">
                <span className="result-label">识别单位</span>
                <span className="result-value">{tsResult.unit === 's' ? '秒' : '毫秒'}</span>
              </div>
              <div className="result-row">
                <span className="result-label">ISO 8601</span>
                <span className="result-value mono">{tsResult.date.toISOString()}</span>
              </div>
              <div className="result-row">
                <span className="result-label">相对现在</span>
                <span className="result-value">{relativeTime(tsResult.date)}</span>
              </div>
            </div>
          ) : (
            <p className="warn-text">✗ {tsResult.error}</p>
          )}
        </div>
        <div>
          <h3>日期 → 时间戳</h3>
          <div className="field">
            <label>
              日期时间（本地时区）
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
              />
            </label>
          </div>
          {dateValue && (
            <div className="result-list">
              <div className="result-row">
                <span className="result-label">Unix 时间戳（秒）</span>
                <span className="result-value mono">{toUnixTimestamp(dateValue).seconds}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Unix 时间戳（毫秒）</span>
                <span className="result-value mono">{toUnixTimestamp(dateValue).milliseconds}</span>
              </div>
              <div className="result-row">
                <span className="result-label">ISO 8601</span>
                <span className="result-value mono">{dateValue.toISOString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
