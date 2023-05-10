import { CheckCircleFilled } from '@ant-design/icons'
import styles from './style.module.scss'
import { useState } from 'react'

export default function SelectImg(props) {
  const { imgList, onSelect } = props

  const [selectIndex, setSelectIndex] = useState('')

  const selectImg = i => {
    setSelectIndex(i)
    onSelect(imgList[i])
  }

  if (imgList?.length <= 0) {
    return null
  }

  return (
    <div className={styles.gallery}>
      {imgList.map((item, i) => (
        <div key={item} className={styles.wrapper} onClick={() => selectImg(i)}>
          <img src={item} />
          {selectIndex === i && <CheckCircleFilled className={styles.checked} />}
        </div>
      ))}
    </div>
  )
}
