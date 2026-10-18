import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

import CopyButton from '../../../components/CopyButton'
import {
  MAX_LENGTH,
  defaultOptions,
  estimateStrength,
  generatePassword,
  type PasswordOptions,
  type StrengthLevel,
} from '../../../lib/password'

const STRENGTH_CLASS: Record<StrengthLevel, string> = {
  'very-weak': 'fill-very-weak',
  weak: 'fill-weak',
  fair: 'fill-fair',
  strong: 'fill-strong',
  'very-strong': 'fill-very-strong',
}

const checkboxes: Array<{ key: keyof PasswordOptions; label: string }> = [
  { key: 'lowercase', label: '小写字母 a-z' },
  { key: 'uppercase', label: '大写字母 A-Z' },
  { key: 'digits', label: '数字 0-9' },
  { key: 'symbols', label: '符号 !@#$…' },
]

function tryGenerate(options: PasswordOptions): { password: string; error: string | null } {
  try {
    return { password: generatePassword(options), error: null }
  } catch (err) {
    return { password: '', error: err instanceof Error ? err.message : String(err) }
  }
}

export default function PasswordSection() {
  const [options, setOptions] = useState<PasswordOptions>(defaultOptions)
  const [result, setResult] = useState(() => tryGenerate(defaultOptions()))

  const update = (patch: Partial<PasswordOptions>) => {
    const next = { ...options, ...patch }
    setOptions(next)
    setResult(tryGenerate(next))
  }

  const regenerate = () => {
    setResult(tryGenerate(options))
  }

  const strength = (() => {
    try {
      return estimateStrength(options)
    } catch {
      return null
    }
  })()

  return (
    <section className="tsec">
      <div className="tsec-head">
        <h2>密码生成</h2>
        <span className="sub">crypto.getRandomValues · 拒绝采样</span>
      </div>

      <div className="field">
        <label>
          长度：{options.length} 位
          <input
            className="range-input"
            type="range"
            min={4}
            max={MAX_LENGTH}
            value={options.length}
            onChange={(e) => update({ length: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="check-row">
        {checkboxes.map((item) => (
          <label key={item.key} className="check-item">
            <input
              type="checkbox"
              checked={Boolean(options[item.key])}
              onChange={(e) => update({ [item.key]: e.target.checked } as Partial<PasswordOptions>)}
            />
            {item.label}
          </label>
        ))}
        <label className="check-item">
          <input
            type="checkbox"
            checked={options.excludeAmbiguous}
            onChange={(e) => update({ excludeAmbiguous: e.target.checked })}
          />
          排除易混淆字符（i l 1 I L o 0 O | `）
        </label>
      </div>

      {result.error ? (
        <p className="warn-text">✗ {result.error}</p>
      ) : (
        <>
          <div className="password-output mono">{result.password}</div>
          <div className="toolbar">
            <CopyButton value={result.password} label="复制密码" />
            <button onClick={regenerate}>
              <RefreshCw size={14} aria-hidden="true" />
              重新生成
            </button>
          </div>
          {strength && (
            <div className="strength-block">
              <div
                className="strength-bar"
                role="meter"
                aria-valuenow={strength.entropyBits}
                aria-valuemin={0}
                aria-valuemax={128}
                aria-label="密码强度"
              >
                <div
                  className={`strength-fill ${STRENGTH_CLASS[strength.level]}`}
                  style={{ width: `${Math.min(100, (strength.entropyBits / 128) * 100)}%` }}
                />
              </div>
              <span className="strength-label">
                {strength.label} · 约 {strength.entropyBits} bits 熵
              </span>
            </div>
          )}
        </>
      )}
    </section>
  )
}
