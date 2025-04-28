"use client"

import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useTheme, useMediaQuery, Drawer, IconButton, Button } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useDispatch, useSelector } from "react-redux"
import { getMyProfile } from "@/store/features/profileSlice"
import { AppDispatch, RootState } from "@/store/store"
import styles from '@/styles/ResumeBuilder.module.css'
import Sidebar from '@/components/Sidebar'
import Canvas from '@/components/Canvas'
import SectionRenderer from '@/components/SectionRenderer'
import ZoomControls from '@/components/zoom-controls'
import { HeaderSection, TextSection, SkillsSection, LanguagesSection, EducationSection, ExperienceSection, ProjectsSection, CustomSection, SectionType } from '@/models/sectionTypes'

export default function ResumeBuilder() {
  const dispatch = useDispatch<AppDispatch>()
  const profile = useSelector((state: RootState) => state.profile.profile)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [sections, setSections] = useState<SectionType[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [zoom, setZoom] = useState(75) // Default zoom level at 75%
  useEffect(() => {
    const draft = localStorage.getItem('resume-draft')
    if (draft) {
      try {
        setSections(JSON.parse(draft))
      } catch {
        console.warn('Could not parse resume draft')
      }
    }
  }, [])
  useEffect(() => {
    dispatch(getMyProfile())
  }, [dispatch])

  const updateSectionContent = (id: string, newContent: string) =>
    setSections((prev) => prev.map((s) => {
      if (s.id === id) {
        // Add content field to any section type
        return { ...s, content: newContent }
      }
      return s
    }))
  const updateSectionPosition = (id: string, pos: { x: number; y: number; width: number; height: number }) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...pos } : s)))

  const deleteSection = (id: string) => setSections((prev) => prev.filter((s) => s.id !== id))

  const duplicateSection = (id: string) => {
    const original = sections.find((s) => s.id === id)
    if (!original) return
    const copy = {
      ...original,
      id: uuidv4(),
      x: original.x + 30,
      y: original.y + 30,
    }
    setSections((prev) => [...prev, copy])
  }

  const addSection = (type: string) => {
    if (!profile) return // Don't add sections if profile isn't loaded

    const common = {
      id: uuidv4(),
      x: 100,
      y: 100,
      width: 400,
      height: 100,
    }

    let newSection: SectionType

    switch (type) {
      case 'header':
        newSection = {
          ...common,
          type: 'header',
          name: profile.userId.username || 'Your Name',
          jobTitle: profile.type || 'Your Title'
        } as HeaderSection
        break
      case 'text':
        newSection = {
          ...common,
          type: 'text',
          content: 'Editable text...'
        } as TextSection
        break
      case 'skills':
        newSection = {
          ...common,
          type: 'skills',
          skills: profile.skills.map(skill => skill.name)
        } as SkillsSection
        break
      case 'languages':
        newSection = {
          ...common,
          type: 'languages',
          languages: [{ name: "Add language", level: "level" }]
        } as LanguagesSection
        break
      case 'education':
        newSection = {
          ...common,
          type: 'education',
          institution: 'Institution Name',
          degree: 'Degree Name',
          startDate: 'Start Date',
          endDate: 'End Date',
          description: 'Education description...'
        } as EducationSection
        break
      case 'experience':
        newSection = {
          ...common,
          type: 'experience',
          title: 'Job Title',
          company: profile.companyDetails?.name || 'Company Name',
          startDate: 'Start Date',
          endDate: 'End Date',
          description: 'Job description...'
        } as ExperienceSection
        break
      case 'projects':
        newSection = {
          ...common,
          type: 'projects',
          projects: [{ name: 'Project Name', description: 'Project description...' }]
        } as ProjectsSection
        break
      case 'custom':
      default:
        newSection = {
          ...common,
          type: 'custom',
          content: 'Write anything here...'
        } as CustomSection
        break
    }

    setSections(prev => [...prev, newSection])
  }

  const exportToPDF = async () => {
    const contentArea = document.querySelector(`.${styles.canvas}`) as HTMLElement
    if (!contentArea) return

    try {
      // Store current styles
      const currentZoom = zoom
      const currentTransform = contentArea.style.transform
      const currentMinHeight = contentArea.style.minHeight

      // Reset styles for export
      setZoom(100)
      contentArea.style.transform = 'none'
      contentArea.style.minHeight = '297mm'

      // Wait for the style changes to be reflected
      await new Promise(resolve => setTimeout(resolve, 500))

      const pdf = new jsPDF('p', 'mm', 'a4')
      const canvasImage = await html2canvas(contentArea, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 210 * 3.78, // Convert mm to pixels (1mm = 3.78px)
        height: 297 * 3.78,
      })

      pdf.addImage(
        canvasImage.toDataURL('image/png'),
        'PNG',
        0,
        0,
        210,
        297
      )

      // Restore original styles
      setZoom(currentZoom)
      contentArea.style.transform = currentTransform
      contentArea.style.minHeight = currentMinHeight

      pdf.save('resume.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
      setZoom(zoom)
    }
  }

  return (
    <div className={styles.pageWrapper} onClick={() => setActiveId(null)}>
      {/* Mobile hamburger */}
      {isMobile && (
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 30,
            color: "white",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Export PDF Button */}
      <Button
  variant="outlined"
  color="secondary"
  sx={{
    position: 'fixed',
    top: 64,           // just below Export PDF
    right: 16,
    zIndex: 30,
  }}
  onClick={() => {
    localStorage.setItem('resume-draft', JSON.stringify(sections))
    // optionally give user feedback:
    alert('Resume draft saved!')
  }}
>
  Save Draft
</Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PictureAsPdfIcon />}
        onClick={exportToPDF}
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 30,
        }}
      >
        Export PDF
      </Button>

      {/* Sidebar (desktop) or Drawer (mobile) */}
      {isMobile ? (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} anchor="left">
          <Sidebar onAdd={addSection} />
        </Drawer>
      ) : (
        <div className={styles.sidebar}>
          <Sidebar onAdd={addSection} />
        </div>
      )}

      {/* Canvas */}
      <Canvas zoom={zoom}>
        <DndContext collisionDetection={closestCenter}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map((section) => (
              <SectionRenderer
                key={section.id}
                section={section}
                updateContent={updateSectionContent}
                updatePosition={updateSectionPosition}
                onDelete={deleteSection}
                onDuplicate={duplicateSection}
                isActive={activeId === section.id}
                onClick={() => setActiveId(section.id)}
                zoom={zoom} // Pass zoom level to SectionRenderer
              />
            ))}
          </SortableContext>
        </DndContext>
      </Canvas>

      {/* Zoom Controls */}
      <ZoomControls zoom={zoom} setZoom={setZoom} />
    </div>
  )
}
