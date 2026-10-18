import type { ReactNode } from 'react'

import PrivacyNotice from './PrivacyNotice'

export type ToolCategory = 'json' | 'image' | 'crypto' | 'datetime'

interface ToolPageShellProps {
  category: ToolCategory
  title: string
  description: string
  children?: ReactNode
}

export default function ToolPageShell({ category, title, description, children }: ToolPageShellProps) {
  return (
    <section className="tool-page" data-category={category}>
      <h1>{title}</h1>
      <p className="tool-description">{description}</p>
      <PrivacyNotice />
      {children}
    </section>
  )
}
