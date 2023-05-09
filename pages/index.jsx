import ConnectButton from '@/components/ConnectButton'
import ChatGPT from '@/components/ChatGPT'
import styles from '@/styles/Home.module.css'

export default function Home() {
  return (
    <>
      <main className={styles.container}>
        <div className={styles.connect}>
          <div className={styles.inner}>
            <ConnectButton />
          </div>
        </div>
        <ChatGPT />
      </main>
    </>
  )
}
