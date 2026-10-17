import { Link } from 'react-router-dom'

const categories = [
  {
    to: '/json',
    title: 'JSON 处理',
    description: '格式化、压缩、校验',
  },
  {
    to: '/image',
    title: '图片处理',
    description: '压缩、格式转换',
  },
  {
    to: '/crypto',
    title: '安全工具',
    description: '密码生成、SSH 密钥对、加密、Hash',
  },
  {
    to: '/datetime',
    title: '日期时间',
    description: '时间获取、格式化、转换、时区转换',
  },
]

export default function Home() {
  return (
    <section className="home">
      <div className="home-hero">
        <h1>WebTools — 本地 Web 工具平台</h1>
        <p>纯前端的在线工具集合：所有数据处理均在你的浏览器本地完成，任何输入都不会经过网络上传。</p>
      </div>
      <div className="tool-grid">
        {categories.map((category) => (
          <Link key={category.to} to={category.to} className="tool-card">
            <h2>{category.title}</h2>
            <p>{category.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
