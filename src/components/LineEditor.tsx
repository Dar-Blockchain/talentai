'use client'

import { useState } from 'react'
import { Box, Slider, Typography, RadioGroup, FormControlLabel, Radio, FormLabel } from '@mui/material'
import { SketchPicker } from 'react-color'

type LineEditorProps = {
  onLinePropertiesChange: (properties: {
    orientation: 'horizontal' | 'vertical',
    thickness: number,
    color: string
  }) => void
  initialOrientation?: 'horizontal' | 'vertical'
  initialThickness?: number
  initialColor?: string
}

export default function LineEditor({ 
  onLinePropertiesChange, 
  initialOrientation = 'horizontal', 
  initialThickness = 2, 
  initialColor = '#000000' 
}: LineEditorProps) {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(initialOrientation)
  const [thickness, setThickness] = useState(initialThickness)
  const [color, setColor] = useState(initialColor)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleOrientationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOrientation = event.target.value as 'horizontal' | 'vertical'
    setOrientation(newOrientation)
    onLinePropertiesChange({
      orientation: newOrientation,
      thickness,
      color
    })
  }

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
      <FormLabel component="legend">Orientation</FormLabel>
      <RadioGroup
        row
        name="orientation-radio-group"
        value={orientation}
        onChange={handleOrientationChange}
        sx={{ mb: 2 }}
      >
        <FormControlLabel 
          value="horizontal" 
          control={<Radio />} 
          label="Horizontal" 
        />
        <FormControlLabel 
          value="vertical" 
          control={<Radio />} 
          label="Vertical" 
        />
      </RadioGroup>

      <Typography gutterBottom>
        Thickness: {thickness}px
      </Typography>
      <Slider
        value={thickness}
        onChange={handleThicknessChange}
        aria-labelledby="thickness-slider"
        min={1}
        max={20}
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
            />
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography gutterBottom>Preview:</Typography>
        <Box 
          sx={{ 
            backgroundColor: '#f9f9f9', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            padding: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100px'
          }}
        >
          <div 
            style={{
              width: orientation === 'horizontal' ? '100%' : `${thickness}px`,
              height: orientation === 'horizontal' ? `${thickness}px` : '100px',
              backgroundColor: color
            }}
          />
        </Box>
      </Box>
    </Box>
  )
} 