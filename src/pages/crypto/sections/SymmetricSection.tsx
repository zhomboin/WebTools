import { useState } from 'react'

import CopyButton from '../../../components/CopyButton'
import { decryptText, encryptText, type SymmetricAlgorithm } from '../../../lib/encryption'

export default function SymmetricSection() {
  const [mode, setMode] = useState<SymmetricAlgorithm>('AES-GCM')
  const [password, setPassword] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const run = async (action: 'encrypt' | 'decrypt') => {
    try {
      const result =
        action === 'encrypt'
          ? await encryptText(mode, input, password)
          : await decryptText(mode, input, password)
      setOutput(result)
      setError(null)
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div>
      <div className="field">
        <label>
          模式
          <select value={mode} onChange={(e) => setMode(e.target.value as SymmetricAlgorithm)}>
            <option value="AES-GCM">AES-GCM（推荐）</option>
            <option value="AES-CBC">AES-CBC</option>
          </select>
        </label>
        <label>
          口令
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="用于派生加密密钥"
          />
        </label>
      </div>
      <textarea
        className="editor enc-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入明文（加密）或 Base64 密文（解密）…"
        spellCheck={false}
      />
      <div className="toolbar">
        <button onClick={() => void run('encrypt')} disabled={!input || !password}>
          加密
        </button>
        <button onClick={() => void run('decrypt')} disabled={!input || !password}>
          解密
        </button>
      </div>
      {error && <div className="error-box">✗ {error}</div>}
      {output && (
        <>
          <textarea className="editor enc-input" value={output} readOnly spellCheck={false} />
          <div className="toolbar toolbar-end">
            <CopyButton value={output} label="复制结果" />
          </div>
        </>
      )}
      <p className="hint-text">
        密文格式为 Base64(salt + iv + 密文)，每次加密使用随机盐与 IV；口令经 PBKDF2（10 万次迭代）派生 256 位密钥；GCM 模式带完整性校验。
      </p>
    </div>
  )
}
