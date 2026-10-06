import { useEffect, useRef } from "react"
import { cvUrl } from "./portfolio"

interface CvModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CvModal({ isOpen, onClose }: CvModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="cv-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      role="presentation"
    >
      <div
        className="cv-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-modal-title"
      >
        <header className="cv-header">
          <div className="cv-header-title">
            <h2 id="cv-modal-title" className="cv-heading">
              Curriculum Vitae
            </h2>
            <span className="cv-subheading">Minoli Imalka</span>
          </div>
          <div className="cv-actions">
            <a
              href={cvUrl}
              download="Minoli Imalka CV.pdf"
              className="cv-download-button"
              aria-label="Download Minoli Imalka CV"
            >
              <svg
                className="cv-btn-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download CV</span>
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="cv-close-button"
              aria-label="Close CV modal"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>
        <div className="cv-body">
          <iframe
            src={`${cvUrl}#view=FitH&toolbar=0`}
            title="Minoli Imalka Curriculum Vitae"
            className="cv-frame"
          />
        </div>
      </div>
    </div>
  )
}
