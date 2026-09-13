import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type From = 'up' | 'fade' | 'scale' | 'left' | 'right'

type RevealBase = {
  children?: ReactNode
  className?: string
  delay?: number
  from?: From
  once?: boolean
  amount?: number
}

const ease = [0.22, 1, 0.36, 1] as const

function offset(from: From) {
  switch (from) {
    case 'fade':
      return { y: 0, x: 0, scale: 1 }
    case 'scale':
      return { y: 12, x: 0, scale: 0.94 }
    case 'left':
      return { y: 12, x: -30, scale: 1 }
    case 'right':
      return { y: 12, x: 30, scale: 1 }
    case 'up':
    default:
      return { y: 28, x: 0, scale: 1 }
  }
}

function useRevealMotion(from: From, delay: number, once: boolean, amount: number) {
  const reduce = usePrefersReducedMotion()
  const o = offset(from)
  if (reduce) {
    return {
      reduce: true as const,
    }
  }
  return {
    reduce: false as const,
    initial: { opacity: 0, y: o.y, x: o.x, scale: o.scale },
    whileInView: { opacity: 1, y: 0, x: 0, scale: 1 },
    viewport: { once, amount, margin: '0px 0px -6% 0px' },
    transition: { duration: 0.7, delay, ease },
  }
}

/** Fade/slide/scale in when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  from = 'up',
  once = true,
  amount = 0.2,
}: RevealBase) {
  const m = useRevealMotion(from, delay, once, amount)
  if (m.reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={m.initial}
      whileInView={m.whileInView}
      viewport={m.viewport}
      transition={m.transition}
    >
      {children}
    </motion.div>
  )
}

/** Same as Reveal, but renders a <section>. */
export function RevealSection({
  children,
  className,
  delay = 0,
  from = 'up',
  once = true,
  amount = 0.15,
  id,
}: RevealBase & { id?: string }) {
  const m = useRevealMotion(from, delay, once, amount)
  if (m.reduce) return <section id={id} className={className}>{children}</section>
  return (
    <motion.section
      id={id}
      className={className}
      initial={m.initial}
      whileInView={m.whileInView}
      viewport={m.viewport}
      transition={m.transition}
    >
      {children}
    </motion.section>
  )
}

type RevealImgProps = Omit<
  HTMLMotionProps<'img'>,
  'initial' | 'whileInView' | 'viewport' | 'transition'
> & {
  delay?: number
  from?: From
  once?: boolean
  src?: string
}

/** Image that eases in on scroll (posters, icons, venue art). */
export function RevealImg({ delay = 0, from = 'scale', once = true, ...imgProps }: RevealImgProps) {
  const m = useRevealMotion(from, delay, once, 0.25)
  if (m.reduce) {
    const { ...rest } = imgProps
    return <img alt="" {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />
  }
  return (
    <motion.img
      alt=""
      {...imgProps}
      initial={m.initial}
      whileInView={m.whileInView}
      viewport={m.viewport}
      transition={m.transition}
    />
  )
}
