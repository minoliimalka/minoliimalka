export const pages = [
  "Architecture Portfolio · Minoli Imalka",
  "About Minoli Imalka",
  "Introduction & software skills",
  "Selected projects",
  "Museum of Pure Air · Introduction",
  "Museum of Pure Air · Interior views",
  "Museum of Pure Air · Design journey",
  "Fabric Printing Factory",
  "Fabric Printing Factory · Details",
  "Siriwardena House · Plans",
  "Siriwardena House · Sections",
  "The Flowspace · Kayak hub",
  "Arena for Drama Therapy",
  "Arena for Drama Therapy · Drawings",
  "Get in touch",
]

export const projects = [
  { name: "Museum of Pure Air", page: 5 },
  { name: "Fabric Printing Factory", page: 8 },
  { name: "Siriwardena House", page: 10 },
  { name: "The Flowspace", page: 12 },
  { name: "Arena for Drama Therapy", page: 13 },
]

export function pageSource(page: number) {
  return `${import.meta.env.BASE_URL}portfolio/page-${String(page).padStart(2, "0")}.webp`
}

const images = new Map<number, Promise<HTMLImageElement>>()

// Decode neighbors ahead of time without downloading the entire portfolio up front.
export function loadPage(page: number): Promise<HTMLImageElement> {
  const cached = images.get(page)
  if (cached) return cached
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = async () => {
      try {
        await image.decode()
        resolve(image)
      } catch (error) {
        images.delete(page)
        reject(error)
      }
    }
    image.onerror = () => {
      images.delete(page)
      reject(new Error("This page could not be loaded. Please try again."))
    }
    image.src = pageSource(page)
  })
  images.set(page, promise)
  return promise
}
