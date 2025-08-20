'use client'

import { useState, useRef } from 'react'
import { Box, Button, Typography } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

type ImageUploaderProps = {
  onImageSelected: (imageData: string, isRound: boolean) => void
  initialImage?: string
}

export default function ImageUploader({ onImageSelected, initialImage }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null)
  const [isRound, setIsRound] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Process the file
    processFile(file)
    
    // Reset the input value so the same file can be selected again
    e.target.value = ''
  }

  // Process the selected file
  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.match(/^image\//)) {
      setError('Please select a valid image file')
      return
    }

    // Read the file
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      if (imageData) {
        setPreview(imageData)
        onImageSelected(imageData, isRound)
      }
    }
    reader.onerror = () => {
      setError('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files?.length > 0) {
      processFile(files[0])
    }
  }

  // Toggle round/square shape
  const handleShapeChange = (round: boolean) => {
    setIsRound(round)
    if (preview) {
      onImageSelected(preview, round)
    }
  }

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Common drag-and-drop props
  const dragDropProps = {
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    ref: dropZoneRef,
  }

  return (
    <Box sx={{ p: 2, width: '100%' }}>
      {/* Shape selection */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant={!isRound ? 'contained' : 'outlined'} 
          size="small"
          sx={{ mr: 1 }}
          onClick={() => handleShapeChange(false)}
        >
          Square
        </Button>
        <Button
          variant={isRound ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handleShapeChange(true)}
        >
          Round
        </Button>
      </Box>

      {/* Preview area */}
      {preview ? (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box 
            {...dragDropProps}
            component="div"
            sx={{ 
              width: isRound ? '160px' : '100%',
              maxWidth: '300px',
              height: isRound ? '160px' : 'auto',
              borderRadius: isRound ? '50%' : '4px',
              overflow: 'hidden',
              border: isDragging ? '2px dashed #2196f3' : '1px solid #ddd',
              margin: '0 auto',
              mb: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              position: 'relative',
              backgroundColor: isDragging ? 'rgba(33,150,243,0.1)' : 'transparent',
              transition: 'all 0.2s'
            }}
            onClick={handleUploadClick}
          >
            {isDragging ? (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.7)',
                zIndex: 2
              }}>
                <CloudUploadIcon sx={{ fontSize: 32, color: '#2196f3', mb: 1 }} />
                <Typography variant="body2">Drop to replace</Typography>
              </Box>
            ) : null}
            <img 
              src={preview} 
              alt="Uploaded image" 
              style={{ 
                width: isRound ? '100%' : '100%',
                height: isRound ? '100%' : 'auto',
                objectFit: isRound ? 'cover' : 'contain',
                maxHeight: isRound ? 'none' : '200px'
              }} 
            />
          </Box>
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleUploadClick}
          >
            Change Image
          </Button>
        </Box>
      ) : (
        <Box 
          {...dragDropProps}
          component="div"
          onClick={handleUploadClick}
          sx={{
            border: `2px dashed ${isDragging ? '#2196f3' : '#ccc'}`,
            borderRadius: '8px',
            padding: 3,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragging ? 'rgba(33,150,243,0.1)' : 'rgba(0,0,0,0.03)',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(0,0,0,0.05)'
            }
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: isDragging ? '#2196f3' : '#666', mb: 1 }} />
          <Typography variant="body1" sx={{ mb: 1 }}>
            {isDragging ? 'Drop image here' : 'Click or drag to upload image'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Supports JPEG, PNG, GIF
          </Typography>
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Typography variant="body2" color="error" textAlign="center" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </Box>
  )
} 