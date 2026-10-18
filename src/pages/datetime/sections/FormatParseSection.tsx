import { useMemo, useState } from 'react'

import { formatCustom, parseCustom, toUnixTimestamp } from '../../../lib/datetime'

const DEFAULT_PATTERN = 'yyyy-MM-dd HH:mm:ss'

export default function FormatParseSection() {
  const [sampleDate] = useState(() => new Date())
  const [pattern, setPattern] = useState(DEFAULT_PATTERN)
  const [text, setText] = useState(() => formatCustom(new Date(), DEFAULT_PATTERN))

  const effectivePattern = pattern.trim() === '' ? DEFAULT_PATTERN : pattern
  const preview = useMemo(
    () => formatCustom(sampleDate, effectivePattern),
    [sampleDate, effectivePattern],
  )
  const parsed = useMemo(() => parseCustom(text, effectivePattern), [text, effectivePattern])

  return (
    <section className="tsec">
      <div className="tsec-head">
        <h2>格式化与解析</h2>
      </div>
      <div className="section-grid">
        <div>
          <h3>日期 → 文本</h3>
          <div className="field">
            <label>
              格式模式
              <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} />
            </label>
          </div>
          <div className="result-list">
            <div className="result-row">
              <span className="result-label">当前时间</span>
              <span className="result-value mono">{preview}</span>
            </div>
          </div>
        </div>
        <div>
          <h3>文本 → 日期</h3>
          <div className="field">
            <label>
              日期文本
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
            </label>
          </div>
          <div className="result-list">
            {parsed ? (
              <>
                <div className="result-row">
                  <span className="result-label">ISO 8601</span>
                  <span className="result-value mono">{parsed.toISOString()}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Unix 时间戳（秒）</span>
                  <span className="result-value mono">{toUnixTimestamp(parsed).seconds}</span>
                </div>
              </>
            ) : (
              <p className="warn-text">✗ 文本与模式不匹配，或不是合法日期</p>
            )}
          </div>
        </div>
      </div>
      <p className="hint-text">支持的占位符：yyyy、MM、dd、HH、mm、ss、SSS，其余字符按原样输出；解析结果为本地时区。</p>
    </section>
  )
}
