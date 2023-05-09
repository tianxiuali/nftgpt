import ChatGPT from '@/components/ChatGPT'
import styles from '@/styles/Home.module.css'

export default function Home() {
  return (
    <>
      <main className={styles.container}>
        <ChatGPT />
      </main>
    </>
  )
}
