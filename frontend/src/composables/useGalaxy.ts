import { onMounted, onUnmounted, type Ref } from "vue"

interface Particle {
    x: number
    y: number
    radius: number
    opacity: number
    phase: number
    twinkle: number
    driftX: number
    driftY: number
    color: readonly [number, number, number]
}

const palette = [
    [220, 125, 155],
    [193, 160, 220],
    [121, 192, 255],
    [233, 231, 228],
] as const

/** Requests the canvas context and refuses to pretend when none exists. */
const getContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
    const context = canvas.getContext("2d")

    if (!context) {
        throw new Error("Canvas 2D rendering is not supported")
    }

    return context
}

/**
 * Keeps the stars drifting behind the application—subtly, of course.
 * It pauses when unseen and respects reduced motion; chaos still needs manners.
 */
export const useGalaxy = (canvasRef: Ref<HTMLCanvasElement | null>): void => {
    let cleanup: (() => void) | undefined

    onMounted(() => {
        const canvas = canvasRef.value
        if (!canvas) return

        const context = getContext(canvas)
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        )
        let particles: Particle[] = []
        let animationFrame: number | undefined
        let width = 0
        let height = 0

        /** Creates one star either on-screen or just beneath the horizon. */
        const createParticle = (initial = false): Particle => ({
            x: Math.random() * width,
            y: initial ? Math.random() * height : height + 8,
            radius:
                Math.random() < 0.84
                    ? Math.random() * 0.8 + 0.4
                    : Math.random() * 1.15 + 0.95,
            opacity: Math.random() * 0.42 + 0.2,
            phase: Math.random() * Math.PI * 2,
            twinkle: Math.random() * 0.0012 + 0.00035,
            driftX: (Math.random() - 0.5) * 0.012,
            driftY: -(Math.random() * 0.018 + 0.004),
            color:
                palette[Math.floor(Math.random() * palette.length)] ??
                palette[0],
        })

        /** Paints one frame and advances particles when motion is welcome. */
        const draw = (time: number): void => {
            context.clearRect(0, 0, width, height)

            particles.forEach((particle) => {
                const shimmer = reduceMotion.matches
                    ? 1
                    : 0.68 +
                      Math.sin(time * particle.twinkle + particle.phase) * 0.32
                const alpha = particle.opacity * shimmer
                const [red, green, blue] = particle.color

                if (particle.radius > 1) {
                    context.beginPath()
                    context.arc(
                        particle.x,
                        particle.y,
                        particle.radius * 4,
                        0,
                        Math.PI * 2,
                    )
                    context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * 0.12})`
                    context.fill()
                }

                context.beginPath()
                context.arc(
                    particle.x,
                    particle.y,
                    particle.radius,
                    0,
                    Math.PI * 2,
                )
                context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`
                context.fill()

                if (!reduceMotion.matches) {
                    particle.x += particle.driftX
                    particle.y += particle.driftY

                    if (
                        particle.y < -8 ||
                        particle.x < -8 ||
                        particle.x > width + 8
                    ) {
                        Object.assign(particle, createParticle())
                    }
                }
            })
        }

        /** Continues the animation loop. The stars are needy like that. */
        const animate = (time: number): void => {
            draw(time)
            animationFrame = requestAnimationFrame(animate)
        }

        /** Starts or stills the galaxy when motion preferences change. */
        const updateMotion = (): void => {
            if (animationFrame !== undefined)
                cancelAnimationFrame(animationFrame)
            animationFrame = undefined

            if (reduceMotion.matches) draw(0)
            else animationFrame = requestAnimationFrame(animate)
        }

        /** Fits the canvas to the viewport and repopulates it at sane density. */
        const resize = (): void => {
            width = window.innerWidth
            height = window.innerHeight
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
            canvas.width = Math.round(width * pixelRatio)
            canvas.height = Math.round(height * pixelRatio)
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
            const count = Math.min(
                140,
                Math.max(56, Math.round((width * height) / 11500)),
            )
            particles = Array.from({ length: count }, () =>
                createParticle(true),
            )

            if (reduceMotion.matches) draw(0)
        }

        /** Pauses hidden work and resumes it when the document returns. */
        const handleVisibility = (): void => {
            if (document.hidden && animationFrame !== undefined) {
                cancelAnimationFrame(animationFrame)
                animationFrame = undefined
            } else {
                updateMotion()
            }
        }

        window.addEventListener("resize", resize, { passive: true })
        document.addEventListener("visibilitychange", handleVisibility)
        reduceMotion.addEventListener("change", updateMotion)
        resize()
        updateMotion()

        /** Removes observers and animation work when the canvas leaves the stage. */
        cleanup = () => {
            if (animationFrame !== undefined)
                cancelAnimationFrame(animationFrame)
            window.removeEventListener("resize", resize)
            document.removeEventListener("visibilitychange", handleVisibility)
            reduceMotion.removeEventListener("change", updateMotion)
        }
    })

    onUnmounted(() => cleanup?.())
}
