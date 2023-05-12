import { UserOutlined } from '@ant-design/icons'
import { Input, Avatar, Typography, Button } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import styles from './style.module.scss'
import Openai from '@/components/Icon/openai'
import { useState, useEffect, useRef } from 'react'
import Markdown from '@/components/Markdown'
import SelectImg from '@/components/SelectImg'
import classNames from 'classnames'
import { useAccount } from 'wagmi'

const { Title } = Typography

const generateId = () => {
  return Math.floor(Math.random() * 10000)
}

export default function ChatGPT() {
  const mainRef = useRef(null)
  const convRef = useRef(null)
  const [inputValue, setInputValue] = useState('')
  const [conversation, setConversation] = useState([
    // {
    //   id: '1',
    //   role: 'user',
    //   content: '你好'
    // },
    // {
    //   id: '2',
    //   role: 'assistant',
    //   content: '你好，我是ChatGPT，我可以回答你的问题',
    //   type: 'md'
    // }
  ])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const { address } = useAccount()

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
          content: '',
          type: 'md'
        }
      ]
      setConversation(newConversation)
      setTimeout(() => {
        mainRef.current.scrollTop = convRef.current.scrollHeight
      }, 100)
      setIsStreaming(true)
      setIsWaiting(true)
      await generateImg(newConversation)
      // const response = await fetch('/api/openai/chat', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     messages: newConversation
      //   })
      // })
      setIsWaiting(false)
      // if (!response.ok) {
      //   newConversation = [...newConversation]
      //   newConversation[newConversation.length - 1].content = 'Error'
      //   setConversation(newConversation)
      //   setIsStreaming(false)
      //   return
      // }
      // const reader = response.body.getReader()
      // const decoder = new TextDecoder()
      // let result = ''
      // while (true) {
      //   const { done, value } = await reader.read()
      //   if (done) {
      //     break
      //   }
      //   result += decoder.decode(value)
      //   newConversation = [...newConversation]
      //   newConversation[newConversation.length - 1].content = result
      //   setConversation(newConversation)
      //   localStorage.setItem('conversation', JSON.stringify(newConversation))
      //   if (mainRef?.current) {
      //     mainRef.current.scrollTop = convRef.current.scrollHeight
      //   }
      // }
      // console.log(result)
      setIsStreaming(false)
    } catch (error) {
      console.log('error', error)
      setIsStreaming(false)
      setIsWaiting(false)
    }
  }

  const generateImg = async newConversation => {
    const resp = await fetch('/api/nft/generate_image', {
      method: 'POST',
      body: JSON.stringify({
        prompt: inputValue
      })
    })
    const { images } = await resp.json()
    if (images?.length > 0) {
      newConversation = [...newConversation]
      newConversation[newConversation.length - 1].imgList = images
      newConversation[newConversation.length - 1].type = 'img'
      setConversation(newConversation)
      if (mainRef?.current) {
        mainRef.current.scrollTop = convRef.current.scrollHeight
      }
    }
  }

  const onSelectImg = async src => {
    let newConversation = [
      ...conversation,
      {
        id: generateId(),
        role: 'user',
        content: `<img style="width: 200px;" src="${src}" />`
      },
      {
        id: generateId(),
        role: 'assistant',
        content: '',
        type: 'md'
      }
    ]
    setConversation(newConversation)
    await generateContract([src], newConversation)
  }

  const generateContract = async (nftImages, newConversation) => {
    const resp = await fetch('/api/nft/generate_contract', {
      method: 'POST',
      body: JSON.stringify({
        nftImages
      })
    })
    const { contract } = await resp.json()
    if (contract) {
      newConversation = [...newConversation]
      newConversation[newConversation.length - 1].content = `\`\`\`solidity\n${contract}\n\`\`\``
      newConversation[newConversation.length - 1].type = 'contract'
      setConversation(newConversation)
      if (mainRef?.current) {
        mainRef.current.scrollTop = convRef.current.scrollHeight
      }
    }
  }

  const confirmContract = async contract => {
    let newConversation = [...conversation]
    newConversation.push({
      id: generateId(),
      role: 'assistant',
      content: '',
      type: 'md'
    })
    setConversation(newConversation)
    const resp = await fetch('/api/nft/deploy_contract', {
      method: 'POST',
      body: JSON.stringify({
        contract,
        userAddress: address
      })
    })
    const { openseaUrl } = await resp.json()
    if (openseaUrl) {
      newConversation = [...newConversation]
      newConversation[newConversation.length - 1].content = `NFT已发布：[${openseaUrl}](${openseaUrl})`
      setConversation(newConversation)
      if (mainRef?.current) {
        mainRef.current.scrollTop = convRef.current.scrollHeight
      }
    }
  }

  useEffect(() => {
    fetch('/api/openai/models')
    setInterval(() => {
      fetch('/api/openai/models')
    }, 60000)
  }, [])

  return (
    <div className={styles.main} ref={mainRef}>
      {conversation.length === 0 && <Title style={{ paddingTop: 20, textAlign: 'center' }}>AI NFT</Title>}
      <ul className={styles.conversation} ref={convRef}>
        {conversation.map((item, i) => {
          const { id, role, content, type, imgList } = item
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
                    <span className={styles.content} dangerouslySetInnerHTML={{ __html: content }}></span>
                  </>
                )}
                {role === 'assistant' && (
                  <>
                    <Avatar style={{ backgroundColor: '#6ea194' }}>AI NFT</Avatar>
                    <span className={styles.content}>
                      {type === 'img' && imgList?.length > 0 && (
                        <div>
                          <div>请选择一张图片，AI NFT将用您选择的图片作为NFT的元数据，并为您生成合约代码：</div>
                          <SelectImg imgList={imgList} onSelect={onSelectImg} />
                        </div>
                      )}
                      {type === 'md' && (
                        <Markdown
                          markdown={content}
                          isChatGpt={true}
                          isStreaming={isStreaming && i === conversation.length - 1}
                          isWaiting={isWaiting && i === conversation.length - 1}
                        />
                      )}
                      {type === 'contract' && (
                        <div className={styles.contract}>
                          <Markdown
                            markdown={content}
                            isChatGpt={true}
                            isStreaming={isStreaming && i === conversation.length - 1}
                            isWaiting={isWaiting && i === conversation.length - 1}
                          />
                          <Button onClick={() => confirmContract(content)}>确认代码</Button>
                        </div>
                      )}
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
          placeholder="请输入图片描述"
          suffix={inputValue ? <SendOutlined onClick={sendQuestion} /> : <SendOutlined style={{ color: '#666' }} />}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onPressEnter={sendQuestion}
        />
      </div>
    </div>
  )
}
