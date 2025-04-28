'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconButton } from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import styles from '@/styles/ResumeBuilder.module.css'

export default function ResumeSection({ id, content, onContentChange }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={styles.section}>
      <div className={styles.dragHandle}>
        <IconButton {...attributes} {...listeners} size="small">
          <DragIndicatorIcon sx={{ color: '#00e5ff' }} />
        </IconButton>
      </div>
      <div
        className={styles.editable}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onContentChange(id, (e.target as HTMLElement).innerText)}
      >
        {content}
      </div>
    </div>
  )
}
