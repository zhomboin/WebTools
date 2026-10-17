import { Suspense, lazy } from 'react'
import { RouterProvider, createHashRouter } from 'react-router-dom'

import AppLayout from '../components/AppLayout'

const Home = lazy(() => import('../pages/Home'))
const JsonPage = lazy(() => import('../pages/json/JsonPage'))
const ImagePage = lazy(() => import('../pages/image/ImagePage'))
const CryptoPage = lazy(() => import('../pages/crypto/CryptoPage'))
const DatetimePage = lazy(() => import('../pages/datetime/DatetimePage'))

const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'json', element: <JsonPage /> },
      { path: 'image', element: <ImagePage /> },
      { path: 'crypto', element: <CryptoPage /> },
      { path: 'datetime', element: <DatetimePage /> },
    ],
  },
])

export default function Router() {
  return (
    <Suspense fallback={<div className="loading">加载中…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
