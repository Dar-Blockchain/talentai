'use client'

import { useState } from 'react'
import { Box, Slider, Typography, FormLabel } from '@mui/material'
import { SketchPicker } from 'react-color'

type LineEditorProps = {
  onLinePropertiesChange: (properties: {
    orientation: 'horizontal',
    thickness: number,
    color: string
  }) => void
  initialThickness?: number
  initialColor?: string
}

export default function LineEditor({ 
  onLinePropertiesChange, 
  initialThickness = 3, 
  initialColor = '#556fb5' 
}: LineEditorProps) {
  // Always use horizontal orientation
  const orientation = 'horizontal'
  const [thickness, setThickness] = useState(initialThickness)
  const [color, setColor] = useState(initialColor)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleThicknessChange = (_event: Event, newValue: number | number[]) => {
    const newThickness = newValue as number
    setThickness(newThickness)
    onLinePropertiesChange({
      orientation,
      thickness: newThickness,
      color
    })
  }

  const handleColorChange = (newColor: any) => {
    setColor(newColor.hex)
    onLinePropertiesChange({
      orientation,
      thickness,
      color: newColor.hex
    })
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Professional Line Settings
      </Typography>

      <Typography gutterBottom sx={{ mt: 2 }}>
        Thickness: {thickness}px
      </Typography>
      <Slider
        value={thickness}
        onChange={handleThicknessChange}
        aria-labelledby="thickness-slider"
        min={1}
        max={10}
        step={1}
        sx={{ mb: 3 }}
      />

      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>
          Color
        </Typography>
        <Box 
          onClick={() => setShowColorPicker(!showColorPicker)}
          sx={{ 
            backgroundColor: color,
            width: '100%',
            height: '36px',
            cursor: 'pointer',
            borderRadius: '4px',
            border: '1px solid #ccc',
            '&:hover': {
              opacity: 0.9
            }
          }}
        />
        {showColorPicker && (
          <Box sx={{ 
            position: 'absolute', 
            zIndex: 2,
            mt: 1
          }}>
            <Box 
              sx={{ 
                position: 'fixed', 
                top: 0, 
                right: 0, 
                bottom: 0, 
                left: 0,
              }} 
              onClick={() => setShowColorPicker(false)} 
            />
            <SketchPicker 
              color={color}
              onChange={handleColorChange}
              presetColors={['#556fb5', '#2C3E50', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#8E44AD', '#1ABC9C']}
            />
          </Box>
        )}
      </Box>

      <Typography gutterBottom>Preview:</Typography>
      <Box 
        sx={{ 
          backgroundColor: '#f9f9f9', 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '80px'
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#556fb5', textTransform: 'uppercase', fontWeight: 'bold' }}>
          SECTION TITLE
        </Typography>
        <div 
          style={{
            width: '100%',
            height: `${thickness}px`,
            backgroundColor: color,
            marginTop: '3px',
            marginBottom: '10px'
          }}
        />
        <Typography variant="body2" sx={{ color: '#777' }}>
          Section content would appear here...
        </Typography>
      </Box>
    </Box>
  )
} 