import { useMemo, useRef, useState } from 'react'

import CopyButton from '../../components/CopyButton'
import ToolPageShell from '../../components/ToolPageShell'
import {
  byteSize,
  escapeUnicode,
  format,
  minify,
  sortKeys,
  unescapeUnicode,
  validate,
  type JsonErrorLocation,
  JsonToolError,
} from '../../lib/json'

const MAX_INPUT_BYTES = 5 * 1024 * 1024

type Operation = 'format' | 'minify' | 'sortKeys' | 'escape' | 'unescape'

export default function JsonPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indent, setIndent] = useState<2 | 4>(2)
  const [error, setError] = useState<JsonErrorLocation | null>(null)
  const [validMessage, setValidMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const inputBytes = useMemo(() => byteSize(input), [input])
  const overLimit = inputBytes > MAX_INPUT_BYTES
  const actionsDisabled = overLimit || input.length === 0

  const run = (operation: Operation) => {
    setValidMessage(null)
    if (actionsDisabled) {
      return
    }
    try {
      setError(null)
      const result =
        operation === 'format'
          ? format(input, indent)
          : operation === 'minify'
            ? minify(input)
            : operation === 'sortKeys'
              ? sortKeys(input, indent)
              : operation === 'escape'
                ? escapeUnicode(input, indent)
                : unescapeUnicode(input, indent)
      setOutput(result)
    } catch (err) {
      setOutput('')
      if (err instanceof JsonToolError) {
        setError(err.location)
      } else if (err instanceof Error) {
        setError({ message: err.message, line: 1, column: 1, position: 0 })
      }
    }
  }

  const checkValidity = () => {
    if (actionsDisabled) {
      return
    }
    setValidMessage(null)
    const result = validate(input)
    if (result.valid) {
      setError(null)
      setValidMessage('JSON 语法正确')
    } else {
      setError(result.error)
    }
  }

  const focusError = () => {
    if (!error || !inputRef.current) {
      return
    }
    const el = inputRef.current
    el.focus()
    el.setSelectionRange(error.position, error.position + 1)
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError(null)
    setValidMessage(null)
  }

  const download = () => {
    if (!output) {
      return
    }
    const blob = new Blob([output], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'result.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolPageShell category="json" title="JSON 处理" description="格式化、压缩、校验、排序 JSON 数据。">
      <div className="toolbar">
        <label className="inline-field">
          缩进
          <select value={indent} onChange={(e) => setIndent(Number(e.target.value) as 2 | 4)}>
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
          </select>
        </label>
        <button onClick={() => run('format')} disabled={actionsDisabled}>
          格式化
        </button>
        <button onClick={() => run('minify')} disabled={actionsDisabled}>
          压缩
        </button>
        <button onClick={checkValidity} disabled={actionsDisabled}>
          校验
        </button>
        <button onClick={() => run('sortKeys')} disabled={actionsDisabled}>
          排序 Key
        </button>
        <button onClick={() => run('escape')} disabled={actionsDisabled}>
          Unicode 转义
        </button>
        <button onClick={() => run('unescape')} disabled={actionsDisabled}>
          Unicode 反转义
        </button>
        <button onClick={clear} disabled={input.length === 0 && output.length === 0}>
          清空
        </button>
      </div>

      <div className="status-bar">
        <span>
          输入：{input.length} 字符 / {inputBytes} 字节
        </span>
        {overLimit && <span className="warn-text">超过 5MB 输入上限，操作已禁用</span>}
      </div>

      {error && (
        <div className="error-box" onClick={focusError}>
          ✗ 第 {error.line} 行第 {error.column} 列：{error.message}（点击定位到出错位置）
        </div>
      )}
      {!error && validMessage && <div className="success-box">✓ {validMessage}</div>}

      <div className="json-workspace">
        <textarea
          ref={inputRef}
          className="editor"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setValidMessage(null)
          }}
          placeholder="粘贴或输入 JSON…"
          spellCheck={false}
        />
        <textarea className="editor" value={output} readOnly placeholder="处理结果…" spellCheck={false} />
      </div>

      <div className="toolbar toolbar-end">
        <CopyButton value={output} label="复制结果" />
        <button onClick={download} disabled={!output}>
          下载 .json
        </button>
      </div>
    </ToolPageShell>
  )
}
