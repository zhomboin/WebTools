import { useState } from 'react'

import Tabs, { type TabItem } from '../../components/Tabs'
import ToolPageShell from '../../components/ToolPageShell'

import ImageWorkbench from './sections/ImageWorkbench'

const TABS: readonly TabItem<'compress' | 'convert'>[] = [
  { key: 'compress', label: '压缩' },
  { key: 'convert', label: '格式转换' },
]

export default function ImagePage() {
  const [tab, setTab] = useState<'compress' | 'convert'>('compress')

  return (
    <ToolPageShell
      category="image"
      title="图片处理"
      description="图片压缩与格式转换，全部在本地浏览器完成。"
    >
      <Tabs items={TABS} active={tab} onChange={setTab} label="图片处理功能" />
      <div
        className="tab-panel"
        role="tabpanel"
        id="panel-compress"
        aria-labelledby="tab-compress"
        hidden={tab !== 'compress'}
      >
        <ImageWorkbench mode="compress" />
      </div>
      <div
        className="tab-panel"
        role="tabpanel"
        id="panel-convert"
        aria-labelledby="tab-convert"
        hidden={tab !== 'convert'}
      >
        <ImageWorkbench mode="convert" />
      </div>
    </ToolPageShell>
  )
}
