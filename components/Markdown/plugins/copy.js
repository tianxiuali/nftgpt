import Clipboard from 'clipboard'

try {
  const clipboard = new Clipboard('.markdown-it-code-copy')
  clipboard.on('success', e => {
    e.trigger.children[0].classList.remove('bi-clipboard')
    e.trigger.children[0].classList.add('bi-check-lg')
    setTimeout(() => {
      e.trigger.children[0].classList.remove('bi-check-lg')
      e.trigger.children[0].classList.add('bi-clipboard')
    }, 2000)
  })
} catch (error) {}

const renderCode = origRule => {
  return (...args) => {
    const [tokens, idx] = args
    const content = tokens[idx].content.replaceAll('"', '&quot;').replaceAll("'", '&lt;')
    const origRendered = origRule(...args)

    if (content.length === 0) return origRendered

    return `
      <div style="position: relative">
        ${origRendered}
        <button class="markdown-it-code-copy" data-clipboard-text="${content}" title="复制">
          <i class="bi bi-clipboard"></i>
        </button>
      </div>
    `
  }
}

module.exports = md => {
  md.renderer.rules.code_block = renderCode(md.renderer.rules.code_block)
  md.renderer.rules.fence = renderCode(md.renderer.rules.fence)
}
