import { useEffect, useState } from 'react'

import CopyButton from '../../../components/CopyButton'
import {
  ALL_HASH_ALGORITHMS,
  WEBCRYPTO_HASH_ALGORITHMS,
  digest,
  hmac,
  type HashAlgorithm,
  type WebCryptoHashAlgorithm,
} from '../../../lib/hash'

const DEFAULT_SELECTED: readonly HashAlgorithm[] = ['SHA-256', 'MD5']

export default function HashSection() {
  const [text, setText] = useState('Hello, WebTools!')
  const [selected, setSelected] = useState<Set<HashAlgorithm>>(() => new Set(DEFAULT_SELECTED))
  const [results, setResults] = useState<Array<{ algorithm: HashAlgorithm; value: string }>>([])

  const [hmacMessage, setHmacMessage] = useState('The quick brown fox jumps over the lazy dog')
  const [hmacKey, setHmacKey] = useState('secret')
  const [hmacAlgorithm, setHmacAlgorithm] = useState<WebCryptoHashAlgorithm>('SHA-256')
  const [hmacValue, setHmacValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        const entries = await Promise.all(
          [...selected].map(async (algorithm) => ({
            algorithm,
            value: await digest(algorithm, text),
          })),
        )
        setResults(entries)
      })()
    }, 250)
    return () => clearTimeout(timer)
  }, [text, selected])

  useEffect(() => {
    const timer = setTimeout(() => {
      void hmac(hmacAlgorithm, hmacMessage, hmacKey).then(setHmacValue)
    }, 250)
    return () => clearTimeout(timer)
  }, [hmacAlgorithm, hmacMessage, hmacKey])

  const toggle = (algorithm: HashAlgorithm) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(algorithm)) {
        next.delete(algorithm)
      } else {
        next.add(algorithm)
      }
      return next
    })
  }

  return (
    <div>
      <textarea
        className="editor hash-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入要计算散列的文本…"
        spellCheck={false}
      />

      <div className="check-row">
        {ALL_HASH_ALGORITHMS.map((algorithm) => (
          <label key={algorithm} className="check-item">
            <input
              type="checkbox"
              checked={selected.has(algorithm)}
              onChange={() => toggle(algorithm)}
            />
            {algorithm}
          </label>
        ))}
      </div>

      {results.length > 0 ? (
        <div className="result-list">
          {results.map((result) => (
            <div className="result-row" key={result.algorithm}>
              <span className="result-label">{result.algorithm}</span>
              <span className="result-value mono with-action">
                {result.value}
                <CopyButton value={result.value} />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="hint-text">至少选择一种算法</p>
      )}

      <h3 className="sub-block-title">HMAC</h3>
      <div className="field">
        <label>
          消息
          <input type="text" value={hmacMessage} onChange={(e) => setHmacMessage(e.target.value)} />
        </label>
        <label>
          密钥
          <input type="text" value={hmacKey} onChange={(e) => setHmacKey(e.target.value)} />
        </label>
        <label>
          算法
          <select
            value={hmacAlgorithm}
            onChange={(e) => setHmacAlgorithm(e.target.value as WebCryptoHashAlgorithm)}
          >
            {WEBCRYPTO_HASH_ALGORITHMS.map((algorithm) => (
              <option key={algorithm} value={algorithm}>
                {algorithm}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="result-row">
        <span className="result-label">HMAC-{hmacAlgorithm}</span>
        <span className="result-value mono with-action">
          {hmacValue || '…'}
          <CopyButton value={hmacValue} />
        </span>
      </div>
      <p className="hint-text">SHA 系列与 HMAC 由 WebCrypto 计算；MD5 / CRC32 / SHA-3 由 hash-wasm 按需加载。</p>
    </div>
  )
}
