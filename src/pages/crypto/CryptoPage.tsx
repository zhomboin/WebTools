import { useState } from 'react'

import Tabs, { type TabItem } from '../../components/Tabs'
import ToolPageShell from '../../components/ToolPageShell'

import HashSection from './sections/HashSection'
import PasswordSection from './sections/PasswordSection'
import RsaSection from './sections/RsaSection'
import SymmetricSection from './sections/SymmetricSection'

const TABS: readonly TabItem<'password' | 'hash' | 'symmetric' | 'rsa'>[] = [
  { key: 'password', label: '密码生成' },
  { key: 'hash', label: 'Hash 计算' },
  { key: 'symmetric', label: '对称加密' },
  { key: 'rsa', label: 'RSA-OAEP' },
]

export default function CryptoPage() {
  const [tab, setTab] = useState<'password' | 'hash' | 'symmetric' | 'rsa'>('password')

  return (
    <ToolPageShell
      category="crypto"
      title="安全工具"
      description="密码生成、Hash 计算与加解密，全部在本地完成。"
    >
      <Tabs items={TABS} active={tab} onChange={setTab} label="安全工具功能" />
      <div
        className="tab-panel"
        role="tabpanel"
        id="panel-password"
        aria-labelledby="tab-password"
        hidden={tab !== 'password'}
      >
        <PasswordSection />
      </div>
      <div
        className="tab-panel"
        role="tabpanel"
        id="panel-hash"
        aria-labelledby="tab-hash"
        hidden={tab !== 'hash'}
      >
        <HashSection />
      </div>
      <div
        className="tab-panel"
        role="tabpanel"
        id="panel-symmetric"
        aria-labelledby="tab-symmetric"
        hidden={tab !== 'symmetric'}
      >
        <SymmetricSection />
      </div>
      <div
        className="tab-panel"
        role="tabpanel"
        id="panel-rsa"
        aria-labelledby="tab-rsa"
        hidden={tab !== 'rsa'}
      >
        <RsaSection />
      </div>
    </ToolPageShell>
  )
}
