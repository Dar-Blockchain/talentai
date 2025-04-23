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
  updatePosition: (id: string, pos: { x: number; y: number; width: number; height: number }) => void
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
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 })
  const editableRef = useRef<HTMLDivElement | null>(null)
  const rndRef = useRef<Rnd | null>(null)
  const { id, x, y, width, height, type } = section

  const MIN_HEIGHT = 40
  const zoomFactor = zoom / 100

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || !editableRef.current?.contains(selection.anchorNode)) {
        setShowToolbar(false)
      } else {
        updateToolbarPosition()
      }
    }

    document.addEventListener("selectionchange", handleSelectionChange)
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, [])

  useEffect(() => {
    const fixRndPosition = () => {
      if (rndRef.current) {
        const rndElement = rndRef.current.resizableElement.current
        if (rndElement && (x !== undefined || y !== undefined)) {
          rndElement.style.transform = `translate(${x}px, ${y}px)`
          const applyPositionFix = () => {
            if (rndElement) {
              rndElement.style.transform = `translate(${x}px, ${y}px)`
            }
          }
          requestAnimationFrame(applyPositionFix)
        }
      }
    }

    fixRndPosition()

    const handleSelectionEnd = () => {
      setTimeout(fixRndPosition, 0)
      setTimeout(fixRndPosition, 50)
    }

    document.addEventListener("selectionchange", handleSelectionEnd)
    return () => {
      document.removeEventListener("selectionchange", handleSelectionEnd)
    }
  }, [x, y, isEditing, autoHeight])

  const sharedEditableStyle: React.CSSProperties = {
    width: "100%",
    minHeight: `${MIN_HEIGHT}px`,
    padding: "8px",
    fontSize: "16px",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    color: "#000",
    caretColor: "#000",
    outline: "none",
    userSelect: isEditing ? "text" : "none", // Allow text selection only in edit mode
    direction: "ltr",
    backgroundColor: "transparent",
    cursor: isEditing ? "text" : "move",
  }

  const renderContent = () => {
    switch (type) {
      case "text":
        return (section as TextSection).content
      case "experience":
        const exp = section as ExperienceSection
        return (
          <>
            <strong>{exp.title}</strong> @ {exp.company}
            <br />
            <em>
              {exp.startDate} – {exp.endDate}
            </em>
            <p>{exp.description}</p>
          </>
        )
      case "skills":
        return (
          <>
            <strong>Skills:</strong>
            <ul style={{ listStylePosition: "inside", paddingLeft: 0 }}>
              {(section as SkillsSection).skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </>
        )
      case "languages":
        return (
          <>
            <strong>Languages:</strong>
            <ul style={{ listStylePosition: "inside", paddingLeft: 0 }}>
              {(section as LanguagesSection).languages.map((lang, i) => (
                <li key={i}>
                  {lang.name} — {lang.level}
                </li>
              ))}
            </ul>
          </>
        )
      case "education":
        const edu = section as EducationSection
        return (
          <>
            <strong>{edu.degree}</strong> @ {edu.institution}
            <br />
            <em>
              {edu.startDate} – {edu.endDate}
            </em>
            <p>{edu.description}</p>
          </>
        )
      case "projects":
        return (
          <>
            <strong>Projects:</strong>
            <ul style={{ listStylePosition: "inside", paddingLeft: 0 }}>
              {(section as ProjectsSection).projects.map((proj, i) => (
                <li key={i}>
                  <strong>{proj.name}</strong>: {proj.description}
                </li>
              ))}
            </ul>
          </>
        )
      case "header":
        const header = section as HeaderSection
        return (
          <>
            <h2 style={{ margin: 0 }}>{header.name}</h2>
            <p style={{ margin: 0 }}>{header.jobTitle}</p>
          </>
        )
      case "custom":
        return (section as CustomSection).content
      default:
        return null
    }
  }

  const getContentText = () => editableRef.current?.innerText.trim() || ""

  const handleBlur = () => {
    const newText = getContentText()
    updateContent(id, newText)
    setIsEditing(false)
  }

  const resizeToContent = () => {
    const el = editableRef.current
    if (!el) return

    const cleanText = el.innerText.trim()
    if (cleanText === "") el.innerHTML = ""

    requestAnimationFrame(() => {
      const newHeight = el.scrollHeight
      const finalHeight = Math.max(newHeight, MIN_HEIGHT)
      if (Math.abs(finalHeight - autoHeight) > 2) {
        setAutoHeight(finalHeight)

        const el = rndRef.current?.resizableElement.current
        if (el) {
          const transform = el.style.transform
          const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)
          const newX = match ? Number.parseFloat(match[1]) : x
          const newY = match ? Number.parseFloat(match[2]) : y

          updatePosition(id, {
            x: newX,
            y: newY,
            width,
            height: finalHeight,
          })
        }
      }
    })
  }

  useLayoutEffect(() => {
    const el = editableRef.current
    if (!el) return
    const observer = new MutationObserver(resizeToContent)
    observer.observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    })
    return () => observer.disconnect()
  }, [autoHeight])

  const updateToolbarPosition = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return
    const rect = selection.getRangeAt(0).getClientRects()[0]
    const scrollY = window.scrollY || document.documentElement.scrollTop

    if (rect) {
      setToolbarPos({
        top: rect.top + scrollY - 60,
        left: rect.left + rect.width / 2,
      })
      setShowToolbar(true)
    }
  }

  const handleDragStop = (e: any, d: { x: number; y: number }) => {
    updatePosition(id, {
      x: d.x,
      y: d.y,
      width,
      height: autoHeight,
    })
  }

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: { x: number; y: number }) => {
    const newHeight = Number.parseInt(ref.style.height)
    const newWidth = Number.parseInt(ref.style.width)
    setAutoHeight(newHeight)

    updatePosition(id, {
      x: position.x,
      y: position.y,
      width: newWidth,
      height: newHeight,
    })
  }

  // Prevent text editing (typing, deleting, pasting) in edit mode for skills section
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (type === 'skills' && isEditing) {
      e.preventDefault()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (type === 'skills' && isEditing) {
      e.preventDefault()
    }
  }

  return (
    <Rnd
    className={styles.sectionWrapper}
      ref={rndRef}
      bounds="parent"
      disableDragging={isEditing}
      enableResizing={{
        top: false,
        right: false,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
      size={{ width, height: autoHeight }}
      position={{ x, y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      scale={zoomFactor}
      onClick={(e: { stopPropagation: () => void }) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        position: "absolute",
        backgroundColor: "transparent",
        zIndex: 10,
        border: isActive ? "1px dashed #00bcd4" : "none",
      }}
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
        ref={editableRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={(e) => {
          e.preventDefault()
          setIsEditing(true)
        }}
        onBlur={handleBlur}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onInput={resizeToContent}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onKeyUp={updateToolbarPosition}
        onMouseUp={updateToolbarPosition}
        style={{
          ...sharedEditableStyle,
          cursor: isEditing ? (type === 'skills' ? 'default' : 'text') : 'move',
        }}
        data-section-content="true"
      >
        {renderContent()}
      </div>

      <FloatingToolbar visible={showToolbar} onClose={() => setShowToolbar(false)} />
    </Rnd>
  )
}