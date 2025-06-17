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
  const [showToolbar, setShowToolbar] = useState(false)
  const [lockAspectRatio, setLockAspectRatio] = useState(false)
  const editableRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rndRef = useRef<Rnd | null>(null)
  const initialFitRef = useRef(false)
  const { id, x, y, width, height, type } = section
  const [fontSize, setFontSize] = useState(10);
  const [isResizing, setIsResizing] = useState(false);

  const MIN_WIDTH = 40;
  const MIN_HEIGHT = 20;

  // Base font size and dimensions for scaling
  const BASE_FONT_SIZE = 10;
  const BASE_WIDTH = 150; // Use your initial width for new sections
  const BASE_HEIGHT = 40; // Use your initial height for new sections

  const zoomFactor = zoom / 100;

  // Canva-style scaling logic
  const NATURAL_WIDTH = 400;
  const NATURAL_HEIGHT = 120;
  const [baseFontSize, setBaseFontSize] = useState(BASE_FONT_SIZE);

  // Calculate scale to fit current box size
  const scale = Math.min(width / NATURAL_WIDTH, height / NATURAL_HEIGHT);

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

  // Update shared styles to reduce padding and make border hug content closely
  const sharedEditableStyle: React.CSSProperties = {
    display: "block", // Allow wrapping
    minWidth: 0,
    minHeight: 0,
    padding: "1px", // Reduced even further to hug content better
    fontSize: "10px", // Use fixed base font size - don't use dynamic fontSize state
    lineHeight: "1.2", // Tighter line height to reduce vertical space
    whiteSpace: "pre-wrap", // Allow wrapping and line breaks
    overflowWrap: "break-word",
    color: "#000",
    caretColor: "#000",
    outline: "none",
    userSelect: isEditing ? "text" : "none",
    direction: "ltr",
    backgroundColor: "transparent",
    boxSizing: "border-box",
    margin: 0,
    width: "100%",
    height: "100%"
  }

  // Generate the initial content for sections that don't have saved content yet
  const generateInitialContent = () => {
    switch (type) {
      case "experience":
        const exp = section as ExperienceSection
        return `<strong>${exp.title}</strong> @ ${exp.company}<br><em style=\"margin:0\">${exp.startDate} – ${exp.endDate}</em><p style=\"margin:0\">${exp.description}</p>`
      case "skills":
        return `<strong>Skills:</strong><ul style=\"list-style-position: inside; padding-left: 0; margin:0 0 0 12px;\">${(section as SkillsSection).skills.map(s => `<li style=\"margin:0\">${s}</li>`).join('')}</ul>`
      case "languages":
        return `<strong>Languages:</strong><ul style=\"list-style-position: inside; padding-left: 0; margin:0 0 0 12px;\">${(section as LanguagesSection).languages.map(lang => `<li style=\"margin:0\">${lang.name} — ${lang.level}</li>`).join('')}</ul>`
      case "education":
        const edu = section as EducationSection
        return `<strong>${edu.degree}</strong> @ ${edu.institution}<br><em style=\"margin:0\">${edu.startDate} – ${edu.endDate}</em><br><span style=\"margin:0\">${edu.description}</span>`
      case "projects":
        return `<strong>Projects:</strong><ul style=\"list-style-position: inside; padding-left: 0; margin:0 0 0 12px;\">${(section as ProjectsSection).projects.map(proj => `<li style=\"margin:0\"><strong>${proj.name}</strong>: ${proj.description}</li>`).join('')}</ul>`
      case "header":
        const header = section as HeaderSection
        return `<h2 class="${styles.headerName}" style=\"margin: 0 0 2px 0; font-size: 20px; font-weight: bold\">${header.name}</h2><p class="${styles.headerJobTitle}" style=\"margin: 0; font-size: 16px\">${header.jobTitle}</p>`
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

  // Handle blur: save HTML without changing font size
  const handleBlur = () => {
    // Use requestAnimationFrame to avoid blocking the focusout event
    requestAnimationFrame(() => {
      if (!editableRef.current) return;
      
      const currentHtml = editableRef.current.innerHTML || "";
      updateContent(id, currentHtml);
      setIsEditing(false);
      // Do NOT change font size here, preserve it
    });
  }

  // Auto-resize logic - DISABLED to prevent automatic resizing
  const resizeToContent = () => {
    // Completely disabled to prevent automatic resizing
    return;
  };

  useLayoutEffect(() => {
    // Disable MutationObserver during editing to prevent constant resizing
    if (isEditing && editableRef.current) {
      // We don't want to observe mutations during typing as it causes shrinking
      // The content will be saved and resize will happen on blur
      return;
    }
    
    // No cleanup needed since we're not creating any observer during editing
  }, [isEditing]);

  useEffect(() => {
    // Set initial content when edit mode begins
    if (isEditing && editableRef.current) {
      // Preserve scaled text size when entering edit mode
      const currentTransform = editableRef.current.style.transform;
      let scaleMultiplier = 1;
      
      // Extract scale value from transform if it exists
      if (currentTransform && currentTransform.includes('scale(')) {
        const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
        if (scaleMatch) {
          scaleMultiplier = parseFloat(scaleMatch[1]) || 1;
          console.log('Detected scale multiplier:', scaleMultiplier);
        }
      }
      
      // IMPORTANT: Capture current DOM content BEFORE resetting transform
      // This preserves any font size changes made with FloatingToolbar
      const currentContent = editableRef.current.innerHTML || getSectionContent();
      
      // Reset any scaling transformations during edit mode
      editableRef.current.style.transform = 'none';
      
      // Set the current content (which includes any font changes)
      if (editableRef.current.innerHTML !== currentContent) {
        editableRef.current.innerHTML = currentContent
      }
      
      // Apply scaling to the current content elements (after innerHTML is set)
      if (scaleMultiplier !== 1) {
        const applyScaleToFontSizes = (element: HTMLElement) => {
          // First pass: wrap all plain text nodes in spans with explicit font-size
          const wrapTextNodes = (container: HTMLElement) => {
            const walker = document.createTreeWalker(
              container,
              NodeFilter.SHOW_TEXT,
              null
            );
            
            const textNodes: Text[] = [];
            let node = walker.nextNode();
            while (node) {
              if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                textNodes.push(node as Text);
              }
              node = walker.nextNode();
            }
            
            // Wrap each text node in a span with explicit font size
            textNodes.forEach(textNode => {
              const parent = textNode.parentElement;
              if (parent) {
                const computedStyle = window.getComputedStyle(parent);
                const currentFontSize = parseInt(computedStyle.fontSize) || 10;
                
                // Create span wrapper with explicit font size
                const span = document.createElement('span');
                const className = `text-wrapper-${currentFontSize}-${Date.now()}`;
                span.className = className;
                span.textContent = textNode.textContent;
                
                // Inject CSS for this font size
                const styleElement = document.createElement('style');
                styleElement.textContent = `
                  .${className} {
                    font-size: ${currentFontSize}px !important;
                    line-height: normal !important;
                  }
                  .contentEditable .${className},
                  .editable .${className},
                  .sectionBox .${className} {
                    font-size: ${currentFontSize}px !important;
                    line-height: normal !important;
                  }
                `;
                document.head.appendChild(styleElement);
                
                // Replace text node with span
                textNode.parentNode?.replaceChild(span, textNode);
                console.log(`Wrapped text node with ${currentFontSize}px font size`);
              }
            });
          };
          
          // Wrap all plain text nodes first
          wrapTextNodes(element);
          
          // Second pass: ensure all elements have explicit font-size styles
          const walker1 = document.createTreeWalker(
            element,
            NodeFilter.SHOW_ELEMENT,
            null
          );
          
          let node = walker1.nextNode();
          while (node) {
            if (node instanceof HTMLElement) {
              const currentStyle = window.getComputedStyle(node);
              const currentFontSize = parseInt(currentStyle.fontSize);
              
              // If element doesn't have explicit font-size, give it one based on computed style
              if (!node.style.fontSize && !node.className.includes('font-size-') && !node.className.includes('text-wrapper-') && !isNaN(currentFontSize)) {
                // Create a class for the current computed font size
                const baseClassName = `base-font-size-${currentFontSize}-${Date.now()}`;
                node.className = (node.className + ' ' + baseClassName).trim();
                
                // Inject CSS for the base font size
                const baseStyleElement = document.createElement('style');
                baseStyleElement.textContent = `
                  .${baseClassName} {
                    font-size: ${currentFontSize}px !important;
                    line-height: normal !important;
                  }
                  .contentEditable .${baseClassName},
                  .editable .${baseClassName},
                  .sectionBox .${baseClassName} {
                    font-size: ${currentFontSize}px !important;
                    line-height: normal !important;
                  }
                `;
                document.head.appendChild(baseStyleElement);
                
                console.log(`Set base font size ${currentFontSize}px for element:`, node.tagName);
              }
            }
            node = walker1.nextNode();
          }
          
          // Third pass: apply scaling to all elements (now they all have explicit styles)
          const walker2 = document.createTreeWalker(
            element,
            NodeFilter.SHOW_ELEMENT,
            null
          );
          
          let node2 = walker2.nextNode();
          while (node2) {
            if (node2 instanceof HTMLElement) {
              const currentStyle = window.getComputedStyle(node2);
              const currentFontSize = parseInt(currentStyle.fontSize);
              
              if (!isNaN(currentFontSize)) {
                const newFontSize = Math.round(currentFontSize * scaleMultiplier);
                
                // Create a unique class name for this scaled font size
                const className = `scaled-font-size-${newFontSize}-${Date.now()}`;
                node2.className = (node2.className + ' ' + className).trim();
                
                // Inject CSS with high specificity
                const styleElement = document.createElement('style');
                styleElement.textContent = `
                  .${className} {
                    font-size: ${newFontSize}px !important;
                    line-height: normal !important;
                  }
                  .contentEditable .${className},
                  .editable .${className},
                  .sectionBox .${className} {
                    font-size: ${newFontSize}px !important;
                    line-height: normal !important;
                  }
                `;
                document.head.appendChild(styleElement);
                
                console.log(`Scaled font from ${currentFontSize}px to ${newFontSize}px for element:`, node2.tagName);
              }
            }
            node2 = walker2.nextNode();
          }
        };
        
        // Apply scaling after a brief delay to ensure DOM is fully updated
        setTimeout(() => {
          applyScaleToFontSizes(editableRef.current!);
        }, 10);
      }
      
      // DON'T set fontSize on entire container - let individual elements have their own font sizes
      // editableRef.current.style.fontSize = `${fontSize}px`; // REMOVED - this caused whole section to resize
      
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
          if (computedStyle.fontSize !== '10px') { // Not the default size
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
        detail: { fontSize: 10 } 
      }));
    }
  };

  // Handle dragging - let Rnd handle position updates naturally
  const handleDragStop = (_: any, d: { x: number; y: number }) => {
    // Persist position on drag stop
    updatePosition(id, { x: d.x, y: d.y, width, height });
  };

  // Add a ref to track horizontal resize state
  const isHorizontalResizeRef = useRef(false);
  // Track the original size and font size when starting a resize
  const resizeStartRef = useRef<{ width: number; height: number; fontSize: number } | null>(null);
  const skipNextResizeRef = useRef(false);
  // No-op stubs for old auto-fit functions
  const scaleContentToFit = (_contentRef: any, _w: number, _h: number) => {};
  const getContentNaturalSize = () => ({ width: MIN_WIDTH, height: MIN_HEIGHT });

  // Handle toolbar font size changes - ENABLED automatic container resizing for font changes
  const handleFontSizeChange = (newFontSize?: number) => {
    if (typeof newFontSize !== 'number') return;
    
    // Update the font size
    setFontSize(newFontSize);
    
    // Apply font size inline so content updates immediately
    if (editableRef.current) {
      editableRef.current.style.fontSize = `${newFontSize}px`;
      editableRef.current.style.transform = 'none';
      
      // Measure the new content dimensions with the new font size
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editableRef.current.innerHTML;
      tempDiv.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${width}px;
        font-size: ${newFontSize}px;
        line-height: 1.2;
        padding: 2px;
        margin: 0;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        box-sizing: border-box;
        left: -9999px;
        top: -9999px;
      `;
      
      document.body.appendChild(tempDiv);
      const measuredHeight = Math.max(tempDiv.scrollHeight, MIN_HEIGHT);
      document.body.removeChild(tempDiv);
      
      // Update container size to fit the new font size
      updatePosition(id, { x, y, width, height: measuredHeight });
    }
  };

  // Capture original dimensions at the start of a resize
  const handleResizeStart = (e: any, dir: string) => {
    const isCorner = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(dir)
    setLockAspectRatio(isCorner)
    setIsResizing(true)
    resizeStartRef.current = { width, height, fontSize }
  };

  const handleResize = (
    e: any,
    dir: string,
    ref: any,
    delta: { width: number; height: number },
    pos: { x: number; y: number }
  ) => {
    if (!editableRef.current) return;
    const newW = parseInt(ref.style.width);
    const newH = parseInt(ref.style.height);
    // Determine if this is a horizontal edge resize (left or right handle)
    const isHorizontal = dir === 'left' || dir === 'right';

    if (isHorizontal) {
      // Horizontal resize: keep original font size and adjust height to fit content
      editableRef.current.style.fontSize = `${resizeStartRef.current?.fontSize}px`;
      editableRef.current.style.transform = 'none';
    } else {
      // Corner resize: scale proportionally by min of width/height ratios (original behavior)
      const widthRatio = newW / width;
      const heightRatio = newH / height;
      const ratio = Math.min(widthRatio, heightRatio);
      editableRef.current.style.transform = `scale(${ratio})`;
      editableRef.current.style.transformOrigin = 'top left';
    }
  };

  const handleResizeStop = (
    e: any,
    dir: string,
    ref: any,
    delta: { width: number; height: number },
    pos: { x: number; y: number }
  ) => {
    // Ensure editable element and start dimensions exist
    if (!editableRef.current || !resizeStartRef.current) return;
    
    const container = editableRef.current;
    const { width: startW, height: startH, fontSize: startFS } = resizeStartRef.current;
    const newW = parseInt(ref.style.width, 10);
    const newH = parseInt(ref.style.height, 10);
    
    // Check if this is a horizontal edge resize (left or right handle)
    const isHorizontal = dir === 'left' || dir === 'right';
    
    // Clear any previous transforms
    container.style.transform = 'none';
    
    if (isHorizontal) {
      // Horizontal resize: keep original font size and adjust height to fit content
      container.style.fontSize = `${startFS}px`;
      container.style.transform = 'none';
      
      // Create a temporary measuring element to get accurate height
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = container.innerHTML;
      tempDiv.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${newW}px;
        font-size: ${startFS}px;
        line-height: 1.2;
        padding: 2px;
        margin: 0;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        box-sizing: border-box;
        left: -9999px;
        top: -9999px;
      `;
      
      document.body.appendChild(tempDiv);
      const measuredHeight = Math.max(tempDiv.scrollHeight, MIN_HEIGHT);
      document.body.removeChild(tempDiv);
      
      // Update position with measured height
      updatePosition(id, { x: pos.x, y: pos.y, width: newW, height: measuredHeight });
    } else {
      // Corner resize: scale proportionally by min of width/height ratios (original behavior)
      const widthRatio = newW / width;
      const heightRatio = newH / height;
      const ratio = Math.min(widthRatio, heightRatio);
      container.style.transform = `scale(${ratio})`;
      container.style.transformOrigin = 'top left';
      
      // Use the manually resized dimensions
      updatePosition(id, { x: pos.x, y: pos.y, width: newW, height: newH });
    }
    
    // Clear the resize flag
    setIsResizing(false);
  };

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
    skipNextResizeRef.current = true;
    e.preventDefault();
    e.stopPropagation();
    // Ensure section is selected
    onClick();
    
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
          font-size: 10px;
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

  // Update the handleRegenerateSelection function to use the same authentication approach as getResumes
  const handleRegenerateSelection = async (selectedText: string, callback: (regeneratedText: string) => void) => {
    try {
      // Try to get token from multiple sources with localStorage taking precedence
      const token = localStorage.getItem('api_token') || session?.accessToken;
      
      if (!token) {
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
      
      // Call the API with the token and determined block type
      const regeneratedContent = await regenerateText(selectedText, token, blockType);
      
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
    // Debounce toolbar positioning to avoid excessive calls
    requestAnimationFrame(() => {
      updateToolbarPosition();
    });
    
    // Handle selection logic with performance optimization
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();
      
      // Only process expensive font detection for short selections
      if (selectedText.length < 50) {
        // Debounce font size detection
        requestAnimationFrame(() => {
          tryDetectFontSize(selection);
        });
      }
      
      // Only do enhanced selection for very short text (likely dates/numbers)
      if (selectedText.length < 15 && selectedText.length > 0 && editableRef.current) {
        const node = selection.anchorNode;
        const offset = selection.anchorOffset;
        
        if (node && node.nodeType === Node.TEXT_NODE) {
          try {
            const enhancedSelection = selectEntireWord(node, offset);
            
            if (enhancedSelection) {
              const newRange = document.createRange();
              newRange.setStart(enhancedSelection.node, enhancedSelection.start);
              newRange.setEnd(enhancedSelection.node, enhancedSelection.end);
              
              selection.removeAllRanges();
              selection.addRange(newRange);
              
              // Store enhanced selection without blocking
              requestAnimationFrame(() => {
                updateToolbarPosition();
                // @ts-ignore
                window.__selectedText = newRange.toString();
              });
              
              e.preventDefault();
            }
          } catch (err) {
            // Silently handle errors to avoid performance impact
            console.warn('Selection enhancement failed:', err);
          }
        }
      }
    }
  }

  // Listen for font size change events from the FloatingToolbar - ENABLED automatic resizing for font changes
  useEffect(() => {
    const handleFontSizeChanged = (e: Event) => {
      if (e instanceof CustomEvent && e.detail) {
        // Only respond to events for this section
        if (e.detail.sectionId === id) {
          const newFontSize = e.detail.fontSize;
          
          // Skip if the font size is the same or invalid
          if (!newFontSize || newFontSize === fontSize) return;
          
          // Update font size and resize container
          setFontSize(newFontSize);
          
          // Apply font size inline and resize container
          if (editableRef.current) {
            editableRef.current.style.fontSize = `${newFontSize}px`;
            
            // Measure the new content dimensions with the new font size
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = editableRef.current.innerHTML;
            tempDiv.style.cssText = `
              position: absolute;
              visibility: hidden;
              width: ${width}px;
              font-size: ${newFontSize}px;
              line-height: 1.2;
              padding: 2px;
              margin: 0;
              white-space: pre-wrap;
              overflow-wrap: break-word;
              box-sizing: border-box;
              left: -9999px;
              top: -9999px;
            `;
            
            document.body.appendChild(tempDiv);
            const measuredHeight = Math.max(tempDiv.scrollHeight, MIN_HEIGHT);
            document.body.removeChild(tempDiv);
            
            // Update container size to fit the new font size
            updatePosition(id, { x, y, width, height: measuredHeight });
          }
        }
      }
    };
    
    // Add event listener
    document.addEventListener('font-size-changed', handleFontSizeChanged);
    
    // Clean up
    return () => {
      document.removeEventListener('font-size-changed', handleFontSizeChanged);
    };
  }, [id, fontSize, width, height, x, y, updatePosition]); // Added back dependencies for font size changes

  // Track hover state to show handles when hovered
  const [isHovered, setIsHovered] = useState(false)

  // Determine when to show handles (when active or hovered)
  const showHandles = isActive || isHovered
  const handleStyles = showHandles
    ? {
        left:    { width: '6px', height: '24px', borderRadius: '2px', background: '#fff', border: '2px solid #8e44ad', top: '50%', transform: 'translateY(-50%)' },
        right:   { width: '6px', height: '24px', borderRadius: '2px', background: '#fff', border: '2px solid #8e44ad', top: '50%', transform: 'translateY(-50%)' },
        topLeft:     { width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: '2px solid #8e44ad' },
        topRight:    { width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: '2px solid #8e44ad' },
        bottomLeft:  { width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: '2px solid #8e44ad' },
        bottomRight: { width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: '2px solid #8e44ad' },
      }
    : {
        left: { display: 'none' },
        right: { display: 'none' },
        topLeft: { display: 'none' },
        topRight: { display: 'none' },
        bottomLeft: { display: 'none' },
        bottomRight: { display: 'none' },
    };

  return (
    <>
      <Rnd
        onDoubleClickCapture={(e: React.MouseEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();
          handleDoubleClick(e);
        }}
        // Show handles on hover as well as when active
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        lockAspectRatio={lockAspectRatio}
        className={`${styles.sectionWrapper} ${type === 'header' ? styles.headerSection : ''} hoverable-section ${isActive ? 'active-section' : ''}`}
        ref={rndRef}
        bounds="parent"
        disableDragging={isEditing}
        enableResizing={{
          top: false,
          right: true,
          bottom: false,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true
        }}
        resizeHandleStyles={handleStyles}
        size={{ width, height }}
        position={{ x, y }}
        minWidth={40}
        minHeight={20}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeStop={handleResizeStop}
        onDragStop={handleDragStop}
        scale={zoomFactor}
        // Optimize performance during drag operations
        dragHandleClassName="drag-handle"
        cancel=".no-drag"
        // Remove shouldUpdatePosition to allow proper drag feedback
        style={{ 
          position: "absolute", 
          backgroundColor: "transparent", 
          zIndex: 100,
          border: "none", // We'll control this with CSS classes instead
          boxSizing: "border-box",
          // Optimize for performance
          willChange: "transform",
          // Prevent text selection during drag
          userSelect: isEditing ? "text" : "none"
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
              <DeleteIcon fontSize="small" sx={{ color: "#000", width: "18px", height: "18px" }} />
            </button>
            <button 
              className={styles.sectionActionButton} 
              onClick={() => onDuplicate(id)}
              title="Duplicate section"
            >
              <ContentCopyIcon fontSize="small" sx={{ color: "#000", width: "18px", height: "18px" }} />
            </button>
          </div>
        )}

        <div 
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            cursor: isEditing ? "text" : "grab",
            boxSizing: "border-box",
            overflow: "hidden",
            padding: "0", // No extra padding in the container
            margin: 0
          }}
          onClick={handleContainerClick}
          onDoubleClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isEditing) {
              handleDoubleClick(e);
            }
          }}
          className={isEditing ? "edit-mode drag-handle" : "drag-handle"}
        >
          {isEditing ? (
            <div 
              ref={editableRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onKeyUp={updateToolbarPosition}
              onMouseUp={handleMouseUp}
              style={{
                ...sharedEditableStyle,
                outline: "none",
                caretColor: "#3662E3",
                boxShadow: "0 0 0 1px rgba(54, 98, 227, 0.1) inset",
              }}
              className={`${styles.sectionContent} edit-mode`}
              data-section-content="true"
            />
          ) : (
            <div 
              ref={editableRef}
              style={{
                ...sharedEditableStyle,
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                if (e.detail === 2 && !isEditing) {
                  handleDoubleClick(e);
                }
              }}
              dangerouslySetInnerHTML={{ __html: getSectionContent() }} 
              onDoubleClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();
                handleDoubleClick(e);
              }}
              className={`${styles.sectionContent} ${styles.hoverableSectionContent}`}
              data-section-content="true"
            />
          )}
        </div>
      </Rnd>

      {/* FloatingToolbar for text formatting when text is selected in edit mode */}
      {isEditing && (
        <FloatingToolbar
          visible={showToolbar}
          onClose={() => setShowToolbar(false)}
          onRegenerateSelection={session ? handleRegenerateSelection : undefined}
          sectionType={type}
          onFontSizeChange={handleFontSizeChange}
        />
      )}
    </>
  )
}