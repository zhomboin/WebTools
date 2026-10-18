import {
  ArrowRight,
  Braces,
  CalendarClock,
  Download,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const categories = [
  {
    to: '/json',
    cls: 't-json',
    icon: Braces,
    title: 'JSON 处理',
    description: '格式化 · 压缩 · 校验定位 · 排序 Key',
  },
  {
    to: '/image',
    cls: 't-image',
    icon: ImageIcon,
    title: '图片处理',
    description: '压缩 · PNG/JPEG/WebP 格式转换',
  },
  {
    to: '/crypto',
    cls: 't-crypto',
    icon: ShieldCheck,
    title: '安全工具',
    description: '密码生成 · 加密 · Hash · SSH 密钥',
  },
  {
    to: '/datetime',
    cls: 't-datetime',
    icon: CalendarClock,
    title: '日期时间',
    description: '时间戳互转 · 时区转换 · 格式化',
  },
]

const pills = [
  { icon: ShieldCheck, label: '数据零上传' },
  { icon: Zap, label: '纯静态 · 秒开' },
  { icon: Download, label: '免安装' },
]

export default function Home() {
  return (
    <section className="home">
      <div className="home-hero">
        <h1>
          本地优先的 <em>Web 工具箱</em>
        </h1>
        <p>JSON、图片、安全与日期时间工具，所有处理均在你的浏览器本地完成，任何输入都不会经过网络上传。</p>
        <div className="home-pills">
          {pills.map((pill) => {
            const Icon = pill.icon
            return (
              <span key={pill.label} className="home-pill">
                <Icon size={14} aria-hidden="true" />
                {pill.label}
              </span>
            )
          })}
        </div>
      </div>
      <div className="tool-grid">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Link key={category.to} to={category.to} className={`tool-card ${category.cls}`}>
              <span className="t-ico">
                <Icon size={19} aria-hidden="true" />
              </span>
              <h2>{category.title}</h2>
              <p>{category.description}</p>
              <span className="t-go">
                打开
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
