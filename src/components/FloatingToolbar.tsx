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
  sectionType?: string
  onFontSizeChange?: () => void
}

export default function FloatingToolbar({ visible, onClose, onRegenerateSelection, sectionType, onFontSizeChange }: Props) {
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
        
        // Update the size in toolbar and store as last set size
        setFontSize(size);
        lastSetFontSizeRef.current = size;
        
        // Save selection boundaries before making changes
        const startContainer = range.startContainer;
        const startOffset = range.startOffset;
        const endContainer = range.endContainer;
        const endOffset = range.endOffset;
        
        // Check if this is a triple-click selection
        // @ts-ignore
        const isTripleClick = window.__isTripleClickSelection === true;
        // @ts-ignore
        const tripleClickData = window.__tripleClickSelection;
        
        // Find the containing RND element that controls the section size
        let rndContainer = null;
        let currentNode: Node | null = range.commonAncestorContainer;
        while (currentNode && currentNode !== document.body) {
          if (currentNode instanceof HTMLElement && 
              currentNode.hasAttribute && 
              currentNode.hasAttribute('data-rnd')) {
            rndContainer = currentNode;
            break;
          }
          currentNode = currentNode.parentNode;
        }
        
        // If we found the RND container, find the section-id
        let sectionId = '';
        if (rndContainer && rndContainer instanceof HTMLElement) {
          sectionId = rndContainer.getAttribute('data-section-id') || '';
        }
        
        // Dispatch custom event for the section renderer to handle
        // This allows the section to resize proportionally with font changes
        const fontSizeEvent = new CustomEvent('font-size-changed', {
          detail: {
            fontSize: size,
            sectionId: sectionId
          }
        });
        document.dispatchEvent(fontSizeEvent);

        if (isTripleClick && tripleClickData) {
          // For triple-click, use the saved container to apply style
          try {
            const container = tripleClickData.container;
            if (container instanceof HTMLElement) {
              // Apply exact pixel size with !important to override any inherited styles
              container.style.cssText += `; font-size: ${size}px !important;`;
              
              // Restore the selection from our saved data
              const newRange = document.createRange();
              newRange.setStart(tripleClickData.startContainer, tripleClickData.startOffset);
              newRange.setEnd(tripleClickData.endContainer, tripleClickData.endOffset);
              
              const sel = window.getSelection();
              if (sel) {
                sel.removeAllRanges();
                sel.addRange(newRange);
                
                // Update our stored range
                if (sel.rangeCount > 0) {
                  setSelection({
                    ...selection,
                    range: sel.getRangeAt(0).cloneRange()
                  });
                }
              }
              return;
            }
          } catch (e) {
            console.error("Error handling triple-click font size:", e);
            // Continue with standard handling if triple-click special handling fails
          }
        }
        
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
          // Update existing container with font size - use exact pixels with !important
          containerWithSize.style.cssText += `; font-size: ${size}px !important;`;
        } else {
          // If we have a text selection, wrap it in a span
          if (!range.collapsed) {
            document.execCommand("styleWithCSS", false, "true");
              
            // Create a temporary unique class name for this operation
            const tempClassName = `fontSize-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            
            // First try with insert HTML command for best results
            try {
              // Get HTML content of selection
              const fragment = range.cloneContents();
              const tempDiv = document.createElement('div');
              tempDiv.appendChild(fragment);
              
              // Create a span with the specific font size
              const wrappedContent = `<span class="${tempClassName}" style="font-size: ${size}px !important;">${tempDiv.innerHTML}</span>`;
              
              // Delete the selection and insert our styled content
              document.execCommand('delete', false);
              document.execCommand('insertHTML', false, wrappedContent);
              
              // Force the new elements to have the exact pixel size
              setTimeout(() => {
                const newElements = document.querySelectorAll(`.${tempClassName}`);
                newElements.forEach(el => {
                  if (el instanceof HTMLElement) {
                    el.style.cssText += `; font-size: ${size}px !important;`;
                    el.classList.remove(tempClassName);
                  }
                });
              }, 0);
            } catch (e) {
              console.error('Error inserting formatted HTML:', e);
              
              // Fallback to execCommand fontSize if insertHTML fails
              document.execCommand("styleWithCSS", false, "true");
              const fontSizeValue = Math.max(1, Math.min(7, Math.round(size/7)));
              document.execCommand("fontSize", false, fontSizeValue.toString());
              
              // Then find all font elements and convert them to spans with exact pixel size
              const fontElements = document.querySelectorAll('font[size]');
              fontElements.forEach(fontEl => {
                if (fontEl instanceof HTMLElement) {
                  const newSpan = document.createElement('span');
                  newSpan.style.cssText = `font-size: ${size}px !important;`;
                  
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
            }
          } else {
            // If no selection, try to style the parent paragraph or div
            const parentBlock = findParentBlock(range.startContainer);
            if (parentBlock) {
              parentBlock.style.cssText += `; font-size: ${size}px !important;`;
            } else {
              // Last resort - try execCommand
              document.execCommand("styleWithCSS", false, "true");
              document.execCommand("fontSize", false, Math.round(size/7).toString());
              
              // Find and fix any font elements created
              const fontElements = document.querySelectorAll('font[size]');
              fontElements.forEach(fontEl => {
                if (fontEl instanceof HTMLElement) {
                  fontEl.style.cssText += `; font-size: ${size}px !important;`;
                }
              });
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
        document.dispatchEvent(new CustomEvent('font-size-changed'));
        // Notify parent to resize border
        if (typeof onFontSizeChange === 'function') {
          console.log('Calling onFontSizeChange from FloatingToolbar');
          onFontSizeChange();
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

      // Handle list commands differently to avoid styleWithCSS interference
      if (format === 'insertUnorderedList' || format === 'insertOrderedList') {
        document.execCommand(format, false, "");
        
        // Update RND position if needed
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
        
        // Immediately update stored range
        if (sel.rangeCount > 0) {
          setSelection({
            ...selection,
            range: sel.getRangeAt(0).cloneRange()
          });
        }
        return;
      }

      // Apply format for non-list commands
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
      
      // Re-store the new selection
      if (sel.rangeCount > 0) {
        setSelection({
          ...selection,
          range: sel.getRangeAt(0).cloneRange()
        });
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
        background: "#FFFFFF",
        border: "none",
        padding: "8px 12px",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        display: "flex",
        gap: "4px",
        zIndex: 9999,
        alignItems: "center",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        transition: "all 0.2s ease-in-out",
        backdropFilter: "blur(10px)",
        opacity: 0.97
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div style={{ display: 'flex', gap: '2px', borderRight: '1px solid #f0f0f0', paddingRight: '8px', marginRight: '4px' }}>
        <IconButton onClick={() => applyFormat("bold")} title="Bold">
          <strong>B</strong>
        </IconButton>
        <IconButton onClick={() => applyFormat("italic")} title="Italic">
          <em>I</em>
        </IconButton>
        <IconButton onClick={() => applyFormat("underline")} title="Underline">
          <u>U</u>
        </IconButton>
      </div>

      <div style={{ display: 'flex', gap: '2px', borderRight: '1px solid #f0f0f0', paddingRight: '8px', marginRight: '4px', alignItems: 'center' }}>
        <IconButton onClick={decreaseFontSize} title="Decrease font size">
          <span style={{ fontWeight: 'bold' }}>−</span>
        </IconButton>
        <span style={{
          minWidth: "42px",
          textAlign: "center",
          fontWeight: "500",
          color: "#333",
          fontSize: "13px",
          padding: "0 4px"
        }}>{fontSize}px</span>
        <IconButton onClick={increaseFontSize} title="Increase font size">
          <span style={{ fontWeight: 'bold' }}>+</span>
        </IconButton>
      </div>

      <div style={{ display: 'flex', gap: '2px', borderRight: '1px solid #f0f0f0', paddingRight: '8px', marginRight: '4px' }}>
        <input
          type="color"
          onChange={(e) => applyInlineStyle("color", e.target.value)}
          style={{ 
            width: "24px", 
            height: "24px", 
            border: "none", 
            cursor: "pointer", 
            background: "none",
            padding: "2px",
            borderRadius: "4px"
          }}
          title="Text color"
        />
      </div>

      <div style={{ display: 'flex', gap: '2px', borderRight: '1px solid #f0f0f0', paddingRight: '8px', marginRight: '4px' }}>
        <IconButton onClick={() => applyFormat("insertUnorderedList")} title="Bullet list">
          <span style={{ fontSize: '14px' }}>•</span>
        </IconButton>
        <IconButton onClick={() => applyFormat("insertOrderedList")} title="Numbered list">
          <span style={{ fontSize: '14px' }}>1.</span>
        </IconButton>
      </div>

      <div style={{ display: 'flex', gap: '2px', borderRight: onRegenerateSelection ? '1px solid #f0f0f0' : 'none', paddingRight: onRegenerateSelection ? '8px' : '0', marginRight: onRegenerateSelection ? '4px' : '0' }}>
        <IconButton onClick={() => applyFormat("justifyLeft")} title="Align left">
          <span style={{ fontSize: '14px' }}>↤</span>
        </IconButton>
        <IconButton onClick={() => applyFormat("justifyCenter")} title="Align center">
          <span style={{ fontSize: '14px' }}>↔</span>
        </IconButton>
        <IconButton onClick={() => applyFormat("justifyRight")} title="Align right">
          <span style={{ fontSize: '14px' }}>↦</span>
        </IconButton>
      </div>

      {onRegenerateSelection && (
        <IconButton 
          onClick={handleRegenerateClick}
          disabled={isRegenerating || sectionType === 'skills'}
          title="Regenerate with AI"
          style={{ 
            color: isRegenerating || sectionType === 'skills' ? '#ccc' : '#3662E3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isRegenerating ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <AutoFixHighIcon style={{ fontSize: '16px' }} />
          )}
        </IconButton>
      )}

      <IconButton onClick={onClose} title="Close toolbar" style={{ marginLeft: '4px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>✕</span>
      </IconButton>
    </div>,
    document.body,
  )
}

// Styled button component for the toolbar
const IconButton = ({ 
  onClick, 
  children, 
  disabled = false, 
  title = '', 
  style = {} 
}: { 
  onClick: () => void; 
  children: React.ReactNode; 
  disabled?: boolean; 
  title?: string;
  style?: React.CSSProperties;
}) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      border: "none",
      background: "transparent",
      fontSize: "14px",
      cursor: disabled ? "not-allowed" : "pointer",
      padding: "5px 8px",
      color: disabled ? "#ccc" : "#333",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.1s ease",
      opacity: disabled ? 0.5 : 1,
      ...style
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.background = "#f5f5f5";
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
    }}
  >
    {children}
  </button>
);

const fontLabel: React.CSSProperties = {
  minWidth: "38px",
  textAlign: "center",
  fontWeight: "bold",
  color: "#222",
  fontSize: "14px",
}

