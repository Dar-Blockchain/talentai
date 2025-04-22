// components/Canvas.tsx

import styles from '@/styles/ResumeBuilder.module.css'
import { ReactNode } from 'react'

export default function Canvas({ children }: { children: ReactNode }) {
  return (
    <div className={styles.canvasWrapper}>
      <div className={styles.canvas}>
        {children}
      </div>
    </div>
  )
}
