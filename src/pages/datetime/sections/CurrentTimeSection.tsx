import { useEffect, useState } from 'react'

import CopyButton from '../../../components/CopyButton'
import { formatInTimeZone, localTimeZone, toUnixTimestamp } from '../../../lib/datetime'

export default function CurrentTimeSection() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const { seconds, milliseconds } = toUnixTimestamp(now)
  const local = localTimeZone()

  return (
    <section className="section-card">
      <h2>当前时间</h2>
      <div className="result-list">
        <div className="result-row">
          <span className="result-label">本地（{local}）</span>
          <span className="result-value">
            {formatInTimeZone(now, local, 'zh-CN', { dateStyle: 'full', timeStyle: 'medium' })}
          </span>
        </div>
        <div className="result-row">
          <span className="result-label">UTC</span>
          <span className="result-value">
            {formatInTimeZone(now, 'UTC', 'zh-CN', { dateStyle: 'full', timeStyle: 'medium' })}
          </span>
        </div>
        <div className="result-row">
          <span className="result-label">ISO 8601</span>
          <span className="result-value mono">{now.toISOString()}</span>
        </div>
        <div className="result-row">
          <span className="result-label">Unix 时间戳（秒）</span>
          <span className="result-value mono with-action">
            {seconds}
            <CopyButton value={String(seconds)} />
          </span>
        </div>
        <div className="result-row">
          <span className="result-label">Unix 时间戳（毫秒）</span>
          <span className="result-value mono with-action">
            {milliseconds}
            <CopyButton value={String(milliseconds)} />
          </span>
        </div>
      </div>
    </section>
  )
}
