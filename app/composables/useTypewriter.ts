import { getCurrentInstance, onUnmounted, ref } from 'vue'

interface UseTypewriterOptions {
  speed?: number
}

export function useTypewriter(options: UseTypewriterOptions = {}) {
  const speed = options.speed ?? 60
  const displayedText = ref('')
  const isDone = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined

  function start(text: string) {
    if (timer) clearInterval(timer)
    displayedText.value = ''
    isDone.value = false
    let index = 0
    timer = setInterval(() => {
      index += 1
      displayedText.value = text.slice(0, index)
      if (index >= text.length) {
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
