"use client"

import type React from "react"
import { Rnd } from "react-rnd"
import type {
  TextSection,
  ExperienceSection,
  SkillsSection,
  LanguagesSection,
  EducationSection,
  HeaderSection,
  ProjectsSection,
  CustomSection,
  SectionType,
} from "@/models/sectionTypes"
import styles from "@/styles/ResumeBuilder.module.css"
import DeleteIcon from "@mui/icons-material/Delete"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import IconButton from "@mui/material/IconButton"
import FloatingToolbar from "@/components/FloatingToolbar"
import { useRef, useState, useLayoutEffect, useEffect } from "react"

type Props = {
  section: SectionType
  updateContent: (id: string, newContent: string) => void
  updatePosition: (
    id: string,
    pos: { x: number; y: number; width: number; height: number }
  ) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  isActive: boolean
  onClick: () => void
  zoom?: number
}

export default function SectionRenderer({
  section,
  updateContent,
  updatePosition,
  onDelete,
  onDuplicate,
  isActive,
  onClick,
  zoom = 100,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [autoHeight, setAutoHeight] = useState(section.height)
  const [showToolbar, setShowToolbar] = useState(false)
  const editableRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rndRef = useRef<Rnd | null>(null)
  const { id, x, y, width, height, type } = section

  const MIN_HEIGHT = 40
  const zoomFactor = zoom / 100

  // Handle selection changes to position toolbar
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection()
      if (
        !sel ||
        sel.isCollapsed ||
        !editableRef.current?.contains(sel.anchorNode)
      ) {
        setShowToolbar(false)
      }
    }
    document.addEventListener("selectionchange", handleSelectionChange)
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, [])

  // Fix Rnd position after style changes
  useEffect(() => {
    const fixRndPosition = () => {
      if (rndRef.current) {
        const el = rndRef.current.resizableElement.current
        if (el) {
          el.style.transform = `translate(${x}px, ${y}px)`
        }
      }
    }
    fixRndPosition()
    document.addEventListener("selectionchange", () => setTimeout(fixRndPosition, 0))
    return () => {
      document.removeEventListener("selectionchange", () => setTimeout(fixRndPosition, 0))
    }
  }, [x, y])

  const sharedEditableStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    minHeight: `${MIN_HEIGHT}px`,
    padding: "8px",
    fontSize: "16px",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    color: "#000",
    caretColor: "#000",
    outline: "none",
    userSelect: isEditing ? "text" : "none",
    direction: "ltr",
    backgroundColor: "transparent",
  }

  // Generate the initial content for sections that don't have saved content yet
  const generateInitialContent = () => {
    switch (type) {
      case "experience":
        const exp = section as ExperienceSection
        return `<strong>${exp.title}</strong> @ ${exp.company}<br><em>${exp.startDate} – ${exp.endDate}</em><p>${exp.description}</p>`
      case "skills":
        return `<strong>Skills:</strong><ul style="list-style-position: inside; padding-left: 0">${(section as SkillsSection).skills.map(s => `<li>${s}</li>`).join('')}</ul>`
      case "languages":
        return `<strong>Languages:</strong><ul style="list-style-position: inside; padding-left: 0">${(section as LanguagesSection).languages.map(lang => `<li>${lang.name} — ${lang.level}</li>`).join('')}</ul>`
      case "education":
        const edu = section as EducationSection
        return `<strong>${edu.degree}</strong> @ ${edu.institution}<br><em>${edu.startDate} – ${edu.endDate}</em><p>${edu.description}</p>`
      case "projects":
        return `<strong>Projects:</strong><ul style="list-style-position: inside; padding-left: 0">${(section as ProjectsSection).projects.map(proj => `<li><strong>${proj.name}</strong>: ${proj.description}</li>`).join('')}</ul>`
      case "header":
        const header = section as HeaderSection
        return `<h2 style="margin: 0">${header.name}</h2><p style="margin: 0">${header.jobTitle}</p>`
      default:
        return ''
    }
  }

  // Get content based on section type
  const getSectionContent = () => {
    // For text and custom sections, we already store their content in HTML format
    if (type === "text" || type === "custom") {
      return (section as any).content || ''
    }
    
    // For all other section types, we need to check if they have a saved HTML content
    // or generate it from their structured data
    return (section as any).content || generateInitialContent()
  }

  // Save HTML including inline styles
  const handleBlur = () => {
    if (!editableRef.current) return
    const html = editableRef.current.innerHTML || ""
    updateContent(id, html)
    setIsEditing(false)
  }

  // Auto-resize logic remains unchanged
  const resizeToContent = () => {
    const el = editableRef.current
    if (!el) return
    requestAnimationFrame(() => {
      const newHeight = Math.max(el.scrollHeight, MIN_HEIGHT)
      if (Math.abs(newHeight - autoHeight) > 2) {
        setAutoHeight(newHeight)
        const node = rndRef.current?.resizableElement.current
        if (node) {
          const match = node.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)
          const newX = match ? parseFloat(match[1]) : x
          const newY = match ? parseFloat(match[2]) : y
          updatePosition(id, { x: newX, y: newY, width, height: newHeight })
        }
      }
    })
  }

  useLayoutEffect(() => {
    const el = editableRef.current
    if (!el) return
    const obs = new MutationObserver(resizeToContent)
    obs.observe(el, { childList: true, characterData: true, subtree: true })
    return () => obs.disconnect()
  }, [autoHeight])

  useEffect(() => {
    // Set initial content when edit mode begins
    if (isEditing && editableRef.current) {
      const content = getSectionContent()
      // Only set innerHTML if it's empty or different
      if (editableRef.current.innerHTML !== content) {
        editableRef.current.innerHTML = content
      }
      
      // Focus on the editable element
      setTimeout(() => {
        editableRef.current?.focus()
      }, 10)
    }
  }, [isEditing])

  const updateToolbarPosition = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    const rect = sel.getRangeAt(0).getClientRects()[0]
    if (rect) setShowToolbar(true)
  }

  const handleDragStop = (_: any, d: { x: number; y: number }) => {
    updatePosition(id, { x: d.x, y: d.y, width, height: autoHeight })
  }

  const handleResizeStop = (
    _: any,
    __: any,
    ref: any,
    ___: any,
    pos: { x: number; y: number }
  ) => {
    const newH = parseInt(ref.style.height)
    const newW = parseInt(ref.style.width)
    setAutoHeight(newH)
    updatePosition(id, { x: pos.x, y: pos.y, width: newW, height: newH })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (type === "skills" && isEditing) e.preventDefault()
  }
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (type === "skills" && isEditing) e.preventDefault()
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isEditing) {
      onClick()
    }
  }

  return (
    <Rnd
      className={styles.sectionWrapper}
      ref={rndRef}
      bounds="parent"
      disableDragging={isEditing}
      enableResizing={{ top: false, right: false, bottom: true, left: false, topRight: false, bottomRight: true, bottomLeft: false, topLeft: false }}
      size={{ width, height: autoHeight }}
      position={{ x, y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      scale={zoomFactor}
      style={{ position: "absolute", backgroundColor: "transparent", zIndex: 10, border: isActive ? "1px dashed #00bcd4" : "none" }}
      data-rnd="true"
      data-section-id={id}
    >
      {!isEditing && (
        <div className={styles.sectionActions}>
          <IconButton size="small" onClick={() => onDelete(id)}>
            <DeleteIcon fontSize="small" sx={{ color: "#333" }} />
          </IconButton>
          <IconButton size="small" onClick={() => onDuplicate(id)}>
            <ContentCopyIcon fontSize="small" sx={{ color: "#333" }} />
          </IconButton>
        </div>
      )}

      <div 
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: isEditing ? "text" : "move"
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!isEditing) onClick();
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isEditing) setIsEditing(true);
        }}
      >
        {isEditing ? (
          <div 
            ref={editableRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onBlur={handleBlur}
            onInput={resizeToContent}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onKeyUp={updateToolbarPosition}
            onMouseUp={updateToolbarPosition}
            style={sharedEditableStyle}
            data-section-content="true"
          />
        ) : (
          <div 
            style={sharedEditableStyle}
            dangerouslySetInnerHTML={{ __html: getSectionContent() }} 
          />
        )}
      </div>

      <FloatingToolbar visible={showToolbar} onClose={() => setShowToolbar(false)} />
    </Rnd>
  )
}