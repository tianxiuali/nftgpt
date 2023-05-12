import MarkdownIt from 'markdown-it'
import markdownItCodeCopy from './plugins/copy'
import hljs from 'highlight.js'
import hljsDefineSolidity from 'highlightjs-solidity'
import classNames from 'classnames'

hljsDefineSolidity(hljs)

export default function Markdown(props) {
  const { markdown, isStreaming, isWaiting } = props

  const md = new MarkdownIt({
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        } catch (__) {}
      }
      return ''
    }
  })
  // const result = md.use(markdownItCodeCopy).render(markdown)
  const result = md.render(markdown)

  return (
    <div
      className={classNames('markdown-body', 'chatgpt', {
        streaming: isStreaming,
        waiting: isWaiting
      })}
      dangerouslySetInnerHTML={{ __html: result }}
    ></div>
  )
}
