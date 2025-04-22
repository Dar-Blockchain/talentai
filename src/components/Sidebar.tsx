// components/Sidebar.tsx
'use client'

import { Button } from '@mui/material'
import styles from '@/styles/ResumeBuilder.module.css'

const sectionTypes = [
  { label: 'Text', type: 'text' },
  { label: 'Experience', type: 'experience' },
  { label: 'Skills', type: 'skills' },
  { label: 'Languages', type: 'languages' },
  { label: 'Education', type: 'education' },
  { label: 'Header', type: 'header' },
  { label: 'Projects', type: 'projects' },
  { label: 'Custom Section', type: 'custom' },
]

export default function Sidebar({ onAdd }: { onAdd: (type: string) => void }) {
  return (
    <div className={styles.sidebar}>
      <h3>Add Section</h3>
      {sectionTypes.map((sec) => (
        <Button
          key={sec.type}
          variant="outlined"
          size="small"
          fullWidth
          onClick={() => onAdd(sec.type)}
          sx={{ marginBottom: '8px' }}
        >
          {sec.label}
        </Button>
      ))}
    </div>
  )
}
