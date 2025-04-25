'use client'

import { Button, Typography, Divider, Box } from '@mui/material'
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
import styles from '@/styles/ResumeBuilder.module.css'

type Props = {
  onAdd: (type: string) => void
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

export default function Sidebar({ onAdd }: Props) {
  return (
    <div className={styles.sidebar}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ 
          color: '#fff',
          fontWeight: 600,
          mb: 1
        }}>
          Resume Builder
        </Typography>
        <Typography variant="body2" sx={{ 
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.875rem'
        }}>
          Drag and drop sections to build your resume
        </Typography>
      </Box>

      <Divider sx={{ 
        borderColor: 'rgba(255,255,255,0.1)',
        my: 2 
      }} />

      <Typography variant="subtitle2" sx={{ 
        color: 'rgba(255,255,255,0.7)',
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
              color: 'rgba(255,255,255,0.9)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              py: 1.5,
              px: 2,
              mb: 1,
              textAlign: 'left',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
              '& .MuiButton-startIcon': {
                color: '#02E2FF'
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
            color: '#02E2FF',
            border: '1px dashed rgba(2,226,255,0.3)',
            borderRadius: '8px',
            py: 1.5,
            px: 2,
            mt: 2,
            textAlign: 'left',
            '&:hover': {
              backgroundColor: 'rgba(2,226,255,0.1)',
              borderColor: '#02E2FF'
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
    color: 'rgba(255,255,255,0.5)',
    display: 'block',
    textAlign: 'center',
    fontSize: '0.7rem' // Slightly smaller font
  }}>
    Tip: Double click any section to edit its content
  </Typography>
</Box>
    </div>
  )
}