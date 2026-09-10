import html2canvas from 'html2canvas'

export async function captureElement(el: HTMLElement): Promise<HTMLCanvasElement> {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  return html2canvas(el, {
    backgroundColor: null,
    scale: dpr,
    logging: false,
  })
}
