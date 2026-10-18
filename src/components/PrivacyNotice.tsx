import { Lock } from 'lucide-react'

export default function PrivacyNotice() {
  return (
    <p className="privacy-notice">
      <Lock size={14} aria-hidden="true" />
      所有处理均在本地浏览器完成，数据不会上传
    </p>
  )
}
