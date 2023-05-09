import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import '@/styles/globals.css'
import '@/styles/github-markdown.css'
import '@/styles/highlight.scss'

const { darkAlgorithm } = theme
const chains = [polygon, polygonMumbai]
const { provider } = configureChains(chains, [
  alchemyProvider({
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY
  }),
  publicProvider()
])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains
    })
  ],
  provider
})

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: darkAlgorithm
        }}
      >
        <Component {...pageProps} />
      </ConfigProvider>
    </WagmiConfig>
  )
}
