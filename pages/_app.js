import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import '@/styles/globals.css'

const { darkAlgorithm } = theme

export default function App({ Component, pageProps }) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: darkAlgorithm
      }}
    >
      <Component {...pageProps} />
    </ConfigProvider>
  )
}
