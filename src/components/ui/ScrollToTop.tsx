import React, { useState, useEffect } from 'react'
import { Fab, Zoom } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

const SCROLL_THRESHOLD = 300

const getScrollEl = (): HTMLElement | Window => {
  if (typeof window === 'undefined') return window
  return document.getElementById('main-scroll') ?? window
}

const getScrollTop = (el: HTMLElement | Window): number =>
  el instanceof Window ? el.scrollY : el.scrollTop

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = getScrollEl()

    const onScroll = () => setVisible(getScrollTop(el) > SCROLL_THRESHOLD)

    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    const el = getScrollEl()
    el instanceof Window
      ? el.scrollTo({ top: 0, behavior: 'smooth' })
      : el.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Zoom in={visible}>
      <Fab
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#00FF9D',
          color: '#fff',
          '&:hover': { backgroundColor: '#00e68a' },
          zIndex: 1000,
        }}
        size="small"
        aria-label="scroll back to top"
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  )
}

export default ScrollToTop
