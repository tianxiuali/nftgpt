import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button, Dropdown } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { formatAddress } from '@/utils/format'
import styles from './style.module.scss'

export default function ConnectButton() {
  const { address, connector, isConnected } = useAccount()
  const { connect, connectors, error, isLoading } = useConnect()
  const { disconnect } = useDisconnect()

  const [mounted, setMounted] = useState(false)

  const onMenuClick = ({ key }) => {
    if (key === 'disconnect') {
      disconnect()
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!isConnected) {
    return (
      <Button type="primary" loading={isLoading} onClick={() => connect({ connector: connectors[0] })}>
        连接钱包
      </Button>
    )
  }

  return (
    <Dropdown.Button
      menu={{
        items: [
          {
            label: '断开连接',
            key: 'disconnect'
          }
        ],
        onClick: onMenuClick
      }}
    >
      <span>
        <UserOutlined />
        <span className={styles.username}>{formatAddress(address)}</span>
      </span>
    </Dropdown.Button>
  )
}
