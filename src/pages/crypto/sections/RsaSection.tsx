import { KeyRound } from 'lucide-react'
import { useState } from 'react'

import CopyButton from '../../../components/CopyButton'
import { generateRsaKeyPair, rsaDecrypt, rsaEncrypt } from '../../../lib/encryption'

export default function RsaSection() {
  const [generating, setGenerating] = useState(false)
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const generateKeys = async () => {
    setGenerating(true)
    setError(null)
    try {
      const pair = await generateRsaKeyPair()
      setPublicKey(pair.publicKeyPem)
      setPrivateKey(pair.privateKeyPem)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setGenerating(false)
    }
  }

  const run = async (action: 'encrypt' | 'decrypt') => {
    try {
      const result =
        action === 'encrypt'
          ? await rsaEncrypt(publicKey, input)
          : await rsaDecrypt(privateKey, input)
      setOutput(result)
      setError(null)
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div>
      <div className="toolbar">
        <button onClick={() => void generateKeys()} disabled={generating}>
          <KeyRound size={14} aria-hidden="true" />
          {generating ? '生成中…' : '生成密钥对（3072 位）'}
        </button>
      </div>
      <div className="section-grid">
        <div>
          <h3>公钥（加密用，可粘贴自己的）</h3>
          <textarea
            className="editor enc-key-input"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="-----BEGIN PUBLIC KEY-----"
            spellCheck={false}
          />
        </div>
        <div>
          <h3>私钥（解密用，仅在本地）</h3>
          <textarea
            className="editor enc-key-input"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="-----BEGIN PRIVATE KEY-----"
            spellCheck={false}
          />
        </div>
      </div>
      <textarea
        className="editor enc-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入明文（加密）或 Base64 密文（解密）…"
        spellCheck={false}
      />
      <div className="toolbar">
        <button onClick={() => void run('encrypt')} disabled={!input || !publicKey}>
          公钥加密
        </button>
        <button onClick={() => void run('decrypt')} disabled={!input || !privateKey}>
          私钥解密
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
      <p className="hint-text">RSA-OAEP（SHA-256）适合短文本（约 300 字节内）；长文本请使用对称加密。</p>
    </div>
  )
}
