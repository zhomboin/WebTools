import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: '首页', end: true },
  { to: '/json', label: 'JSON' },
  { to: '/image', label: '图片' },
  { to: '/crypto', label: '安全' },
  { to: '/datetime', label: '日期时间' },
]

export default function AppLayout() {
  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="app-title">
          WebTools
        </NavLink>
        <nav className="app-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">所有处理均在本地浏览器完成，数据不会上传</footer>
    </div>
  )
}
