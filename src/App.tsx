import { useCallback, useEffect, useRef, useState } from "react"
import PageTurn, { type Turn } from "./PageTurn"
import { loadPage, pages, pageSource, projects } from "./portfolio"

export default function App() {
  const [page, setPage] = useState(1)
  const [turn, setTurn] = useState<Turn | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const busy = useRef(false)
  const mounted = useRef(true)
  const pointer = useRef<{
    x: number
    y: number
  } | null>(null)
  const wheel = useRef({ distance: 0, last: 0 })
  const book = useRef<HTMLDivElement>(null)

  const goToPage = useCallback(
    async (target: number) => {
      const to = Math.max(1, Math.min(pages.length, target))
      if (busy.current || to === page) return
      busy.current = true
      setLoading(true)
      setError("")
      try {
        const [image] = await Promise.all([loadPage(page), loadPage(to)])
        if (!mounted.current) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setPage(to)
          busy.current = false
        } else {
          setTurn({
            from: page,
            to,
            image,
            direction: to > page ? "forward" : "backward",
          })
        }
      } catch {
        if (mounted.current)
          setError("This page could not be loaded. Please try again.")
        busy.current = false
      } finally {
        if (mounted.current) setLoading(false)
      }
    },
    [page],
  )

  const completeTurn = useCallback(() => {
    if (!turn) return
    setPage(turn.to)
    setTurn(null)
    busy.current = false
  }, [turn])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    for (const neighbor of [page, page - 1, page + 1]) {
      if (neighbor > 0 && neighbor <= pages.length)
        void loadPage(neighbor).catch(() => {})
    }
  }, [page])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.repeat
      )
        return
      if (
        (event.target as HTMLElement).closest(
          "input, select, textarea, [contenteditable='true']",
        )
      )
        return
      const targets: Record<string, number> = {
        ArrowRight: page + 1,
        PageDown: page + 1,
        ArrowLeft: page - 1,
        PageUp: page - 1,
        Home: 1,
        End: pages.length,
      }
      if (event.key in targets) {
        event.preventDefault()
        void goToPage(targets[event.key])
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [goToPage, page])

  useEffect(() => {
    const element = book.current
    if (!element) return
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      event.preventDefault()
      const now = performance.now()
      const gap = now - wheel.current.last
      wheel.current.last = now
      if (busy.current) {
        wheel.current.distance = Infinity
        return
      }
      // Consume trackpad momentum until a fresh gesture begins.
      if (wheel.current.distance === Infinity && gap < 180) return
      if (gap > 180 || wheel.current.distance === Infinity)
        wheel.current.distance = 0
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY
      wheel.current.distance +=
        delta *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? element.clientHeight
            : 1)
      if (Math.abs(wheel.current.distance) > 55) {
        void goToPage(page + Math.sign(wheel.current.distance))
        wheel.current.distance = Infinity
      }
    }
    element.addEventListener("wheel", handleWheel, { passive: false })
    return () => element.removeEventListener("wheel", handleWheel)
  }, [goToPage, page])

  const isBusy = loading || !!turn
  return (
    <main className="portfolio-shell">
      <header className="topbar">
        <button
          className="brand-button"
          onClick={() => void goToPage(1)}
          aria-label="Go to portfolio cover"
        >
          <span>MINOLI IMALKA</span>
          <span className="brand-subtitle">Architecture & spatial design</span>
        </button>
        <nav className="header-nav" aria-label="Portfolio sections">
          <button
            onClick={() => void goToPage(2)}
            aria-current={page === 2 ? "page" : undefined}
          >
            About
          </button>
          <button
            onClick={() => void goToPage(4)}
            aria-current={page >= 4 && page < 15 ? "page" : undefined}
          >
            Projects
          </button>
          <button
            onClick={() => void goToPage(15)}
            aria-current={page === 15 ? "page" : undefined}
          >
            Contact <span aria-hidden="true">↗</span>
          </button>
        </nav>
      </header>
      <section
        className="book-area"
        aria-label="Interactive architecture portfolio"
      >
        <div
          className="book"
          ref={book}
          aria-busy={isBusy}
          onPointerDown={(event) => {
            if (
              !event.isPrimary ||
              event.button !== 0 ||
              (event.target as HTMLElement).closest("a, button")
            )
              return
            pointer.current = { x: event.clientX, y: event.clientY }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerUp={(event) => {
            const start = pointer.current
            pointer.current = null
            if (!start) return
            const dx = event.clientX - start.x
            const dy = event.clientY - start.y
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2)
              void goToPage(page + (dx < 0 ? 1 : -1))
          }}
          onPointerCancel={() => {
            pointer.current = null
          }}
        >
          <img
            className="page-image"
            src={pageSource(turn?.to ?? page)}
            alt={pages[(turn?.to ?? page) - 1]}
            width="2400"
            height="1350"
            draggable="false"
            fetchPriority="high"
            onError={() =>
              setError(
                "This page could not be loaded. Please check your connection and reload.",
              )
            }
          />
          {turn && <PageTurn turn={turn} onComplete={completeTurn} />}
          {!isBusy &&
            page === 4 &&
            projects.map((project, index) => (
              <button
                key={project.name}
                className="project-hotspot"
                style={{ left: `${11.2 + index * 17.65}%` }}
                onClick={() => void goToPage(project.page)}
                aria-label={`Open ${project.name}`}
              />
            ))}
          {!isBusy && page === 15 && (
            <>
              <a
                className="contact-hotspot phone"
                href="tel:+94763624236"
                aria-label="Call Minoli Imalka"
              />
              <a
                className="contact-hotspot email"
                href="mailto:minoliimalka2003@gmail.com"
                aria-label="Email Minoli Imalka"
              />
              <a
                className="contact-hotspot website"
                href="https://minoliimalka.vercel.app/"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit Minoli Imalka's portfolio website"
              />
            </>
          )}
          {loading && (
            <span className="loading-label" role="status">
              Preparing page…
            </span>
          )}
        </div>
      </section>
      <footer className="reader-bar">
        <div className="page-caption">
          <span className="eyebrow">SELECTED WORKS</span>
          <span>{pages[page - 1]}</span>
        </div>
        <nav className="page-controls" aria-label="Page navigation">
          <button
            className="arrow-button"
            onClick={() => void goToPage(page - 1)}
            disabled={isBusy || page === 1}
            aria-label="Previous page"
          >
            ←
          </button>
          <label className="page-picker">
            <span className="sr-only">Go to page</span>
            <select
              value={page}
              disabled={isBusy}
              onChange={(event) => void goToPage(Number(event.target.value))}
            >
              {pages.map((title, index) => (
                <option key={title} value={index + 1}>
                  {String(index + 1).padStart(2, "0")} — {title}
                </option>
              ))}
            </select>
            <span aria-hidden="true">
              {String(page).padStart(2, "0")}{" "}
              <span className="page-total">/ {pages.length}</span>
            </span>
          </label>
          <button
            className="arrow-button"
            onClick={() => void goToPage(page + 1)}
            disabled={isBusy || page === pages.length}
            aria-label="Next page"
          >
            →
          </button>
        </nav>
        <span className="reader-hint">
          Scroll, swipe or use <span aria-hidden="true">← →</span>
          <span className="sr-only">arrow keys</span>
        </span>
        <div
          className="reading-progress"
          style={{ width: `${(page / pages.length) * 100}%` }}
        />
      </footer>
      <span className="sr-only" role="status" aria-live="polite">
        Page {page} of {pages.length}: {pages[page - 1]}
      </span>
      {error && (
        <div className="error-message" role="alert">
          {error}
          <button onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}
    </main>
  )
}
