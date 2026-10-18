import { KeyRound } from 'lucide-react'
import { useState } from 'react'

import CopyButton from '../../../components/CopyButton'
import { generateEd25519KeyPair, type SshKeyPairResult } from '../../../lib/ssh'

export default function SshSection() {
  const [comment, setComment] = useState('')
  const [generating, setGenerating] = useState(false)
  const [pair, setPair] = useState<SshKeyPairResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setGenerating(true)
    setError(null)
    try {
      setPair(await generateEd25519KeyPair(comment))
    } catch (err) {
      setPair(null)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setGenerating(false)
    }
  }

  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="field">
        <label>
          注释（可选，附加在公钥尾部，如 user@host）
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="webtools@local"
          />
        </label>
      </div>
      <div className="toolbar">
        <button onClick={() => void generate()} disabled={generating}>
          <KeyRound size={14} aria-hidden="true" />
          {generating ? '生成中…' : '生成 Ed25519 密钥对'}
        </button>
      </div>

      {error && <div className="error-box">✗ {error}</div>}

      {pair && (
        <>
          <div className="error-box">
            ⚠ 私钥为明文（未加 passphrase），请妥善保管、切勿分享；密钥仅存在于当前页面内存中，刷新后即消失。
          </div>
          <div className="result-list">
            <div className="result-row">
              <span className="result-label">指纹</span>
              <span className="result-value mono with-action">
                {pair.fingerprint}
                <CopyButton value={pair.fingerprint} />
              </span>
            </div>
          </div>
          <h3 className="sub-block-title">公钥（可添加到服务器的 authorized_keys）</h3>
          <textarea className="editor enc-key-input" value={pair.publicKey} readOnly spellCheck={false} />
          <div className="toolbar toolbar-end">
            <CopyButton value={pair.publicKey} label="复制公钥" />
            <button onClick={() => download('id_ed25519.pub', pair.publicKey)}>下载 id_ed25519.pub</button>
          </div>
          <h3 className="sub-block-title">私钥（~/.ssh/id_ed25519）</h3>
          <textarea className="editor enc-key-input" value={pair.privateKey} readOnly spellCheck={false} />
          <div className="toolbar toolbar-end">
            <CopyButton value={pair.privateKey} label="复制私钥" />
            <button onClick={() => download('id_ed25519', pair.privateKey)}>下载 id_ed25519</button>
          </div>
        </>
      )}

      <p className="hint-text">
        Ed25519 为现代算法：密钥短、签名快、安全性高，OpenSSH 6.5+ 支持。带 passphrase
        的私钥加密与 RSA / ECDSA 类型为后续版本计划。
      </p>
    </div>
  )
}
