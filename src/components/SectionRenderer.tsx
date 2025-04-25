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
  ImageSection,
  LineSection,
  SectionType,
} from "@/models/sectionTypes"
import styles from "@/styles/ResumeBuilder.module.css"
import DeleteIcon from "@mui/icons-material/Delete"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import IconButton from "@mui/material/IconButton"
import FloatingToolbar from "@/components/FloatingToolbar"
import { useRef, useState, useLayoutEffect, useEffect } from "react"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent" 
import DialogTitle from "@mui/material/DialogTitle"
import ImageUploader from "@/components/ImageUploader"
import LineEditor from "./LineEditor"

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

  // Add a style tag for edit mode functionality
  useEffect(() => {
    // Add a style tag if it doesn't exist
    if (!document.getElementById('section-edit-styles')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'section-edit-styles';
      styleTag.innerHTML = `
        /* Make the entire section respond to click/double-click */
        .rnd-resizable-handle {
          z-index: 12 !important; /* Keep resize handle on top */
        }
        
        /* Only allow text selection in edit mode */
        [data-section-content="true"]:not(.edit-mode) * {
          user-select: none !important;
        }
        
        /* Make sure the entire section is clickable */
        .hoverable-section {
          cursor: pointer;
        }
      `;
      document.head.appendChild(styleTag);
    }
  }, []);

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
    boxSizing: "border-box",
    margin: 0
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
      case "image":
        const img = section as ImageSection
        return img.src 
          ? img.isRound 
            ? `<div style="width: 160px; height: 160px; margin: 0 auto; border-radius: 50%; overflow: hidden;"><img src="${img.src}" alt="${img.alt || ''}" style="width: 100%; height: 100%; object-fit: cover;"></div>`
            : `<img src="${img.src}" alt="${img.alt || ''}" style="max-width:100%; height:auto;">`
          : '<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; background:#f0f0f0; border:1px dashed #ccc;">Double-click to upload image</div>'
      case "line":
        const line = section as LineSection;
        const orientation = line.orientation || 'horizontal';
        const thickness = line.thickness || 2;
        const color = line.color || '#000000';
        
        // Calculate dimensions based on orientation
        const lineWidth = orientation === 'horizontal' ? '100%' : `${thickness}px`;
        const lineHeight = orientation === 'horizontal' ? `${thickness}px` : '100%';
        
        // Return a div styled as a line
        return `<div style="width: ${lineWidth}; height: ${lineHeight}; background-color: ${color}; margin: 0 auto;"></div>`;
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
    
    // Reset transform to measure true content size before applying scaling
    editableRef.current.style.transform = 'none';
    
    // Apply scaling after a brief timeout to allow the DOM to update
    setTimeout(() => {
      if (editableRef.current) {
        scaleContentToFit(editableRef, width, autoHeight);
      }
    }, 50);
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
      // Reset any scaling transformations during edit mode
      editableRef.current.style.transform = 'none';
      
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
    
    // First show toolbar 
    const rect = sel.getRangeAt(0).getClientRects()[0]
    if (rect) setShowToolbar(true)

    // Enhanced size detection
    tryDetectFontSize(sel);
  }
  
  // Helper to detect and dispatch font size based on selection
  const tryDetectFontSize = (sel: Selection) => {
    try {
      // Force toolbar to update with each new selection
      document.dispatchEvent(new CustomEvent('update-font-size', { 
        detail: { fontSize: -1, reset: true } 
      }));
      
      // For header sections, always use the h2 font size
      if (type === 'header' && editableRef.current) {
        const headerEl = editableRef.current.querySelector('h2') as HTMLElement | null;
        const size = headerEl
          ? parseInt(window.getComputedStyle(headerEl).fontSize, 10)
          : NaN;
        if (!isNaN(size)) {
          document.dispatchEvent(new CustomEvent('update-font-size', { detail: { fontSize: size } }));
          return;
        }
      }
      
      // Get accurate font size from selection
      if (!editableRef.current || !sel.rangeCount) return;

      // Double-click typically selects whole words/lines, so we need special handling
      const range = sel.getRangeAt(0);
      const isDoubleClickSelection = range.toString().trim().includes(" ");

      // Get selected node
      const node = sel.focusNode || sel.anchorNode;
      if (!node) return;
      
      // Special handling for double-clicked selection (whole words/lines)
      if (isDoubleClickSelection) {
        // For double-clicked text, first check if there's a direct span with font-size
        const parentElement = node.parentElement;
        if (parentElement) {
          // Check for spans with explicit font sizes within the selection
          const fontSize = parentElement.style.fontSize;
          if (fontSize) {
            const size = parseInt(fontSize, 10);
            if (!isNaN(size)) {
              document.dispatchEvent(new CustomEvent('update-font-size', { 
                detail: { fontSize: size } 
              }));
              return;
            }
          }
          
          // If no direct style, check computed style
          const computedSize = parseInt(window.getComputedStyle(parentElement).fontSize, 10);
          if (!isNaN(computedSize) && computedSize !== 16) {
            document.dispatchEvent(new CustomEvent('update-font-size', { 
              detail: { fontSize: computedSize } 
            }));
            return;
          }
          
          // If still no luck, look for any styled elements within selection
          const selectedText = range.toString();
          if (selectedText && editableRef.current.innerHTML.includes(selectedText)) {
            // Find elements with explicit font sizes
            const styledElements = Array.from(editableRef.current.querySelectorAll('[style*="font-size"]'));
            for (const el of styledElements) {
              if (el instanceof HTMLElement && el.innerText && selectedText.includes(el.innerText)) {
                const elSize = parseInt(el.style.fontSize, 10);
                if (!isNaN(elSize)) {
                  document.dispatchEvent(new CustomEvent('update-font-size', { 
                    detail: { fontSize: elSize } 
                  }));
                  return;
                }
              }
            }
          }
        }
      }
      
      // Get styles directly from the selection range
      
      // Get direct style, if any
      // First, check if we already have spans with specific font-size
      if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
        const parent = node.parentElement;
        // Check for direct inline style on parent element
        if (parent.style.fontSize) {
          const inlineSize = parseInt(parent.style.fontSize, 10);
          if (!isNaN(inlineSize)) {
            document.dispatchEvent(new CustomEvent('update-font-size', { 
              detail: { fontSize: inlineSize } 
            }));
            return;
          }
        }
        
        // Check specific computed style
        const computedStyle = window.getComputedStyle(parent);
        const computedSize = parseInt(computedStyle.fontSize, 10);
        if (!isNaN(computedSize) && computedSize !== 16) {
          document.dispatchEvent(new CustomEvent('update-font-size', { 
            detail: { fontSize: computedSize } 
          }));
          return;
        }
      }
      
      // If we got here, look for any font size in the selection text
      const selectionText = range.toString().trim();
      if (selectionText && editableRef.current.innerHTML.includes(selectionText)) {
        // This is likely a double-click selection - look for all elements containing this text
        const allElements = Array.from(editableRef.current.querySelectorAll('*'));
        const matchingElements = allElements.filter(el => 
          el.textContent && el.textContent.includes(selectionText)
        );
        
        // Find element with non-default font size
        for (const el of matchingElements) {
          if (el instanceof HTMLElement) {
            // Check explicit style first
            if (el.style.fontSize) {
              const size = parseInt(el.style.fontSize, 10);
              if (!isNaN(size)) {
                document.dispatchEvent(new CustomEvent('update-font-size', { 
                  detail: { fontSize: size } 
                }));
                return;
              }
            }
            
            // Then check computed style
            const size = parseInt(window.getComputedStyle(el).fontSize, 10);
            if (!isNaN(size) && size !== 16) {
              document.dispatchEvent(new CustomEvent('update-font-size', { 
                detail: { fontSize: size } 
              }));
              return;
            }
          }
        }
      }
      
      // If we got here, fall back to default size from container
      const defaultSize = parseInt(
        window.getComputedStyle(editableRef.current).fontSize, 
        10
      );
      if (!isNaN(defaultSize)) {
        document.dispatchEvent(new CustomEvent('update-font-size', { 
          detail: { fontSize: defaultSize } 
        }));
      }
    } catch (err) {
      console.error('Error detecting font size:', err);
    }
  };

  // Handle dragging in real-time
  const handleDrag = (_: any, d: { x: number; y: number }) => {
    // Keep content scaled appropriately during drag
    if (editableRef.current) {
      scaleContentToFit(editableRef, width, autoHeight);
    }
  };

  const handleDragStop = (_: any, d: { x: number; y: number }) => {
    console.log('Drag stopped at:', d.x, d.y);
    // Make sure we use the new position coordinates
    updatePosition(id, { 
      x: d.x, 
      y: d.y, 
      width, 
      height: autoHeight 
    });
    
    // Make sure content is properly scaled after dragging
    if (editableRef.current) {
      scaleContentToFit(editableRef, width, autoHeight);
    }
  }

  // Improve the scaling function to always apply appropriate scaling
  const scaleContentToFit = (contentRef: any, containerWidth: number, containerHeight: number) => {
    if (!contentRef.current) return;
    
    // Only apply scaling when not in edit mode
    if (isEditing) {
      contentRef.current.style.transform = 'none';
      contentRef.current.style.transformOrigin = 'top left';
      return;
    }
    
    // Reset any previous transforms to measure true size
    const originalTransform = contentRef.current.style.transform;
    contentRef.current.style.transform = 'none';
    
    // Get the natural size of the content
    const contentWidth = contentRef.current.scrollWidth;
    const contentHeight = contentRef.current.scrollHeight;
    
    // Calculate scale factors to fit content in container
    // Account for padding (8px on each side) and potential borders (1px on each side)
    const widthScale = Math.min(1, (containerWidth - 18) / contentWidth);
    const heightScale = Math.min(1, (containerHeight - 18) / contentHeight);
    
    // Use the smaller scale to ensure content fits in both dimensions
    const scale = Math.min(widthScale, heightScale);
    
    // Always apply the transform to ensure proper scaling in all cases
    contentRef.current.style.transform = `scale(${scale})`;
    contentRef.current.style.transformOrigin = 'top left';
  };
  
  // Handle real-time resize
  const handleResize = (
    _: any,
    __: any,
    ref: any,
    ___: any,
    pos: { x: number; y: number }
  ) => {
    const newH = parseInt(ref.style.height);
    const newW = parseInt(ref.style.width);
    
    // Apply scaling in real-time during resize
    if (editableRef.current) {
      scaleContentToFit(editableRef, newW, newH);
    }
  };
  
  // Keep the handleResizeStop for final position updates
  const handleResizeStop = (
    _: any,
    __: any,
    ref: any,
    ___: any,
    pos: { x: number; y: number }
  ) => {
    const newH = parseInt(ref.style.height);
    const newW = parseInt(ref.style.width);
    setAutoHeight(newH);
    updatePosition(id, { x: pos.x, y: pos.y, width: newW, height: newH });
    
    // Apply final scaling
    scaleContentToFit(editableRef, newW, newH);
  }

  // Apply scaling when the component mounts or updates
  useEffect(() => {
    if (editableRef.current) {
      scaleContentToFit(editableRef, width, autoHeight);
    }
  }, [width, autoHeight]);

  // Make sure header sections always have explicit font-size
  useEffect(() => {
    if (type === "header" && editableRef.current) {
      const h2Element = editableRef.current.querySelector('h2');
      if (h2Element && h2Element instanceof HTMLElement && !h2Element.style.fontSize) {
        h2Element.style.fontSize = '30px';
        h2Element.style.color = 'blue';
      }
    }
  }, [type]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (type === "skills" && isEditing) e.preventDefault()
  }
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (type === "skills" && isEditing) e.preventDefault()
  }

  // Store font size detected on double-click
  useEffect(() => {
    // Create a global variable to store the font size
    // @ts-ignore
    window.__initialFontSize = 0;
  }, []);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // If this is an image section, show the image uploader dialog
    if (type === "image") {
      setShowImageUploader(true)
      return
    }
    
    // If this is a line section, show the line editor dialog
    if (type === "line") {
      setShowLineEditor(true)
      return
    }
    
    // Special handling for header section to ensure font size is preserved
    if (type === "header" && !isEditing) {
      // Find h2 element with the blue text
      const headerElement = containerRef.current?.querySelector('h2');
      
      // If we found the header element and it has a computed style
      if (headerElement && headerElement instanceof HTMLElement) {
        // Ensure the header has explicit font-size style
        if (!headerElement.style.fontSize) {
          headerElement.style.fontSize = '30px';
        }
        
        // Also set color explicitly if not already set
        if (!headerElement.style.color) {
          headerElement.style.color = 'blue';
        }
        
        // Always use 30px for header sections to be consistent
        const event = new CustomEvent('update-font-size', { 
          detail: { fontSize: 30 }
        });
        document.dispatchEvent(event);
      }
    }
    
    // For all other section types, enter edit mode
    setIsEditing(true)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isEditing) {
      onClick()
    }
  }

  // Add state for dialogs
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showLineEditor, setShowLineEditor] = useState(false);

  // Handle image upload
  const handleImageSelected = (imageData: string, isRound: boolean) => {
    const imgSection = section as ImageSection;
    
    // Create HTML content with proper round image handling if needed
    const imgContent = isRound
      ? `<div style="width: 160px; height: 160px; margin: 0 auto; border-radius: 50%; overflow: hidden;"><img src="${imageData}" alt="${imgSection.alt || ''}" style="width: 100%; height: 100%; object-fit: cover;"></div>`
      : `<img src="${imageData}" alt="${imgSection.alt || ''}" style="max-width:100%; height:auto;">`;
    
    // Update the section content
    updateContent(id, imgContent);
    
    // Adjust container size for round images
    if (isRound) {
      updatePosition(id, { x, y, width: 200, height: 200 });
    }
    
    setShowImageUploader(false);
  }

  // Handle line properties change
  const handleLinePropertiesChange = (properties: { orientation: 'horizontal' | 'vertical', thickness: number, color: string }) => {
    const line = section as LineSection;
    const { orientation, thickness, color } = properties;
    
    // Calculate dimensions based on orientation
    const lineWidth = orientation === 'horizontal' ? '100%' : `${thickness}px`;
    const lineHeight = orientation === 'horizontal' ? `${thickness}px` : '100%';
    
    // Create HTML content for the line
    const lineContent = `<div style="width: ${lineWidth}; height: ${lineHeight}; background-color: ${color}; margin: 0 auto;"></div>`;
    
    // Update the section content
    updateContent(id, lineContent);
    
    // Adjust container dimensions based on orientation
    if (orientation === 'horizontal') {
      updatePosition(id, { x, y, width, height: Math.max(thickness + 16, 20) });
    } else {
      updatePosition(id, { x, y, width: Math.max(thickness + 16, 20), height });
    }
    
    setShowLineEditor(false);
  }

  // Custom CSS to handle the hover borders
  useEffect(() => {
    // Add a style tag if it doesn't exist
    if (!document.getElementById('section-hover-styles')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'section-hover-styles';
      styleTag.innerHTML = `
        .hoverable-section {
          transition: border 0.2s ease;
          box-sizing: border-box !important;
        }
        .hoverable-section:hover:not(.active-section) {
          border: 1px solid rgba(224,224,224,0.5) !important;
          border-radius: 4px;
        }
        .active-section {
          border: 1px dashed #00bcd4 !important;
          border-radius: 4px;
        }
        /* Base styling for section content */
        [data-section-content="true"] {
          font-size: 16px;
          box-sizing: border-box !important;
        }
        /* Make sure span elements maintain their size settings */
        [data-section-content="true"] span[style*="font-size"] {
          font-size: unset !important;
        }
        /* Ensure all elements inside sections use border-box */
        .hoverable-section * {
          box-sizing: border-box !important;
        }
      `;
      document.head.appendChild(styleTag);
    }
  }, []);

  return (
    <Rnd
      className={`${styles.sectionWrapper} hoverable-section ${isActive ? 'active-section' : ''}`}
      ref={rndRef}
      bounds="parent"
      disableDragging={isEditing}
      enableResizing={{ top: false, right: false, bottom: true, left: false, topRight: false, bottomRight: true, bottomLeft: false, topLeft: false }}
      size={{ width, height: autoHeight }}
      position={{ x, y }}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      scale={zoomFactor}
      style={{ 
        position: "absolute", 
        backgroundColor: "transparent", 
        zIndex: 10,
        border: "none", // We'll control this with CSS classes instead
        boxSizing: "border-box"
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
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: isEditing ? "text" : "move",
          boxSizing: "border-box",
          overflow: "hidden",
          padding: "0px" // Reset padding to ensure consistent sizing
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!isEditing) onClick();
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isEditing) handleDoubleClick(e);
        }}
        className={isEditing ? "edit-mode" : ""}
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
            ref={editableRef}
            style={sharedEditableStyle}
            dangerouslySetInnerHTML={{ __html: getSectionContent() }} 
          />
        )}
      </div>

      <FloatingToolbar visible={showToolbar} onClose={() => setShowToolbar(false)} />

      {/* Image uploader dialog */}
      <Dialog open={showImageUploader} onClose={() => setShowImageUploader(false)}>
        <DialogTitle>Upload Image</DialogTitle>
        <DialogContent>
          <ImageUploader 
            onImageSelected={handleImageSelected}
            initialImage={(section as ImageSection).src}
          />
        </DialogContent>
      </Dialog>

      {/* Line editor dialog */}
      <Dialog open={showLineEditor} onClose={() => setShowLineEditor(false)}>
        <DialogTitle>Edit Line</DialogTitle>
        <DialogContent>
          <LineEditor 
            onLinePropertiesChange={handleLinePropertiesChange}
            initialOrientation={(section as LineSection).orientation}
            initialThickness={(section as LineSection).thickness}
            initialColor={(section as LineSection).color}
          />
        </DialogContent>
      </Dialog>
    </Rnd>
  )
}