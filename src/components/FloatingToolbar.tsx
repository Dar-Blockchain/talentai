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
  onFontSizeChange?: (fontSize?: number) => void
}

export default function FloatingToolbar({ visible, onClose, onRegenerateSelection, sectionType, onFontSizeChange }: Props) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState(10)
  // Store the last set font size to persist between sessions
  const lastSetFontSizeRef = useRef<number>(10);
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

        // Find RND container - keep this for positioning
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

        // Store selection data - simplified
        setSelection({
          range,
          rndElement,
          rndPosition,
        })

        // Simplified font size detection
        try {
          let detectedSize = 10; // Default fallback
          
          if (!range.collapsed) {
            // We have selected text - analyze elements in their original context
            const fontSizes: number[] = [];
            
            // Create a TreeWalker to examine the actual selection in the document
            const walker = document.createTreeWalker(
              range.commonAncestorContainer,
              NodeFilter.SHOW_TEXT,
              {
                acceptNode: function(node) {
                  // Only accept nodes that are actually within our selection range
                  if (range.intersectsNode(node)) {
                    return NodeFilter.FILTER_ACCEPT;
                  }
                  return NodeFilter.FILTER_SKIP;
                }
              }
            );
            
            let node = walker.nextNode();
            while (node) {
              const parent = node.parentElement;
              if (parent) {
                // Check the actual computed style in the document context
                const computedStyle = window.getComputedStyle(parent);
                const fontSize = parseInt(computedStyle.fontSize);
                if (!isNaN(fontSize)) {
                  fontSizes.push(fontSize);
                  console.log('Found font size:', fontSize, 'on element:', parent.tagName, parent.className);
                }
              }
              node = walker.nextNode();
            }
            
            // If we found font sizes, use the most common one
            if (fontSizes.length > 0) {
              const sizeCount = fontSizes.reduce((acc, size) => {
                acc[size] = (acc[size] || 0) + 1;
                return acc;
              }, {} as Record<number, number>);
              
              let maxCount = 0;
              for (const [sizeStr, count] of Object.entries(sizeCount)) {
                const size = parseInt(sizeStr);
                if (count > maxCount) {
                  maxCount = count;
                  detectedSize = size;
                }
              }
              
              console.log('Detected font sizes:', fontSizes, 'chose:', detectedSize);
            } else {
              // Fallback: check if we're inside a span with our custom class
              let currentNode: Node | null = range.startContainer;
              while (currentNode && currentNode !== document.body) {
                if (currentNode instanceof HTMLElement && currentNode.className.includes('font-size-')) {
                  const computedStyle = window.getComputedStyle(currentNode);
                  const fontSize = parseInt(computedStyle.fontSize);
                  if (!isNaN(fontSize)) {
                    detectedSize = fontSize;
                    console.log('Found font size from custom class:', fontSize);
                    break;
                  }
                }
                currentNode = currentNode.parentNode;
              }
            }
          } else {
            // No selection - check cursor position in document context
            const node = sel.focusNode;
            let parent = node?.parentElement;
            
            while (parent && parent !== document.body) {
              // First check for our custom font-size classes
              if (parent.className && parent.className.includes('font-size-')) {
                const computedSize = parseInt(window.getComputedStyle(parent).fontSize);
                if (!isNaN(computedSize) && computedSize !== 10) {
                  detectedSize = computedSize;
                  console.log('Found cursor font size from custom class:', computedSize);
                  break;
                }
              }
              
              // Then check computed style
              const computedSize = parseInt(window.getComputedStyle(parent).fontSize);
              if (!isNaN(computedSize) && computedSize !== 10) {
                detectedSize = computedSize;
                console.log('Found cursor font size from computed style:', computedSize);
                break;
              }
              parent = parent.parentElement;
            }
          }
          
          setFontSize(detectedSize);
          console.log('Final detected font size:', detectedSize);
          
        } catch (e) {
          console.error("Error detecting font size:", e);
          setFontSize(10);
        }
      }
    }
  }, [visible])

  // Direct CSS injection approach
  const applyInlineStyle = (property: string, value: string) => {
    try {
      // Get current selection - don't rely on stored selection
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return

      // Apply color directly
      if (property === "color") {
         document.execCommand("styleWithCSS", false, "true")
         document.execCommand("foreColor", false, value)
         return
      }
      
      // Apply style directly for font-size - IMPROVED to handle complex HTML
      if (property === "font-size") {
        const size = parseInt(value, 10);
        if (isNaN(size)) return;
        
        // Update the size in toolbar and store as last set size
        setFontSize(size);
        lastSetFontSizeRef.current = size;
        
        const range = sel.getRangeAt(0);
        
        if (!range.collapsed) {
          // We have selected text - wrap it directly
          try {
            console.log('Applying font size to selected text:', size);
            
            // Get the selected content
            const contents = range.extractContents();
            
            // Create a span with our font size using maximum specificity
            const span = document.createElement('span');
            const className = `font-size-${size}-${Date.now()}`;
            span.className = className;
            span.appendChild(contents);
            
            // Inject high-specificity CSS into the document head
            const styleElement = document.createElement('style');
            styleElement.textContent = `
              .${className} {
                font-size: ${size}px !important;
                line-height: normal !important;
              }
              .contentEditable .${className},
              .editable .${className},
              .sectionBox .${className} {
                font-size: ${size}px !important;
                line-height: normal !important;
              }
            `;
            document.head.appendChild(styleElement);
            
            // Insert the span at the selection point
            range.insertNode(span);
            
            // Log what we created
            console.log('Created span:', span);
            console.log('Span HTML:', span.outerHTML);
            console.log('Computed font size:', window.getComputedStyle(span).fontSize);
            
            // Select the newly created span content
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            sel.removeAllRanges();
            sel.addRange(newRange);
            
            console.log('Successfully applied font size:', size);
            
            } catch (e) {
            console.error('Error applying font size to selection:', e);
          }
        } else {
          // No selection - insert a span for typing
          console.log('No selection, applying font size at cursor:', size);
          try {
            const span = document.createElement('span');
            const className = `font-size-${size}-${Date.now()}`;
            span.className = className;
            span.appendChild(document.createTextNode('\u200B')); // Zero-width space
            
            // Inject high-specificity CSS
            const styleElement = document.createElement('style');
            styleElement.textContent = `
              .${className} {
                font-size: ${size}px !important;
                line-height: normal !important;
              }
              .contentEditable .${className},
              .editable .${className},
              .sectionBox .${className} {
                font-size: ${size}px !important;
                line-height: normal !important;
              }
            `;
            document.head.appendChild(styleElement);
            
            range.insertNode(span);
            
            // Position cursor inside the span
            const newRange = document.createRange();
            newRange.setStart(span.firstChild!, 1);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            
          } catch (e) {
            console.error('Error applying font size at cursor:', e);
          }
        }
        
        return;
      }
    } catch (e) {
      console.error(`Error applying ${property}:`, e)
    }
  }

  // Font size handlers with fixed increments
  const increaseFontSize = () => {
    // Use fixed increments to avoid jumps
    const newSize = fontSize + 2
    console.log('Increasing font size from', fontSize, 'to', newSize);
    applyInlineStyle("font-size", `${newSize}px`)
    
    // DON'T trigger container resize for text-only font changes
    // Container should only resize when entire section font size changes, not selected text
  }

  const decreaseFontSize = () => {
    const newSize = Math.max(10, fontSize - 2)
    console.log('Decreasing font size from', fontSize, 'to', newSize);
    applyInlineStyle("font-size", `${newSize}px`)
    
    // DON'T trigger container resize for text-only font changes
    // Container should only resize when entire section font size changes, not selected text
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

