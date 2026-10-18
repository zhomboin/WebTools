import type { ReactElement } from 'react'
import { useSearchParams } from 'react-router-dom'

import Tabs, { type TabItem } from '../../components/Tabs'
import ToolPageShell from '../../components/ToolPageShell'

import HashSection from './sections/HashSection'
import PasswordSection from './sections/PasswordSection'
import RsaSection from './sections/RsaSection'
import SshSection from './sections/SshSection'
import SymmetricSection from './sections/SymmetricSection'

type CryptoTab = 'password' | 'hash' | 'symmetric' | 'rsa' | 'ssh'

const TABS: readonly TabItem<CryptoTab>[] = [
  { key: 'password', label: '密码生成' },
  { key: 'hash', label: 'Hash 计算' },
  { key: 'symmetric', label: '对称加密' },
  { key: 'rsa', label: 'RSA-OAEP' },
  { key: 'ssh', label: 'SSH 密钥' },
]

const PANELS: ReadonlyArray<{ key: CryptoTab; node: ReactElement }> = [
  { key: 'password', node: <PasswordSection /> },
  { key: 'hash', node: <HashSection /> },
  { key: 'symmetric', node: <SymmetricSection /> },
  { key: 'rsa', node: <RsaSection /> },
  { key: 'ssh', node: <SshSection /> },
]

export default function CryptoPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('t')
  const tab: CryptoTab = TABS.some((item) => item.key === tabParam)
    ? (tabParam as CryptoTab)
    : 'password'

  const changeTab = (key: CryptoTab) => {
    setSearchParams({ t: key }, { replace: true })
  }

  return (
    <ToolPageShell
      category="crypto"
      title="安全工具"
      description="密码生成、Hash 计算与加解密，全部在本地完成。"
    >
      <Tabs items={TABS} active={tab} onChange={changeTab} label="安全工具功能" />
      {PANELS.map((panel) => (
        <div
          key={panel.key}
          className="tab-panel"
          role="tabpanel"
          id={`panel-${panel.key}`}
          aria-labelledby={`tab-${panel.key}`}
          hidden={tab !== panel.key}
        >
          {panel.node}
        </div>
      ))}
    </ToolPageShell>
  )
}
