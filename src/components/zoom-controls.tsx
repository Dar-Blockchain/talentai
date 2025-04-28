"use client"
import { Slider } from "@mui/material"
import ZoomInIcon from "@mui/icons-material/ZoomIn"
import ZoomOutIcon from "@mui/icons-material/ZoomOut"
import IconButton from "@mui/material/IconButton"
import styles from "@/styles/ResumeBuilder.module.css"

type ZoomControlsProps = {
  zoom: number
  setZoom: (zoom: number) => void
  minZoom?: number
  maxZoom?: number
  step?: number
}

export default function ZoomControls({ zoom, setZoom, minZoom = 30, maxZoom = 100, step = 5 }: ZoomControlsProps) {
  const handleZoomIn = () => {
    if (zoom < maxZoom) {
      setZoom(Math.min(zoom + step, maxZoom))
    }
  }

  const handleZoomOut = () => {
    if (zoom > minZoom) {
      setZoom(Math.max(zoom - step, minZoom))
    }
  }

  return (
    <div className={styles.zoomControls}>
      <IconButton onClick={handleZoomOut} size="small" sx={{ color: "white" }}>
        <ZoomOutIcon fontSize="small" />
      </IconButton>

      <Slider
        value={zoom}
        min={minZoom}
        max={maxZoom}
        step={step}
        onChange={(_, value) => setZoom(value as number)}
        sx={{
          width: 100,
          mx: 1,
          color: "white",
          "& .MuiSlider-thumb": {
            width: 14,
            height: 14,
          },
        }}
      />

      <IconButton onClick={handleZoomIn} size="small" sx={{ color: "white" }}>
        <ZoomInIcon fontSize="small" />
      </IconButton>

      <span className={styles.zoomPercentage}>{zoom}%</span>
    </div>
  )
}
