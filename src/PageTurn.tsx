import { useLayoutEffect, useRef } from "react"

export type Turn = {
  from: number
  to: number
  image: HTMLImageElement
  direction: "forward" | "backward"
}

const DURATION = 1100

function pagePaperColor(image: HTMLImageElement) {
  const sample = document.createElement("canvas")
  sample.width = 48
  sample.height = 27
  const context = sample.getContext("2d", { willReadFrequently: true })
  if (!context) return "#a79a9e"

  // Sample once per turn. Group nearby tones so text and photos do not
  // overpower the page's predominant background color.
  context.drawImage(image, 0, 0, sample.width, sample.height)
  const { data } = context.getImageData(0, 0, sample.width, sample.height)
  const colors = new Map<number, {
    count: number
    red: number
    green: number
    blue: number
  }>()
  let dominant = { count: 0, red: 0, green: 0, blue: 0 }
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    const red = data[i]
    const green = data[i + 1]
    const blue = data[i + 2]
    const key = ((red >> 4) << 8) | ((green >> 4) << 4) | (blue >> 4)
    const color = colors.get(key) ?? { count: 0, red: 0, green: 0, blue: 0 }
    color.count += 1
    color.red += red
    color.green += green
    color.blue += blue
    colors.set(key, color)
    if (color.count > dominant.count) dominant = color
  }
  if (!dominant.count) return "#a79a9e"
  return `rgb(${Math.round(dominant.red / dominant.count)}, ${Math.round(dominant.green / dominant.count)}, ${Math.round(dominant.blue / dominant.count)})`
}

/** Bend the artwork around a cylinder instead of rotating a rigid panel. */
export default function PageTurn({
  turn,
  onComplete,
}: {
  turn: Turn
  onComplete: () => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useLayoutEffect(() => {
    const canvas = ref.current!
    const context = canvas.getContext("2d")
    if (!context) {
      onComplete()
      return
    }
    let frame = 0
    let start: number | undefined
    const reverse = turn.direction === "backward"
    const paperColor = pagePaperColor(turn.image)

    function draw(progress: number) {
      if (!context) return
      const { width, height } = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const pixelWidth = Math.round(width * ratio)
      const pixelHeight = Math.round(height * ratio)
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)
      if (!width || !height) return
      // Mirror geometry, never the artwork, for backward turns.
      if (reverse) {
        context.translate(width, 0)
        context.scale(-1, 1)
      }
      const eased = progress * progress * (3 - 2 * progress)
      const radius = width * 0.075 * Math.sin(Math.PI * progress)
      const fold = width * (1 - eased) - radius * 2 * eased
      const visible = Math.max(0, Math.min(width, fold))
      const source = turn.image
      const sourceScale = source.naturalWidth / width

      function imageStrip(
        sx: number,
        sw: number,
        dx: number,
        dw: number,
        lift = 0,
      ) {
        if (!context || sw <= 0 || dw <= 0) return
        context.save()
        if (reverse) {
          context.translate(dx * 2 + dw, 0)
          context.scale(-1, 1)
        }
        context.drawImage(
          source,
          (reverse ? width - sx - sw : sx) * sourceScale,
          0,
          sw * sourceScale,
          source.naturalHeight,
          dx,
          -lift,
          dw,
          height + lift * 2,
        )
        context.restore()
      }

      // The destination stays fully lit and stationary underneath this transparent canvas.
      const edge = Math.max(0, fold + radius)
      if (progress > 0 && edge > 0) {
        const shadowWidth = width * 0.055
        const shadow = context.createLinearGradient(
          edge,
          0,
          edge + shadowWidth,
          0,
        )
        shadow.addColorStop(0, "rgba(39, 30, 28, 0.22)")
        shadow.addColorStop(1, "rgba(39, 30, 28, 0)")
        context.fillStyle = shadow
        context.fillRect(edge, 0, shadowWidth, height)
      }
      imageStrip(0, visible, 0, visible)
      if (radius < 0.01) return

      const step = width / 240
      const project = (x: number) => {
        const angle = Math.min(Math.PI, (x - fold) / radius)
        return {
          x:
            fold +
            radius * Math.sin(angle) -
            Math.max(0, x - fold - Math.PI * radius),
          lift: radius * (1 - Math.cos(angle)) * 0.16,
          angle,
        }
      }
      for (let x = Math.max(0, fold); x < width; x += step) {
        const end = Math.min(width, x + step)
        const a = project(x)
        const b = project(end)
        const left = Math.min(a.x, b.x)
        const stripWidth = Math.abs(b.x - a.x) + 0.65
        if (left + stripWidth < 0 || left > width) continue
        const lift = (a.lift + b.lift) / 2
        if (a.angle < Math.PI / 2) {
          imageStrip(x, end - x, left, stripWidth, lift)
          context.fillStyle = `rgba(38, 29, 24, ${Math.sin(a.angle) * 0.16})`
        } else {
          context.fillStyle = paperColor
          context.fillRect(left, -lift, stripWidth, height + lift * 2)
          context.fillStyle = `rgba(0, 0, 0, ${0.025 + Math.sin(a.angle) * 0.14})`
        }
        context.fillRect(left, -lift, stripWidth, height + lift * 2)
      }
    }

    draw(0)
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    function tick(time: number) {
      start ??= time
      const progress = reducedMotion.matches
        ? 1
        : Math.min(1, (time - start) / DURATION)
      draw(progress)
      if (progress < 1) frame = requestAnimationFrame(tick)
      else onComplete()
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [turn, onComplete])
  return <canvas ref={ref} className="page-turn" aria-hidden="true" />
}
