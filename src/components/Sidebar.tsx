'use client'

import { useState } from 'react'
import { Button, Typography, Divider, Box, IconButton } from '@mui/material'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import WorkIcon from '@mui/icons-material/Work'
import SchoolIcon from '@mui/icons-material/School'
import CodeIcon from '@mui/icons-material/Code'
import LanguageIcon from '@mui/icons-material/Language'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial'
import AddIcon from '@mui/icons-material/Add'
import ImageIcon from '@mui/icons-material/Image'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import styles from '@/styles/ResumeBuilder.module.css'

type Props = {
  onAdd: (type: string) => void;
  onClose?: () => void;
}

const sections = [
  { type: 'header', label: 'Header', icon: AccountBoxIcon },
  { type: 'text', label: 'Text Block', icon: TextFieldsIcon },
  { type: 'experience', label: 'Experience', icon: WorkIcon },
  { type: 'education', label: 'Education', icon: SchoolIcon },
  { type: 'skills', label: 'Skills', icon: CodeIcon },
  { type: 'languages', label: 'Languages', icon: LanguageIcon },
  { type: 'projects', label: 'Projects', icon: FolderSpecialIcon },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'line', label: 'Line Divider', icon: HorizontalRuleIcon },
]

export default function Sidebar({ onAdd, onClose }: Props) {
  return (
    <>
      {/* Close Button */}
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: -16,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#ffffff',
            border: '2px solid #537AE3',
            borderRadius: '50%',
            width: 36,
            height: 36,
            boxShadow: '0 4px 12px rgba(83, 122, 227, 0.25)',
            zIndex: 1000,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#537AE3',
              borderColor: '#537AE3',
              boxShadow: '0 6px 16px rgba(83, 122, 227, 0.35)',
              transform: 'translateY(-50%) scale(1.1)'
            },
            '&:hover .close-icon': {
              color: '#ffffff'
            }
          }}
        >
          <ChevronLeftIcon 
            className="close-icon"
            sx={{ 
              color: '#537AE3', 
              fontSize: '18px',
              transition: 'color 0.2s ease'
            }} 
          />
        </IconButton>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ 
          color: '#333',
          fontWeight: 600,
          mb: 1
        }}>
          Resume Builder
        </Typography>
        <Typography variant="body2" sx={{ 
          color: 'rgba(51,51,51,0.7)',
          fontSize: '0.875rem'
        }}>
          Drag and drop sections to build your resume
        </Typography>
      </Box>

      <Divider sx={{ 
        borderColor: 'rgba(51,51,51,0.1)',
        my: 2 
      }} />

      <Typography variant="subtitle2" sx={{ 
        color: 'rgba(51,51,51,0.7)',
        mb: 2,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontSize: '0.75rem'
      }}>
        Add Sections
      </Typography>

      <div className={styles.sectionButtons}>
        {sections.map(({ type, label, icon: Icon }) => (
          <Button
            key={type}
            onClick={() => onAdd(type)}
            startIcon={<Icon />}
            fullWidth
            sx={{
              justifyContent: 'flex-start',
              color: 'rgba(51,51,51,0.9)',
              backgroundColor: 'rgba(51,51,51,0.05)',
              borderRadius: '8px',
              py: 1.5,
              px: 2,
              mb: 1,
              textAlign: 'left',
              '&:hover': {
                backgroundColor: 'rgba(51,51,51,0.1)',
              },
              '& .MuiButton-startIcon': {
                color: '#1976d2'
              }
            }}
          >
            {label}
          </Button>
        ))}

        <Button
          onClick={() => onAdd('custom')}
          startIcon={<AddIcon />}
          fullWidth
          sx={{
            justifyContent: 'flex-start',
            color: '#1976d2',
            border: '1px dashed rgba(25,118,210,0.3)',
            borderRadius: '8px',
            py: 1.5,
            px: 2,
            mt: 2,
            textAlign: 'left',
            '&:hover': {
              backgroundColor: 'rgba(25,118,210,0.1)',
              borderColor: '#1976d2'
            }
          }}
        >
          Custom Section
        </Button>
      </div>

      <Box sx={{ 
        mt: 'auto', 
        pt: 4,
        pb: 2 // Add some bottom padding
      }}>
        <Typography variant="caption" sx={{ 
          color: 'rgba(51,51,51,0.5)',
          display: 'block',
          textAlign: 'center',
          fontSize: '0.7rem' // Slightly smaller font
        }}>
          Tip: Double click any section to edit its content
        </Typography>
      </Box>
    </>
  )
}