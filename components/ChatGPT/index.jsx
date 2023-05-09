import { UserOutlined } from '@ant-design/icons'
import { Input, Avatar, Button, Popconfirm, Typography, message } from 'antd'
import { SendOutlined, ClearOutlined } from '@ant-design/icons'
import styles from './style.module.scss'
import Openai from '@/components/Icon/openai'
import { useState, useRef } from 'react'
import Markdown from '@/components/Markdown'
import classNames from 'classnames'

const { Title } = Typography

const generateId = () => {
  return Math.floor(Math.random() * 10000)
}

export default function ChatGPT() {
  const mainRef = useRef(null)
  const convRef = useRef(null)
  const [inputValue, setInputValue] = useState('')
  const [conversation, setConversation] = useState([
    {
      id: '1',
      role: 'user',
      content: '你好'
    },
    {
      id: '2',
      role: 'assistant',
      content: '你好，我是ChatGPT，我可以回答你的问题'
    },
    {
      id: '3',
      role: 'user',
      content: '你好'
    },
    {
      id: '4',
      role: 'assistant',
      content: '你好，我是ChatGPT，我可以回答你的问题'
    }
  ])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)

  const sendQuestion = async () => {
    try {
      setInputValue('')
      let newConversation = [
        ...conversation,
        {
          id: generateId(),
          role: 'user',
          content: inputValue
        },
        {
          id: generateId(),
          role: 'assistant',
          content: ''
        }
      ]
      setConversation(newConversation)
      localStorage.setItem('conversation', JSON.stringify(newConversation))
      setTimeout(() => {
        mainRef.current.scrollTop = convRef.current.scrollHeight
      }, 100)
      setIsStreaming(true)
      setIsWaiting(true)
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: newConversation
        })
      })
      setIsWaiting(false)
      if (!response.ok) {
        message.error('服务异常，请稍后再试')
        newConversation = [...newConversation]
        newConversation[newConversation.length - 1].content = 'Error'
        setConversation(newConversation)
        setIsStreaming(false)
        return
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let result = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        result += decoder.decode(value)
        newConversation = [...newConversation]
        newConversation[newConversation.length - 1].content = result
        setConversation(newConversation)
        localStorage.setItem('conversation', JSON.stringify(newConversation))
        if (mainRef?.current) {
          mainRef.current.scrollTop = convRef.current.scrollHeight
        }
      }
      console.log(result)
      setIsStreaming(false)
    } catch (error) {
      console.log('error', error)
      setIsStreaming(false)
      setIsWaiting(false)
    }
  }

  const clearConversation = () => {
    setConversation([])
    localStorage.setItem('conversation', '')
  }

  // useEffect(() => {
  //   clearConversation()
  //   fetch('/api/openai/models')
  //   setInterval(() => {
  //     fetch('/api/openai/models')
  //   }, 60000)
  // }, [])

  return (
    <div className={styles.main} ref={mainRef}>
      {conversation.length === 0 && <Title style={{ paddingTop: 20, textAlign: 'center' }}>ChatGPT</Title>}
      <ul className={styles.conversation} ref={convRef}>
        {conversation.map((item, i) => {
          const { id, role, content } = item
          return (
            <li
              key={id}
              className={classNames({
                [styles.assistant]: role === 'assistant'
              })}
            >
              <div className={styles.inner}>
                {role === 'user' && (
                  <>
                    <Avatar icon={<UserOutlined />} />
                    <span className={styles.content}>{content}</span>
                  </>
                )}
                {role === 'assistant' && (
                  <>
                    <Avatar style={{ backgroundColor: '#6ea194' }} icon={<Openai style={{ fontSize: 18 }} />} />
                    <span className={styles.content}>
                      <Markdown
                        markdown={content}
                        isChatGpt={true}
                        isStreaming={isStreaming && i === conversation.length - 1}
                        isWaiting={isWaiting && i === conversation.length - 1}
                      />
                    </span>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <div className={styles.bottom}>
        <Input
          size="large"
          placeholder="请输入你的问题"
          suffix={inputValue ? <SendOutlined onClick={sendQuestion} /> : <SendOutlined style={{ color: '#666' }} />}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onPressEnter={sendQuestion}
        />
      </div>
      {conversation.length > 0 && (
        <Popconfirm title="确定要清除对话列表吗？" placement="left" onConfirm={clearConversation}>
          <Button className={styles.clear} size="large" shape="circle" icon={<ClearOutlined />} />
        </Popconfirm>
      )}
    </div>
  )
}
