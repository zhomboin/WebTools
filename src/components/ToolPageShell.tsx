import type { ReactNode } from 'react'

import PrivacyNotice from './PrivacyNotice'

interface ToolPageShellProps {
  title: string
  description: string
  children?: ReactNode
}

export default function ToolPageShell({ title, description, children }: ToolPageShellProps) {
  return (
    <section className="tool-page">
      <h1>{title}</h1>
      <p className="tool-description">{description}</p>
      <PrivacyNotice />
      {children}
    </section>
  )
}
