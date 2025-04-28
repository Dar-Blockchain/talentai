"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { CircularProgress } from '@mui/material';
import { useSession } from "next-auth/react";

type Props = {
  visible: boolean
  onClose: () => void
  onRegenerateSelection?: (selectedText: string, callback: (regeneratedText: string) => void) => void
}

export default function FloatingToolbar({ visible, onClose, onRegenerateSelection }: Props) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState(16)
  // Store the last set font size to persist between sessions
  const lastSetFontSizeRef = useRef<number>(16);
  const { data: session } = useSession();
  
  const [selection, setSelection] = useState<{
    range: Range | null
    rndElement: HTMLElement | null
    rndPosition: { transform: string; top: string; left: string } | null
  }>({
    range: null,
    rndElement: null,
    rndPosition: null,
  })

  // Add state for regeneration
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Handle custom font size update events from SectionRenderer
  useEffect(() => {
    const handleFontSizeUpdate = (e: Event) => {
      if (e instanceof CustomEvent && e.detail) {
        // Check if this is a reset request first
        if (e.detail.reset) {
          // Reset the font size state but don't set -1 as the actual value
          // This ensures we'll use the detected value from the next event
          return;
        }
        
        // Only update if we have a valid font size
        if (e.detail.fontSize && e.detail.fontSize > 0) {
          setFontSize(e.detail.fontSize);
        }
      }
    };
    
    // Add event listener
    document.addEventListener('update-font-size', handleFontSizeUpdate);
    
    // Cleanup
    return () => {
      document.removeEventListener('update-font-size', handleFontSizeUpdate);
    };
  }, []);

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
          // If we've used a specific font size previously, prefer that
          if (lastSetFontSizeRef.current > 16) {
            setFontSize(lastSetFontSizeRef.current);
            return;
          }
          
          // Get selection's parent element
          const node = sel.focusNode?.parentElement;
          if (node) {
            const computedSize = Number.parseInt(window.getComputedStyle(node).fontSize);
            if (!isNaN(computedSize)) {
              setFontSize(computedSize);
            }
          }
        } catch (e) {
          console.error("Error detecting font size:", e);
        }
      }
    }
  }, [visible])

  // Direct CSS injection approach
  const applyInlineStyle = (property: string, value: string) => {
    const { range, rndElement, rndPosition } = selection
    if (!range) return

    try {
      // Restore selection
      const sel = window.getSelection()
      if (!sel) return

      sel.removeAllRanges()
      sel.addRange(range)

      // Apply color directly
      if (property === "color") {
         document.execCommand("styleWithCSS", false, "true")
         document.execCommand("foreColor", false, value)
         return
      }
      
      // Apply style directly for certain properties
      if (property === "font-size") {
        const size = parseInt(value, 10);
        if (isNaN(size)) return;
        
        // Only update the size in toolbar
        setFontSize(size);
        
        // Save selection boundaries before making changes
        const startContainer = range.startContainer;
        const startOffset = range.startOffset;
        const endContainer = range.endContainer;
        const endOffset = range.endOffset;
        
        // Save whether this is a "whole text" selection (to handle double-click case)
        const isFullTextSelection = range.toString().trim() === (startContainer.textContent || "").trim();
        
        // Try to find if there's an ancestor element with a font-size property already
        let containerWithSize = null;
        let node: Node | null = range.startContainer;
        while (node && !containerWithSize) {
          if (node instanceof HTMLElement && 
              (node.style.fontSize || getComputedStyle(node).fontSize !== "16px")) {
            containerWithSize = node;
          }
          node = node.parentNode as Node | null;
        }
        
        // Helper to find parent block element
        const findParentBlock = (node: Node | null): HTMLElement | null => {
          const blockElements = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'];
          while (node && node !== document.body) {
            if (node instanceof HTMLElement && 
                blockElements.includes(node.nodeName)) {
              return node;
            }
            node = node.parentNode as Node | null;
          }
          return null;
        };
        
        if (containerWithSize) {
          // Update existing container with font size
          containerWithSize.style.fontSize = value;
        } else {
          // If we have a text selection, wrap it in a span
          if (!range.collapsed) {
            document.execCommand("styleWithCSS", false, "true");
              
            // First try with fontSize command for best compatibility
            const fontSizeValue = Math.max(1, Math.min(7, Math.round(size/7)));
            document.execCommand("fontSize", false, fontSizeValue.toString());
            
            // Then find all font elements and convert them to spans with exact pixel size
            const fontElements = document.querySelectorAll('font[size]');
            fontElements.forEach(fontEl => {
              if (fontEl instanceof HTMLElement) {
                const newSpan = document.createElement('span');
                newSpan.style.fontSize = `${size}px`;
                
                // Move all children to the new span
                while (fontEl.firstChild) {
                  newSpan.appendChild(fontEl.firstChild);
                }
                
                // Replace the font element with the span
                if (fontEl.parentNode) {
                  fontEl.parentNode.replaceChild(newSpan, fontEl);
                }
              }
            });
          } else {
            // If no selection, try to style the parent paragraph or div
            const parentBlock = findParentBlock(range.startContainer);
            if (parentBlock) {
              parentBlock.style.fontSize = value;
            } else {
              // Last resort - try execCommand
              document.execCommand("styleWithCSS", false, "true");
              document.execCommand("fontSize", false, Math.round(size/7).toString());
            }
          }
        }
        
        // Try to restore selection after DOM changes
        try {
          // Need a new range since the DOM was modified
          const newRange = document.createRange();
          
          // For double-clicked text selection (whole words/elements), try to reselect everything
          if (isFullTextSelection && startContainer.parentNode) {
            // Try to find text nodes within the same parent element
            const parent = startContainer.parentNode;
            let textContent = '';
            let firstTextNode: Node | null = null;
            let lastTextNode: Node | null = null;
            
            // Find all text nodes in this element to reselect
            const processNode = (node: Node) => {
              if (node.nodeType === Node.TEXT_NODE) {
                if (!firstTextNode) firstTextNode = node;
                lastTextNode = node;
                textContent += node.textContent || '';
              } else if (node.childNodes) {
                Array.from(node.childNodes).forEach(processNode);
              }
            };
            
            if (parent.childNodes.length > 0) {
              Array.from(parent.childNodes).forEach(processNode);
            }
            
            // If we found text nodes, select them all
            if (firstTextNode && lastTextNode) {
              newRange.setStart(firstTextNode, 0);
              const textNodeContent = (lastTextNode as Text).textContent || '';
              newRange.setEnd(lastTextNode, textNodeContent.length);
              
              // Apply the selection
              sel.removeAllRanges();
              sel.addRange(newRange);
            }
          } else {
            // Normal selection - try to restore based on saved positions
            try {
              newRange.setStart(startContainer, startOffset);
              newRange.setEnd(endContainer, endOffset);
              sel.removeAllRanges();
              sel.addRange(newRange);
            } catch (e) {
              console.log("Could not restore exact selection:", e);
            }
          }
          
          // Save the new selection range for future operations
          if (sel.rangeCount > 0) {
            setSelection({
              ...selection,
              range: sel.getRangeAt(0).cloneRange()
            });
          }
        } catch (err) {
          console.log("Error restoring selection:", err);
        }
        
        // Update toolbar display
        setFontSize(size);
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
          if (rndElement && rndPosition) {
            requestAnimationFrame(() => {
              rndElement.style.transform = rndPosition.transform;
              if (rndPosition.top) rndElement.style.top = rndPosition.top;
              if (rndPosition.left) rndElement.style.left = rndPosition.left;
            });
          }
        }, 50);
      
      }
    } catch (e) {
      console.error(`Error applying format ${format}:`, e)
    }
  }

  // Add function to handle text regeneration
  const handleRegenerateClick = () => {
    if (!onRegenerateSelection) return;
    
    const { range } = selection;
    if (!range) return;
    
    try {
      // Get the selected text
      const selectedText = range.toString();
      if (!selectedText || selectedText.trim() === '') return;
      
      setIsRegenerating(true);
      
      // Call the parent regenerate function and provide a callback
      onRegenerateSelection(selectedText, (regeneratedText) => {
        try {
          // Restore selection
          const sel = window.getSelection();
          if (!sel) return;
          
          sel.removeAllRanges();
          sel.addRange(range);
          
          // Delete the current selection
          document.execCommand('delete');
          
          // Insert the regenerated text
          document.execCommand('insertHTML', false, regeneratedText);
          
          setIsRegenerating(false);
        } catch (err) {
          console.error('Error replacing text:', err);
          setIsRegenerating(false);
        }
      });
    } catch (err) {
      console.error('Error regenerating text:', err);
      setIsRegenerating(false);
    }
  };

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

      <button 
        style={{...btn, display: onRegenerateSelection ? 'flex' : 'none', alignItems: 'center'}} 
        onClick={handleRegenerateClick}
        disabled={isRegenerating || !session?.accessToken}
        title="Regenerate with AI"
      >
        {isRegenerating ? (
          <CircularProgress size={14} color="inherit" />
        ) : (
          <AutoFixHighIcon style={{ fontSize: '16px' }} />
        )}
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

