// components/Canvas.tsx

import styles from "@/styles/ResumeBuilder.module.css"
import type { ReactNode } from "react"

type CanvasProps = {
  children: ReactNode
  zoom: number
}

export default function Canvas({ children, zoom }: CanvasProps) {
  return (
    <div className={`${styles.canvasWrapper} canvasWrapper`}>
      <div className={styles.canvasContainer}>
        <div
          className={styles.canvas}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            minHeight: "297mm",
            background: "#fff",
            padding: "20mm",
            width: "210mm", // A4 width
            margin: "0 auto",
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
