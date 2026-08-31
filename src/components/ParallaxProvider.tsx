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

  // 1. Scroll Restoration & Dynamic Route Reveal Engine
  useEffect(() => {
    // Instant scroll to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

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
      rootMargin: '100px 0px 100px 0px',
      threshold: 0.05,
    })

    const scanAndObserve = () => {
      const revealElements = document.querySelectorAll('.scroll-reveal:not(.is-revealed)')
      const windowHeight = window.innerHeight

      revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        // If element is already in viewport or above fold, reveal immediately
        if (rect.top < windowHeight + 60 && rect.bottom > -60) {
          el.classList.add('is-revealed')
        } else {
          observer.observe(el)
        }
      })
    }

    // Immediate scan + subsequent frame checks for async loaded routes
    scanAndObserve()
    const r1 = requestAnimationFrame(scanAndObserve)
    const r2 = setTimeout(scanAndObserve, 80)
    const r3 = setTimeout(scanAndObserve, 250)

    // MutationObserver to auto-reveal any newly inserted route DOM nodes
    const mutObserver = new MutationObserver(() => {
      scanAndObserve()
    })
    mutObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(r1)
      clearTimeout(r2)
      clearTimeout(r3)
      observer.disconnect()
      mutObserver.disconnect()
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

