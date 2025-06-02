// components/Canvas.tsx

import styles from "@/styles/ResumeBuilder.module.css"
import type { ReactNode } from "react"
import { useState } from "react"

type CanvasProps = {
  children: ReactNode
  zoom: number
  clearSelection?: () => void
}

export default function Canvas({ children, zoom, clearSelection }: CanvasProps) {
  const [showGuides, setShowGuides] = useState(false);

  const guideStyles = {
    position: "absolute" as const,
    pointerEvents: "none" as const,
    zIndex: 1000,
  };

  const horizontalGuideStyle = {
    ...guideStyles,
    left: 0,
    right: 0,
    height: "1px",
    background: "rgba(0, 120, 255, 0.2)",
  };

  const verticalGuideStyle = {
    ...guideStyles,
    top: 0,
    bottom: 0,
    width: "1px",
    background: "rgba(0, 120, 255, 0.2)",
  };

  // Create guides every 20mm
  const guides = {
    horizontal: Array.from({ length: 14 }, (_, i) => i * 20),
    vertical: Array.from({ length: 10 }, (_, i) => i * 20),
  };
  
  // Handle click on the canvas background
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only clear selection if the click was directly on the canvas (not a child element)
    if (e.target === e.currentTarget && clearSelection) {
      clearSelection();
    }
  };

  return (
    <div className={`${styles.canvasWrapper} canvasWrapper`}>
      <div className={styles.canvasContainer}>
        <button 
          onClick={() => setShowGuides(!showGuides)}
          style={{
            position: "fixed",
            bottom: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1001,
            padding: "8px 16px",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            border: "none",
            borderRadius: "20px",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
          }}
        >
          {showGuides ? "Hide Guides" : "Show Guides"}
        </button>
        <div
          className={styles.canvas}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            background: "rgb(255, 255, 255)",
            padding: "20px",
            width: "793.7px", // Updated to requested width
            height: "1122.5px", // Updated to requested height
            margin: "0 auto",
            position: "relative",
            boxSizing: "border-box",
          }}
          onClick={handleCanvasClick}
        >
          {showGuides && (
            <>
              {guides.horizontal.map((position) => (
                <div
                  key={`h-${position}`}
                  style={{
                    ...horizontalGuideStyle,
                    top: `${position}mm`,
                  }}
                />
              ))}
              {guides.vertical.map((position) => (
                <div
                  key={`v-${position}`}
                  style={{
                    ...verticalGuideStyle,
                    left: `${position}mm`,
                  }}
                />
              ))}
            </>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
