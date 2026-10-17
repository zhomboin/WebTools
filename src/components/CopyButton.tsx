import { useState } from 'react'

interface CopyButtonProps {
  value: string
  label?: string
}

export default function CopyButton({ value, label = '复制' }: CopyButtonProps) {
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
    setTimeout(() => setCopied('idle'), 1500)
  }

  return (
    <button onClick={copy} disabled={!value}>
      {copied === 'ok' ? '✓ 已复制' : copied === 'fail' ? '✗ 复制失败' : label}
    </button>
  )
}
