import { IconButton, Tooltip } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import UndoIcon from '@mui/icons-material/Undo'
import TemplateIcon from '@mui/icons-material/Description'
import QrCodeIcon from '@mui/icons-material/QrCode'
import styles from '@/styles/ResumeBuilder.module.css'

interface ResumeActionsProps {
  onSaveDraft: () => void
  onExportPDF: () => void
  onChangeTemplate: () => void
  onUndo: () => void
  onGenerateQR: () => void
  canUndo: boolean
  sectionsCount: number
}

export default function ResumeActions({
  onSaveDraft,
  onExportPDF,
  onChangeTemplate,
  onUndo,
  onGenerateQR,
  canUndo,
  sectionsCount
}: ResumeActionsProps) {
  return (
    <div className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <span style={{ fontWeight: 600, fontSize: '16px', color: 'white' }}>
          TalentAI Resume Builder
        </span>
      </div>
      
      <div className={styles.topBarCenter}>
        <Tooltip title="Save Draft" arrow>
          <button className={styles.topBarButton} onClick={onSaveDraft}>
            <SaveIcon fontSize="small" />
            <span>Save</span>
          </button>
        </Tooltip>
        
        <Tooltip title="Export as PDF" arrow>
          <button className={styles.topBarButton} onClick={onExportPDF}>
            <PictureAsPdfIcon fontSize="small" />
            <span>Export</span>
          </button>
        </Tooltip>
        
        {<Tooltip title="Generate Blockchain QR Code" arrow>
          <button className={styles.topBarButton} onClick={onGenerateQR}>
            <QrCodeIcon fontSize="small" />
            <span>Verify</span>
          </button>
        </Tooltip> }
        
        <Tooltip title="Undo Last Action" arrow>
          <button 
            className={styles.topBarButton} 
            onClick={onUndo}
            disabled={!canUndo}
          >
            <UndoIcon fontSize="small" />
            <span>Undo</span>
          </button>
        </Tooltip>
        
        <Tooltip title="Change Template" arrow>
          <button className={styles.topBarButton} onClick={onChangeTemplate}>
            <TemplateIcon fontSize="small" />
            <span>Templates</span>
          </button>
        </Tooltip>
      </div>
      
      <div className={styles.topBarRight}>
        <span style={{ fontSize: '14px', color: 'white' }}>
          {sectionsCount} sections
        </span>
      </div>
    </div>
  )
} 