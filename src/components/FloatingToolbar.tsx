"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

type Props = {
  visible: boolean
  onClose: () => void
}

export default function FloatingToolbar({ visible, onClose }: Props) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState(16)
  const [selection, setSelection] = useState<{
    range: Range | null
    rndElement: HTMLElement | null
    rndPosition: { transform: string; top: string; left: string } | null
  }>({
    range: null,
    rndElement: null,
    rndPosition: null,
  })

  // Save selection when toolbar becomes visible
  useEffect(() => {
    if (visible) {
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0).cloneRange()

        // Find RND container
        let node: Node | null = range.commonAncestorContainer
        let rndElement: HTMLElement | null = null

        while (node && node !== document.body) {
          if (
            node instanceof HTMLElement &&
            (node.hasAttribute("data-rnd") || (node.style.position === "absolute" && node.style.transform))
          ) {
            rndElement = node
            break
          }
          node = node.parentNode
        }

        // Store RND position
        const rndPosition = rndElement
          ? {
              transform: rndElement.style.transform,
              top: rndElement.style.top,
              left: rndElement.style.left,
            }
          : null

        // Store selection data
        setSelection({
          range,
          rndElement,
          rndPosition,
        })

        // Try to detect font size
        try {
          const node = sel.focusNode?.parentElement
          if (node) {
            const computedSize = Number.parseInt(window.getComputedStyle(node).fontSize)
            if (!isNaN(computedSize)) {
              setFontSize(computedSize)
            }
          }
        } catch (e) {
          console.error("Error detecting font size:", e)
        }
      }
    }
  }, [visible])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!toolbarRef.current?.contains(e.target as Node)) {
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed) onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Direct CSS injection approach
  const applyInlineStyle = (property: string, value: string) => {
    const { range, rndElement, rndPosition } = selection
    if (!range) return

    try {
      // Store original selection
      const sel = window.getSelection()
      if (!sel) return

      // Check if we're in a list
      let inListItem = false
      let listItem: HTMLElement | null = null
      let current: Node | null = range.commonAncestorContainer
      while (current && current !== document.body) {
        if (current.nodeName === "LI") {
          inListItem = true
          listItem = current as HTMLElement
          break
        }
        current = current.parentNode
      }

      // For font-size in list items, apply directly to the list item
      if (property === "font-size" && inListItem && listItem) {
        // Apply font size directly to the list item
        listItem.style.fontSize = value
        
        // Update font size state
        const size = parseInt(value)
        if (!isNaN(size)) {
          setFontSize(size)
        }
      } else {
        // Standard approach for non-list items or other properties
        document.execCommand("styleWithCSS", false, "true")
        
        if (property === "color") {
          document.execCommand("foreColor", false, value)
        } else if (property === "font-size") {
          // Create a span with the desired font size
          const span = document.createElement("span")
          span.style.fontSize = value
          
          // Extract content rather than cloning to avoid duplicates
          const content = range.extractContents()
          span.appendChild(content)
          range.insertNode(span)
          
          // Update selection
          range.selectNodeContents(span)
          sel.removeAllRanges()
          sel.addRange(range)
          
          // Update font size state
          const size = parseInt(value)
          if (!isNaN(size)) {
            setFontSize(size)
          }
        }
      }
    } catch (e) {
      console.error(`Error applying ${property}:`, e)
    }
  }

  // Font size handlers with fixed increments
  const increaseFontSize = () => {
    // Use fixed increments to avoid jumps
    const newSize = fontSize + 2
    applyInlineStyle("font-size", `${newSize}px`)
  }

  const decreaseFontSize = () => {
    const newSize = Math.max(10, fontSize - 2)
    applyInlineStyle("font-size", `${newSize}px`)
  }

  // Simple formatting commands
  const applyFormat = (format: string) => {
    const { range, rndElement, rndPosition } = selection
    if (!range) return

    try {
      // Restore selection
      const sel = window.getSelection()
      if (!sel) return

      sel.removeAllRanges()
      sel.addRange(range)

      // Apply format
      document.execCommand("styleWithCSS", false, "true")
      document.execCommand(format, false)

      // Restore RND position
      if (rndElement && rndPosition) {
        rndElement.style.transform = rndPosition.transform
        if (rndPosition.top) rndElement.style.top = rndPosition.top
        if (rndPosition.left) rndElement.style.left = rndPosition.left

        setTimeout(() => {
          if (rndElement) {
            rndElement.style.transform = rndPosition.transform
            if (rndPosition.top) rndElement.style.top = rndPosition.top
            if (rndPosition.left) rndElement.style.left = rndPosition.left
          }
        }, 0)
      }
    } catch (e) {
      console.error(`Error applying format ${format}:`, e)
    }
  }

  if (!visible) return null

  return createPortal(
    <div
      ref={toolbarRef}
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#fff",
        border: "1px solid #ccc",
        padding: "6px 10px",
        borderRadius: "6px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        display: "flex",
        gap: "6px",
        zIndex: 9999,
        alignItems: "center",
        fontFamily: "Arial",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button style={btn} onClick={() => applyFormat("bold")}>
        <strong>B</strong>
      </button>
      <button style={btn} onClick={() => applyFormat("italic")}>
        <em>I</em>
      </button>
      <button style={btn} onClick={() => applyFormat("underline")}>
        <u>U</u>
      </button>

      <button style={btn} onClick={decreaseFontSize}>
        −
      </button>
      <span style={fontLabel}>{fontSize}px</span>
      <button style={btn} onClick={increaseFontSize}>
        +
      </button>

      <input
        type="color"
        onChange={(e) => applyInlineStyle("color", e.target.value)}
        style={{ width: "24px", height: "24px", border: "none", cursor: "pointer" }}
        title="Text color"
      />

      <button style={btn} onClick={() => applyFormat("insertUnorderedList")}>
        •
      </button>
      <button style={btn} onClick={() => applyFormat("insertOrderedList")}>
        1.
      </button>

      <button style={btn} onClick={() => applyFormat("justifyLeft")}>
        ↤
      </button>
      <button style={btn} onClick={() => applyFormat("justifyCenter")}>
        ↔
      </button>
      <button style={btn} onClick={() => applyFormat("justifyRight")}>
        ↦
      </button>

      <button style={btn} onClick={onClose}>
        ✕
      </button>
    </div>,
    document.body,
  )
}

const btn: React.CSSProperties = {
  border: "none",
  background: "transparent",
  fontSize: "14px",
  cursor: "pointer",
  padding: "4px 6px",
  color: "#333",
}

const fontLabel: React.CSSProperties = {
  minWidth: "38px",
  textAlign: "center",
  fontWeight: "bold",
  color: "#222",
  fontSize: "14px",
}

