import { useEffect, useRef } from 'react'
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react'

const FRAME_COUNT = 120

const heroSequences = [
  { name: 'bloom', frameCount: FRAME_COUNT },
  { name: 'becoming', frameCount: FRAME_COUNT },
]

const materialSequences = [
  { name: 'touch', frameCount: FRAME_COUNT },
]

const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value))

function framePath(sequence, frame) {
  return `/cinematic/${sequence}/frame_${String(frame + 1).padStart(4, '0')}.jpg`
}

function drawCover(canvas, image) {
  if (!canvas || !image?.naturalWidth) return false
  const bounds = canvas.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return false

  const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
  const outputWidth = Math.round(bounds.width * ratio)
  const outputHeight = Math.round(bounds.height * ratio)
  if (canvas.width !== outputWidth || canvas.height !== outputHeight) {
    canvas.width = outputWidth
    canvas.height = outputHeight
  }

  const context = canvas.getContext('2d', { alpha: false })
  if (!context) return false
  context.setTransform(ratio, 0, 0, ratio, 0, 0)

  const canvasRatio = bounds.width / bounds.height
  const imageRatio = image.naturalWidth / image.naturalHeight
  let sourceX = 0
  let sourceY = 0
  let sourceWidth = image.naturalWidth
  let sourceHeight = image.naturalHeight

  if (imageRatio > canvasRatio) {
    sourceWidth = image.naturalHeight * canvasRatio
    const responsiveFocus = bounds.width <= 700 ? canvas.dataset.mobileFocusX : undefined
    const focusX = clamp(Number(responsiveFocus ?? canvas.dataset.focusX ?? 0.5))
    sourceX = (image.naturalWidth - sourceWidth) * focusX
  } else {
    sourceHeight = image.naturalWidth / canvasRatio
    sourceY = (image.naturalHeight - sourceHeight) / 2
  }

  context.clearRect(0, 0, bounds.width, bounds.height)
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    bounds.width,
    bounds.height,
  )
  return true
}

