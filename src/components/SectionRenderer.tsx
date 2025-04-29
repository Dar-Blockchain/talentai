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
import { regenerateText } from "@/utils/api"
import { useSession } from "next-auth/react"

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
  const { data: session } = useSession();
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
        const thickness = line.thickness || 3;
        const color = line.color || '#556fb5';
        
        // Create horizontal line with CV style (thin line with margins)
        return `<div style="width:100%;height:${thickness}px;background-color:${color};margin-top:3px;margin-bottom:3px;"></div>`;
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
    
    // Store the current selection in a global variable to restore it later if needed
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      // Store selection information
      const storedSelection = {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
        text: range.toString()
      };
      // @ts-ignore
      window.__lastSelection = storedSelection;
    }
  }
  
  // Helper to restore the previous selection if needed
  const restoreSelection = () => {
    // @ts-ignore
    const lastSelection = window.__lastSelection;
    if (lastSelection && editableRef.current) {
      try {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          const range = document.createRange();
          range.setStart(lastSelection.startContainer, lastSelection.startOffset);
          range.setEnd(lastSelection.endContainer, lastSelection.endOffset);
          selection.addRange(range);
          // Update toolbar position again
          const rect = range.getClientRects()[0];
          if (rect) setShowToolbar(true);
        }
      } catch (e) {
        console.error('Error restoring selection:', e);
      }
        }
      }
      
  // Update tryDetectFontSize to better detect actual pixel sizes
  const tryDetectFontSize = (sel: Selection) => {
    try {
      // Only continue if we have a valid selection
      if (!sel || !sel.rangeCount || sel.isCollapsed || !editableRef.current) return;
      
      const range = sel.getRangeAt(0);
      const selectedNode = range.commonAncestorContainer;

      // Check if this is a triple-click selection
      // @ts-ignore
      const isTripleClick = window.__isTripleClickSelection;
      // @ts-ignore
      const tripleClickData = window.__tripleClickSelection;
      
      // For triple-click selections, use the container element
      if (isTripleClick && tripleClickData && tripleClickData.container) {
        const container = tripleClickData.container;
        if (container instanceof HTMLElement) {
          // Get exact inline style if set
          if (container.style.fontSize) {
            const inlineSize = parseInt(container.style.fontSize, 10);
            if (!isNaN(inlineSize)) {
              document.dispatchEvent(new CustomEvent('update-font-size', { 
                detail: { fontSize: inlineSize } 
              }));
              return;
            }
          }
          
          // Fall back to computed style
          const computedSize = parseInt(window.getComputedStyle(container).fontSize, 10);
          if (!isNaN(computedSize)) {
            document.dispatchEvent(new CustomEvent('update-font-size', { 
              detail: { fontSize: computedSize } 
            }));
            return;
          }
        }
      }
      
      // For normal selections, try to find the specific element with font size
      // Create a temporary span at cursor position to get the exact font size
      const tempSpan = document.createElement('span');
      tempSpan.setAttribute('data-fontsize-probe', 'true');
      tempSpan.style.display = 'inline';
      tempSpan.innerHTML = '&#8203;'; // Zero-width space
      
      const originalRange = range.cloneRange();
      
      // Insert at the start of the selection
      range.collapse(true);
      range.insertNode(tempSpan);
      
      // Get computed font size at the selection point
      const fontSize = parseInt(window.getComputedStyle(tempSpan).fontSize, 10);
      
      // Clean up the temporary span
      if (tempSpan.parentNode) {
        tempSpan.parentNode.removeChild(tempSpan);
        }
        
      // Restore the original selection
      sel.removeAllRanges();
      sel.addRange(originalRange);
      
      // Dispatch the detected font size
      if (!isNaN(fontSize)) {
          document.dispatchEvent(new CustomEvent('update-font-size', { 
          detail: { fontSize: fontSize } 
          }));
          return;
        }
      
      // If direct detection failed, try to get font size from selection's parent element(s)
      let currentNode = selectedNode;
      while (currentNode && currentNode !== editableRef.current) {
        if (currentNode instanceof HTMLElement) {
          // Check for inline style first
          if (currentNode.style.fontSize) {
            const inlineSize = parseInt(currentNode.style.fontSize, 10);
            if (!isNaN(inlineSize)) {
                document.dispatchEvent(new CustomEvent('update-font-size', { 
                detail: { fontSize: inlineSize } 
                }));
                return;
              }
            }
            
            // Then check computed style
          const computedStyle = window.getComputedStyle(currentNode);
          if (computedStyle.fontSize !== '16px') { // Not the default size
            const computedSize = parseInt(computedStyle.fontSize, 10);
            if (!isNaN(computedSize)) {
              document.dispatchEvent(new CustomEvent('update-font-size', { 
                detail: { fontSize: computedSize } 
              }));
              return;
            }
          }
        }
        const parentNode = currentNode.parentNode;
        if (!parentNode) break;
        currentNode = parentNode;
      }
      
      // If we get here, use the default size from the editor
      const defaultSize = parseInt(window.getComputedStyle(editableRef.current).fontSize, 10);
      if (!isNaN(defaultSize)) {
        document.dispatchEvent(new CustomEvent('update-font-size', { 
          detail: { fontSize: defaultSize } 
        }));
      }
    } catch (err) {
      console.error('Error detecting font size:', err);
      // Fallback to a reasonable default
      document.dispatchEvent(new CustomEvent('update-font-size', { 
        detail: { fontSize: 16 } 
      }));
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
  const handleLinePropertiesChange = (properties: { orientation: 'horizontal', thickness: number, color: string }) => {
    const { thickness, color } = properties;
    
    // Store current section position and size
    const currentX = x;
    const currentY = y;
    const currentWidth = width;
    
    // Create HTML content for the line with margins, matching the CV style
    const lineContent = `<div style="width:100%;height:${thickness}px;background-color:${color};margin-top:3px;margin-bottom:3px;"></div>`;
    
    // Update the section content
    updateContent(id, lineContent);
    
    // Adjust height based on thickness plus margins, but keep width the same
    const newHeight = Math.max(thickness + 16, 20);
    
    // Update position and dimensions while keeping the same x,y coordinates
    updatePosition(id, { 
      x: currentX, 
      y: currentY, 
      width: currentWidth, 
      height: newHeight 
    });
    
    // Close the dialog but keep focus on the section
    setShowLineEditor(false);
    
    // Ensure the section stays selected
    onClick();
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
        /* Style for hoverable section content */
        .hoverable-section-content {
          cursor: pointer;
          width: 100% !important;
          height: 100% !important;
          display: block;
          position: relative;
        }
        /* Make sure the entire content area is clickable */
        .hoverable-section-content * {
          pointer-events: none;
        }
      `;
      document.head.appendChild(styleTag);
    }
  }, []);

  // Update the handleRegenerateSelection function to use the session token
  const handleRegenerateSelection = async (selectedText: string, callback: (regeneratedText: string) => void) => {
    try {
      if (!session?.accessToken) {
        alert('You need to be logged in to use this feature');
        return;
      }
      
      // Check if this is a skills section - if so, prevent regeneration
      if (type === 'skills') {
        alert('Regeneration is not available for skills sections');
        return;
      }
      
      // Determine the block type based on the section content
      let blockType = 'bio';
      
      // Try to identify the type of content based on the section or selected text
      const content = section.content?.toLowerCase() || '';
      if (content.includes('experience') || content.includes('work history') || 
          content.includes('employment') || content.includes('job')) {
        blockType = 'experience';
      } else if (content.includes('education') || content.includes('degree') || 
                content.includes('university') || content.includes('school')) {
        blockType = 'education';
      } else if (content.includes('skill') || content.includes('proficient') || 
                content.includes('competent') || content.includes('expertise')) {
        blockType = 'skills';
      } else if (content.includes('project') || content.includes('portfolio') || 
                content.includes('achievement')) {
        blockType = 'projects';
      }
      
      // Call the API with the session token and determined block type
      const regeneratedContent = await regenerateText(selectedText, session.accessToken, blockType);
      
      if (regeneratedContent) {
        // Process the regenerated content to handle markdown syntax like **bold**
        let processedContent = regeneratedContent;
        
        // Replace **text** with <strong>text</strong> for bold formatting
        processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Call the callback with the processed content
        callback(processedContent);
      } else {
        alert('Failed to regenerate text. Please try again.');
      }
    } catch (error) {
      console.error('Error regenerating text:', error);
      alert('Failed to regenerate text. Please try again.');
    }
  };

  // Add this function to improve text selection behavior
  const selectEntireWord = (node: Node, offset: number) => {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent) return null;
    
    const text = node.textContent;
    
    // Check if we're inside a number or date pattern
    let start = offset;
    let end = offset;
    
    // Pattern for dates and numbers (e.g., "2019", "12/31/2022")
    const isDigit = (char: string) => /\d/.test(char);
    const isDateSeparator = (char: string) => /[-/.:]/.test(char);
    const isPartOfDate = (char: string) => isDigit(char) || isDateSeparator(char);
    
    // Check if we're in a date pattern
    if (offset < text.length && isPartOfDate(text[offset])) {
      // Find the start of the date/number
      while (start > 0 && isPartOfDate(text[start - 1])) {
        start--;
      }
      
      // Find the end of the date/number
      while (end < text.length && isPartOfDate(text[end])) {
        end++;
      }
      
      // If we found a reasonable date-like segment
      if (end - start >= 4) { // At least 4 chars for a year
        return { node, start, end };
      }
    }
    
    // If not a date, try to select the whole word
    start = offset;
    end = offset;
    
    const isWordChar = (char: string) => /\w/.test(char);
    
    // Find word boundaries
    while (start > 0 && isWordChar(text[start - 1])) {
      start--;
    }
    
    while (end < text.length && isWordChar(text[end])) {
      end++;
    }
    
    return { node, start, end };
  };
  
  // Enhanced mouse-up handler for better text selection
  const handleMouseUp = (e: React.MouseEvent) => {
    updateToolbarPosition();
    
    // Handle selection logic
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();
      
      // Detect and update font size after selection
      tryDetectFontSize(selection);
      
      // If this is likely a date or a short word
      if (selectedText.length < 15 && editableRef.current) {
        // Try to check if this might be a date part or number
        const node = selection.anchorNode;
        const offset = selection.anchorOffset;
        
        if (node && node.nodeType === Node.TEXT_NODE) {
          const enhancedSelection = selectEntireWord(node, offset);
          
          if (enhancedSelection) {
            try {
              // Create a new range for the enhanced selection
              const newRange = document.createRange();
              newRange.setStart(enhancedSelection.node, enhancedSelection.start);
              newRange.setEnd(enhancedSelection.node, enhancedSelection.end);
              
              // Apply the new range
              selection.removeAllRanges();
              selection.addRange(newRange);
              
              // Update toolbar with new selection
              updateToolbarPosition();
              
              // Store enhanced selection
              // @ts-ignore
              window.__selectedText = newRange.toString();
              
              // Prevent default browser selection behavior
              e.preventDefault();
            } catch (err) {
              console.error('Error enhancing selection:', err);
            }
          }
        }
      }
    }
  }

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
          <button 
            className={styles.sectionActionButton} 
            onClick={() => onDelete(id)}
            title="Delete section"
          >
            <DeleteIcon fontSize="small" sx={{ color: "#444", width: "16px", height: "16px" }} />
          </button>
          <button 
            className={styles.sectionActionButton} 
            onClick={() => onDuplicate(id)}
            title="Duplicate section"
          >
            <ContentCopyIcon fontSize="small" sx={{ color: "#444", width: "16px", height: "16px" }} />
          </button>
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
        onMouseDown={(e) => {
          // Only process triple-clicks
          if (e.detail === 3) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get clicked element
            const clickedElement = e.target as HTMLElement;
            if (!clickedElement || !editableRef.current) return;
            
            // Find nearest block element
            const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'];
            let targetNode: HTMLElement | null = clickedElement;
            
            // If we clicked directly on text node, start with its parent
            if (!(targetNode instanceof Element)) {
              targetNode = clickedElement.parentElement;
            }
            
            // Find closest block parent that isn't the editor itself
            while (
              targetNode && 
              targetNode !== editableRef.current && 
              !blockTags.includes(targetNode.nodeName)
            ) {
              targetNode = targetNode.parentElement;
            }
            
            // If no block found or it's the editor itself, 
            // try to use the original click target
            if (!targetNode || targetNode === editableRef.current) {
              targetNode = clickedElement;
            }
            
            // Create selection on this node
            try {
              const selection = window.getSelection();
              if (!selection) return;
              
              selection.removeAllRanges();
              const range = document.createRange();
              
              if (targetNode.childNodes.length > 0) {
                // Select the node contents
                range.selectNodeContents(targetNode);
              } else {
                // Fallback for empty nodes
                range.selectNode(targetNode);
              }
              
              selection.addRange(range);
              
              // Force toolbar to show with this selection
              updateToolbarPosition();
              
              // Store triple-click info for toolbar
              // @ts-ignore
              window.__isTripleClickSelection = true;
              // @ts-ignore
              window.__tripleClickSelection = {
                container: targetNode,
                startContainer: range.startContainer,
                startOffset: range.startOffset,
                endContainer: range.endContainer, 
                endOffset: range.endOffset
              };
            } catch (err) {
              console.error('Error handling triple-click selection:', err);
            }
          }
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
            onMouseUp={handleMouseUp}
            onMouseDown={(e) => {
              // Only process triple-clicks
              if (e.detail === 3) {
                e.preventDefault();
                e.stopPropagation();
                
                // Get clicked element
                const clickedElement = e.target as HTMLElement;
                if (!clickedElement || !editableRef.current) return;
                
                // Find nearest block element
                const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'];
                let targetNode: HTMLElement | null = clickedElement;
                
                // If we clicked directly on text node, start with its parent
                if (!(targetNode instanceof Element)) {
                  targetNode = clickedElement.parentElement;
                }
                
                // Find closest block parent that isn't the editor itself
                while (
                  targetNode && 
                  targetNode !== editableRef.current && 
                  !blockTags.includes(targetNode.nodeName)
                ) {
                  targetNode = targetNode.parentElement;
                }
                
                // If no block found or it's the editor itself, 
                // try to use the original click target
                if (!targetNode || targetNode === editableRef.current) {
                  targetNode = clickedElement;
                }
                
                // Create selection on this node
                try {
                  const selection = window.getSelection();
                  if (!selection) return;
                  
                  selection.removeAllRanges();
                  const range = document.createRange();
                  
                  if (targetNode.childNodes.length > 0) {
                    // Select the node contents
                    range.selectNodeContents(targetNode);
                  } else {
                    // Fallback for empty nodes
                    range.selectNode(targetNode);
                  }
                  
                  selection.addRange(range);
                  
                  // Force toolbar to show with this selection
                  updateToolbarPosition();
                  
                  // Store triple-click info for toolbar
                  // @ts-ignore
                  window.__isTripleClickSelection = true;
                  // @ts-ignore
                  window.__tripleClickSelection = {
                    container: targetNode,
                    startContainer: range.startContainer,
                    startOffset: range.startOffset,
                    endContainer: range.endContainer, 
                    endOffset: range.endOffset
                  };
                } catch (err) {
                  console.error('Error handling triple-click selection:', err);
                }
              }
            }}
            style={{
              ...sharedEditableStyle,
              outline: "none",
              caretColor: "#3662E3", // Modern blue cursor color
              boxShadow: "0 0 0 1px rgba(54, 98, 227, 0.1) inset", // Subtle edit mode indicator
            }}
            className={styles.sectionContent}
            data-section-content="true"
          />
        ) : (
          <div 
            ref={editableRef}
            style={{
              ...sharedEditableStyle,
              cursor: 'pointer', // Add pointer cursor to indicate clickable
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
            dangerouslySetInnerHTML={{ __html: getSectionContent() }} 
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDoubleClick(e);
            }}
            className={`${styles.sectionContent} ${styles.hoverableSectionContent}`}
            data-section-content="true"
          />
        )}
      </div>

      <FloatingToolbar 
        visible={showToolbar} 
        onClose={() => setShowToolbar(false)} 
        onRegenerateSelection={handleRegenerateSelection}
      />

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
            initialThickness={(section as LineSection).thickness}
            initialColor={(section as LineSection).color}
          />
        </DialogContent>
      </Dialog>
    </Rnd>
  )
}
