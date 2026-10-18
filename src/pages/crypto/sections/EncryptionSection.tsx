import { KeyRound } from 'lucide-react'
import { useState } from 'react'

import CopyButton from '../../../components/CopyButton'
import {
  decryptText,
  encryptText,
  generateRsaKeyPair,
  rsaDecrypt,
  rsaEncrypt,
  type SymmetricAlgorithm,
} from '../../../lib/encryption'

export default function EncryptionSection() {
  const [mode, setMode] = useState<SymmetricAlgorithm>('AES-GCM')
  const [password, setPassword] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const runSymmetric = async (action: 'encrypt' | 'decrypt') => {
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

  const [rsaGenerating, setRsaGenerating] = useState(false)
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [rsaInput, setRsaInput] = useState('')
  const [rsaOutput, setRsaOutput] = useState('')
  const [rsaError, setRsaError] = useState<string | null>(null)

  const generateKeys = async () => {
    setRsaGenerating(true)
    setRsaError(null)
    try {
      const pair = await generateRsaKeyPair()
      setPublicKey(pair.publicKeyPem)
      setPrivateKey(pair.privateKeyPem)
    } catch (err) {
      setRsaError(err instanceof Error ? err.message : String(err))
    } finally {
      setRsaGenerating(false)
    }
  }

  const runRsa = async (action: 'encrypt' | 'decrypt') => {
    try {
      const result =
        action === 'encrypt'
          ? await rsaEncrypt(publicKey, rsaInput)
          : await rsaDecrypt(privateKey, rsaInput)
      setRsaOutput(result)
      setRsaError(null)
    } catch (err) {
      setRsaOutput('')
      setRsaError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <>
      <section className="tsec">
        <div className="tsec-head">
          <h2>对称加密（口令）</h2>
          <span className="sub">AES-GCM 推荐 · PBKDF2 派生密钥</span>
        </div>
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
          <button onClick={() => void runSymmetric('encrypt')} disabled={!input || !password}>
            加密
          </button>
          <button onClick={() => void runSymmetric('decrypt')} disabled={!input || !password}>
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
          密文格式为 Base64(salt + iv + 密文)，每次加密使用随机盐与 IV；GCM 模式带完整性校验。
        </p>
      </section>

      <section className="tsec">
        <div className="tsec-head">
          <h2>RSA-OAEP</h2>
          <span className="sub">3072 位 · 适合短文本（约 300 字节内）</span>
        </div>
        <div className="toolbar">
          <button onClick={() => void generateKeys()} disabled={rsaGenerating}>
            <KeyRound size={14} aria-hidden="true" />
            {rsaGenerating ? '生成中…' : '生成密钥对'}
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
          value={rsaInput}
          onChange={(e) => setRsaInput(e.target.value)}
          placeholder="输入明文（加密）或 Base64 密文（解密）…"
          spellCheck={false}
        />
        <div className="toolbar">
          <button onClick={() => void runRsa('encrypt')} disabled={!rsaInput || !publicKey}>
            公钥加密
          </button>
          <button onClick={() => void runRsa('decrypt')} disabled={!rsaInput || !privateKey}>
            私钥解密
          </button>
        </div>
        {rsaError && <div className="error-box">✗ {rsaError}</div>}
        {rsaOutput && (
          <>
            <textarea className="editor enc-input" value={rsaOutput} readOnly spellCheck={false} />
            <div className="toolbar toolbar-end">
              <CopyButton value={rsaOutput} label="复制结果" />
            </div>
          </>
        )}
      </section>
    </>
  )
}
