import ToolPageShell from '../../components/ToolPageShell'

import PasswordSection from './sections/PasswordSection'

export default function CryptoPage() {
  return (
    <ToolPageShell
      category="crypto"
      title="安全工具"
      description="密码生成、加密与 Hash 计算，全部在本地完成。"
    >
      <PasswordSection />
    </ToolPageShell>
  )
}
