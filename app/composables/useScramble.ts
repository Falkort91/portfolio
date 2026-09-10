import { getCurrentInstance, onUnmounted, ref } from 'vue'

interface UseScrambleOptions {
  speed?: number
  charset?: string
  random?: () => number
}

export function useScramble(options: UseScrambleOptions = {}) {
  const speed = options.speed ?? 30
  const charset = options.charset ?? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/_-<>[]{}'
  const random = options.random ?? Math.random
  const displayedText = ref('')
  const isDone = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined

  function randomChar() {
    return charset[Math.floor(random() * charset.length)]
  }

  function render(text: string, revealed: number) {
    let out = ''
    for (let i = 0; i < text.length; i++) {
      out += i < revealed || text[i] === ' ' ? text[i] : randomChar()
    }
    displayedText.value = out
  }

  function start(text: string, instant = false) {
    if (timer) clearInterval(timer)

    if (instant || text.length === 0) {
      displayedText.value = text
      isDone.value = true
      return
    }

    isDone.value = false
    let revealed = 0
    render(text, revealed)
    timer = setInterval(() => {
      revealed += 1
      render(text, revealed)
      if (revealed >= text.length) {
        isDone.value = true
        if (timer) clearInterval(timer)
      }
    }, speed)
  }

  // getCurrentInstance() est absent quand le composable est appelé directement dans un test.
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })
  }

  return { displayedText, isDone, start }
}
