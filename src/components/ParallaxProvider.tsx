import React, { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'

/**
 * ParallaxProvider manages:
 * 1. IntersectionObserver for smooth scroll-triggered entrance animations.
 * 2. Subtle micro-parallax mouse movement across hero sticker elements.
 * 3. Route change animation re-triggering.
 */
export default function ParallaxProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  useEffect(() => {
    // 1. IntersectionObserver for scroll-triggered entrance animations
    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1,
    })

    // Small timeout to allow DOM layout to settle
    const timer = setTimeout(() => {
      const revealElements = document.querySelectorAll('.scroll-reveal')
      const windowHeight = window.innerHeight

      revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        // If element is already in initial view, reveal it immediately
        if (rect.top < windowHeight - 40 && rect.bottom > 0) {
          el.classList.add('is-revealed')
        } else {
          // If element is below the fold, observe for scroll entry
          el.classList.remove('is-revealed')
          observer.observe(el)
        }
      })
    }, 40)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [location.pathname])

  useEffect(() => {
    // 2. Subtle Parallax Mouse Movement for Floating Decors
    let animationFrameId: number
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      targetX = (e.clientX - centerX) / centerX // -1 to 1
      targetY = (e.clientY - centerY) / centerY // -1 to 1
    }

    const applyParallax = () => {
      // Linear interpolation (lerp) for buttery smooth motion
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05

      // Mutate only global CSS variables on root — zero inline DOM mutation & zero React hydration mismatch
      document.documentElement.style.setProperty('--mouse-px-x', `${(currentX * 12).toFixed(2)}px`)
      document.documentElement.style.setProperty('--mouse-px-y', `${(currentY * 12).toFixed(2)}px`)

      animationFrameId = requestAnimationFrame(applyParallax)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    animationFrameId = requestAnimationFrame(applyParallax)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <>{children}</>
}

