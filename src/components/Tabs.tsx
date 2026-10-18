import type { KeyboardEvent } from 'react'

export interface TabItem<K extends string> {
  key: K
  label: string
}

interface TabsProps<K extends string> {
  items: readonly TabItem<K>[]
  active: K
  onChange: (key: K) => void
  label: string
}

export default function Tabs<K extends string>({ items, active, onChange, label }: TabsProps<K>) {
  const move = (direction: 1 | -1) => {
    const index = items.findIndex((item) => item.key === active)
    const next = items[(index + direction + items.length) % items.length]
    if (next) {
      onChange(next.key)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      move(-1)
    } else if (event.key === 'ArrowRight') {
      move(1)
    }
  }

  return (
    <div className="tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {items.map((item) => (
        <button
          key={item.key}
          role="tab"
          type="button"
          id={`tab-${item.key}`}
          aria-selected={active === item.key}
          aria-controls={`panel-${item.key}`}
          className={`tab${active === item.key ? ' active' : ''}`}
          tabIndex={active === item.key ? 0 : -1}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
