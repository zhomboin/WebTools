import { useMemo, useState } from 'react'

import {
  formatInTimeZone,
  listTimeZones,
  localTimeZone,
  toDatetimeLocalValue,
} from '../../../lib/datetime'

const COMMON_ZONES = [
  'UTC',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
]

export default function TimeZoneSection() {
  const local = localTimeZone()
  const [instantInput, setInstantInput] = useState(() => toDatetimeLocalValue(new Date()))
  const [targetZone, setTargetZone] = useState('America/New_York')
  const zones = useMemo(() => listTimeZones(), [])

  const instant = useMemo(() => {
    const date = new Date(instantInput)
    return Number.isNaN(date.getTime()) ? null : date
  }, [instantInput])

  // ECMA-402 不允许 dateStyle/timeStyle 与 timeZoneName 组合，须用组件式选项
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'shortOffset',
  }

  return (
    <section className="tsec">
      <div className="tsec-head">
        <h2>时区转换</h2>
        <span className="sub">全量 IANA 时区</span>
      </div>
      <div className="field">
        <label>
          日期时间（本地时区 {local}）
          <input
            type="datetime-local"
            value={instantInput}
            onChange={(e) => setInstantInput(e.target.value)}
          />
        </label>
        <label>
          目标时区
          <select value={targetZone} onChange={(e) => setTargetZone(e.target.value)}>
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </label>
      </div>
      {instant && (
        <>
          <div className="result-list">
            <div className="result-row">
              <span className="result-label">{targetZone}</span>
              <span className="result-value">{formatInTimeZone(instant, targetZone, 'zh-CN', formatOptions)}</span>
            </div>
          </div>
          <h3>常用时区对照</h3>
          <table className="zone-table">
            <thead>
              <tr>
                <th>时区</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{local}（本地）</td>
                <td>{formatInTimeZone(instant, local, 'zh-CN', formatOptions)}</td>
              </tr>
              {COMMON_ZONES.map((zone) => (
                <tr key={zone}>
                  <td>{zone}</td>
                  <td>{formatInTimeZone(instant, zone, 'zh-CN', formatOptions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}