function useCinematicSequence({ sequences, sectionRef, canvasRef, progressRef, progressLabelRef }) {
  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) {
      section.dataset.motion = 'reduced'
      if (progressLabelRef.current) progressLabelRef.current.textContent = 'Статик зураг'
      return undefined
    }

    const totalFrames = sequences.reduce((sum, sequence) => sum + sequence.frameCount, 0)
    const mobileStride = window.innerWidth <= 700 ? 3 : 1
    const frameEntries = []
    let offset = 0

    sequences.forEach((sequence) => {
      for (let localFrame = 0; localFrame < sequence.frameCount; localFrame += 1) {
        const isRequiredMobileFrame =
          localFrame % mobileStride === 0 || localFrame === sequence.frameCount - 1
        if (isRequiredMobileFrame) {
          frameEntries.push({
            globalFrame: offset + localFrame,
            url: framePath(sequence.name, localFrame),
          })
        }
      }
      offset += sequence.frameCount
    })

    const images = new Map()
    const scheduledTimers = new Set()
    let settledFrames = 0
    let started = false
    let isVisible = false
    let targetFrame = 0
    let currentFrame = 0
    let lastDrawnFrame = -1
    let animationFrame = 0
    let lastReveal = -1

    const setLoadingProgress = () => {
      const progress = frameEntries.length ? settledFrames / frameEntries.length : 1
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`
      if (progressLabelRef.current) {
        progressLabelRef.current.textContent =
          progress >= 1 ? 'Кино зураг бэлэн' : `Кино зураг ${Math.round(progress * 100)}%`
      }
      if (progress >= 1) section.dataset.frames = 'loaded'
    }

    const snapFrame = (globalFrame) => {
      let sequenceOffset = 0
      for (const sequence of sequences) {
        const sequenceEnd = sequenceOffset + sequence.frameCount
        if (globalFrame < sequenceEnd) {
          const localFrame = globalFrame - sequenceOffset
          const snappedLocal = Math.min(
            sequence.frameCount - 1,
            Math.round(localFrame / mobileStride) * mobileStride,
          )
          return sequenceOffset + snappedLocal
        }
        sequenceOffset = sequenceEnd
      }
      return totalFrames - 1
    }

    const findLoadedFrame = (wantedFrame) => {
      if (images.has(wantedFrame)) return wantedFrame
      for (let distance = 1; distance < totalFrames; distance += 1) {
        const before = wantedFrame - distance
        const after = wantedFrame + distance
        if (before >= 0 && images.has(before)) return before
        if (after < totalFrames && images.has(after)) return after
      }
      return -1
    }

    const paint = (wantedFrame, force = false) => {
      const snappedFrame = snapFrame(wantedFrame)
      const availableFrame = findLoadedFrame(snappedFrame)
      if (availableFrame < 0 || (!force && availableFrame === lastDrawnFrame)) return
      if (drawCover(canvas, images.get(availableFrame))) {
        lastDrawnFrame = availableFrame
        canvas.dataset.ready = 'true'
      }
    }

    const updateReveal = (progress) => {
      const reveal = Math.min(4, Math.max(0, Math.floor(progress * 5)))
      if (reveal !== lastReveal) {
        section.dataset.reveal = String(reveal)
        lastReveal = reveal
      }
      section.style.setProperty('--cinematic-progress', progress.toFixed(4))
    }

    const animate = () => {
      if (!isVisible) {
        animationFrame = 0
        return
      }
      currentFrame += (targetFrame - currentFrame) * 0.115
      if (Math.abs(targetFrame - currentFrame) < 0.08) currentFrame = targetFrame
      paint(Math.round(currentFrame))
      if (currentFrame !== targetFrame) {
        animationFrame = window.requestAnimationFrame(animate)
      } else {
        animationFrame = 0
      }
    }

    const requestPaint = () => {
      if (!animationFrame && isVisible) animationFrame = window.requestAnimationFrame(animate)
    }

    const updateScrollTarget = () => {
      if (!isVisible) return
      const bounds = section.getBoundingClientRect()
      const scrollableDistance = Math.max(1, section.offsetHeight - window.innerHeight)
      const progress = clamp(-bounds.top / scrollableDistance)
      targetFrame = progress * (totalFrames - 1)
      updateReveal(progress)
      requestPaint()
    }

    const loadFrame = ({ globalFrame, url }) => {
      if (images.has(globalFrame)) return
      const image = new Image()
      image.decoding = 'async'
      image.onload = () => {
        images.set(globalFrame, image)
        settledFrames += 1
        setLoadingProgress()
        if (Math.abs(globalFrame - snapFrame(Math.round(currentFrame))) <= mobileStride) {
          paint(Math.round(currentFrame), true)
        }
      }
      image.onerror = () => {
        settledFrames += 1
        setLoadingProgress()
      }
      image.src = url
    }

    const scheduleFrameLoading = () => {
      if (started) return
      started = true
      section.dataset.frames = 'loading'

      const priorityFrames = new Set([
        0,
        ...sequences.map((sequence, index) =>
          sequences.slice(0, index + 1).reduce((sum, item) => sum + item.frameCount, 0) - 1,
        ),
      ])
      const orderedEntries = [
        ...frameEntries.filter((entry) => priorityFrames.has(entry.globalFrame)),
        ...frameEntries.filter((entry) => !priorityFrames.has(entry.globalFrame)),
      ]

      for (let index = 0; index < orderedEntries.length; index += 8) {
        const batch = orderedEntries.slice(index, index + 8)
        const timer = window.setTimeout(() => {
          batch.forEach(loadFrame)
          scheduledTimers.delete(timer)
        }, Math.floor(index / 8) * 110)
        scheduledTimers.add(timer)
      }
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible) {
          scheduleFrameLoading()
          updateScrollTarget()
          requestPaint()
        } else if (animationFrame) {
          window.cancelAnimationFrame(animationFrame)
          animationFrame = 0
        }
      },
      { rootMargin: '20% 0px', threshold: 0 },
    )

    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          scheduleFrameLoading()
          preloadObserver.disconnect()
        }
      },
      { rootMargin: '140% 0px', threshold: 0 },
    )

    const resizeObserver = new ResizeObserver(() => {
      lastDrawnFrame = -1
      paint(Math.round(currentFrame), true)
    })

    visibilityObserver.observe(section)
    preloadObserver.observe(section)
    resizeObserver.observe(canvas)
    window.addEventListener('scroll', updateScrollTarget, { passive: true })
    window.addEventListener('resize', updateScrollTarget, { passive: true })
    setLoadingProgress()

    return () => {
      visibilityObserver.disconnect()
      preloadObserver.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('scroll', updateScrollTarget)
      window.removeEventListener('resize', updateScrollTarget)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      scheduledTimers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [canvasRef, progressLabelRef, progressRef, sectionRef, sequences])
}

function CinematicProgress({ progressRef, labelRef }) {
  return (
    <div className="cinematic-loader" aria-live="polite">
      <span className="cinematic-loader-track"><span ref={progressRef} /></span>
      <small ref={labelRef}>Кино зураг 0%</small>
    </div>
  )
}

function BotanicalCallout({ className, children }) {
  return (
    <span className={`cinematic-callout ${className}`}>
      <i aria-hidden="true" />
      {children}
    </span>
  )
}

export function HeroCinematic({ onShop, onFit }) {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const progressRef = useRef(null)
  const progressLabelRef = useRef(null)

  useCinematicSequence({
    sequences: heroSequences,
    sectionRef,
    canvasRef,
    progressRef,
    progressLabelRef,
  })

  return (
    <section ref={sectionRef} className="cinematic-section cinematic-hero" id="top" aria-labelledby="hero-title">
      <div className="cinematic-sticky">
        <img
          className="cinematic-poster"
          src="/cinematic/becoming/poster.jpg"
          alt=""
          width="1440"
          height="810"
        />
        <canvas
          ref={canvasRef}
          className="cinematic-canvas"
          data-focus-x="0"
          data-mobile-focus-x="0.5"
          role="img"
          aria-label="Хөвөнгийн цэцэг дэлгэрч, ширхэгүүд нь утас болон даавуу болж, дэлбээ ягаан Үүлэн зөөлөн бриф болон бүрэлдэх кино дараалал"
        >
          Хөвөнгийн цэцгээс зөөлөн хөвөн бриф бүрэлдэх бүтээгдэхүүний кино зураг.
        </canvas>
        <div className="cinematic-vignette" aria-hidden="true" />

        <div className="cinematic-hero-copy">
          <p className="eyebrow">АРЬСАНД ЭЭЛТЭЙ. БАЙГАЛЬД ЭЭЛТЭЙ.</p>
          <h1 id="hero-title"><span>Өдөр бүр</span><br />зөөлөн</h1>
          <p>
            Амьсгалдаг хөвөн даавуун дотуур хувцас—хөдөлгөөн, амралт, өдөр тутмын бодит хэмнэлд зориулав.
          </p>
          <div className="hero-actions">
            <button type="button" className="button button-primary" onClick={onShop}>
              Шилдэг бүтээгдэхүүнүүд <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button type="button" className="button button-secondary" onClick={onFit}>
              Өөрийн эсгэлтээ олох <Sparkles size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="cinematic-callout-layer" aria-label="Үүлэн зөөлөн брифийн онцлог">
          <BotanicalCallout className="callout-one">95% GOTS ХӨВӨН</BotanicalCallout>
          <BotanicalCallout className="callout-two">100% ХӨВӨН ДОТОРЛОГОО</BotanicalCallout>
          <BotanicalCallout className="callout-three">ШОШГОГҮЙ</BotanicalCallout>
          <BotanicalCallout className="callout-four">XS–3X</BotanicalCallout>
        </div>

        <CinematicProgress progressRef={progressRef} labelRef={progressLabelRef} />
        <span className="cinematic-scroll-cue" aria-hidden="true">
          Зөөлөн түүхийг гүйлгэх <ArrowDown size={16} />
        </span>
      </div>
    </section>
  )
}

export function MaterialCinematic() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const progressRef = useRef(null)
  const progressLabelRef = useRef(null)

  useCinematicSequence({
    sequences: materialSequences,
    sectionRef,
    canvasRef,
    progressRef,
    progressLabelRef,
  })

  return (
    <section ref={sectionRef} className="cinematic-section cinematic-material" id="story" aria-labelledby="material-title">
      <div className="cinematic-sticky">
        <img
          className="cinematic-poster"
          src="/cinematic/touch/poster.jpg"
          alt=""
          width="1440"
          height="810"
          loading="lazy"
        />
        <canvas
          ref={canvasRef}
          className="cinematic-canvas"
          data-focus-x="0"
          data-mobile-focus-x="0.5"
          role="img"
          aria-label="Дэлбээ ягаан брифийн хөвөн нэхээс, зөөлөн бүсэлхий, оёдол, шошгогүй дотор талыг ойроос харуулах кино дараалал"
        >
          Хөвөн нэхээс болон зөөлөн оёдлын ойрын бүтээгдэхүүний кино зураг.
        </canvas>
        <div className="cinematic-vignette" aria-hidden="true" />

        <div className="material-cinematic-copy">
          <p className="eyebrow">МАТЕРИАЛЫН ТҮҮХ</p>
          <h2 id="material-title">Цэцэгнээс өдөр тутмын тав тух хүртэл.</h2>
          <p>
            Толигор мэдрэмж, байгалийн амьсгалах чанар, өдөр тутмын эдэлгээг бодолцон урт ширхэгт хөвөн сонгосон.
          </p>
        </div>

        <div className="material-callouts" aria-label="Даавууны онцлог">
          <BotanicalCallout className="callout-one">ХӨВӨН НЭХЭЭС</BotanicalCallout>
          <BotanicalCallout className="callout-two">ЗӨӨЛӨН СУНАЛТ</BotanicalCallout>
          <BotanicalCallout className="callout-three">ШОШГОГҮЙ ТӨГСГӨЛ</BotanicalCallout>
          <BotanicalCallout className="callout-four">АМЬСГАЛДАГ БҮТЭЦ</BotanicalCallout>
        </div>

        <CinematicProgress progressRef={progressRef} labelRef={progressLabelRef} />
      </div>
    </section>
  )
}
