"use client"

import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useTheme, useMediaQuery, Drawer, IconButton, Button, Modal, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Paper, TextField, CircularProgress, Snackbar, Alert, AlertColor } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useDispatch, useSelector } from "react-redux"
import { getMyProfile } from "@/store/slices/profileSlice"
import { AppDispatch, RootState } from "@/store/store"
import styles from '@/styles/ResumeBuilder.module.css'
import Sidebar from '@/components/Sidebar'
import Canvas from '@/components/Canvas'
import SectionRenderer from '@/components/SectionRenderer'
import ZoomControls from '@/components/zoom-controls'
import { HeaderSection, TextSection, SkillsSection, LanguagesSection, EducationSection, ExperienceSection, ProjectsSection, CustomSection, ImageSection, LineSection, SectionType } from '@/models/sectionTypes'
import ResumeActions from '@/components/ResumeActions'
import QRCodeModal from '@/components/QRCodeModal'
import { nftService } from '@/utils/nftService'
import { useSession } from "next-auth/react"
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { useRouter } from 'next/router'
import FrenchDataCV from '@/components/templates/FrenchDataCV'
import ReactDOM from 'react-dom/client'
import BugReportIcon from '@mui/icons-material/BugReport'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import WidgetsIcon from '@mui/icons-material/Widgets'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import IconsSidebar from '@/components/IconsSidebar'
import QRCode from 'qrcode'

// Add debug button and dialog
const DEBUG_MODE = process.env.NODE_ENV === 'development';

// Add type declaration for LinkedIn SDK
declare global {
  interface Window {
    IN?: {
      UI: {
        Share: () => {
          params: (config: {
            url: string;
            title: string;
            description: string;
          }) => {
            place: () => void;
          };
        };
      };
      parse: (element: HTMLElement) => void;
    };
  }
}

export default function ResumeBuilder() {
  const dispatch = useDispatch<AppDispatch>()
  const profile = useSelector((state: RootState) => state.profile.profile)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { data: session } = useSession()
  const router = useRouter()

  const [sections, setSections] = useState<SectionType[]>([])
  const [sectionsHistory, setSectionsHistory] = useState<SectionType[][]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPermanent, setSidebarPermanent] = useState(false)
  const [iconsSidebarOpen, setIconsSidebarOpen] = useState(false)
  const [iconsSidebarPermanent, setIconsSidebarPermanent] = useState(false)
  const [zoom, setZoom] = useState(75) // Default zoom level at 75%
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [resumeId, setResumeId] = useState<string | null>(null) // Track resume ID for updates
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor
  })

  // QR Code modal state
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrVerificationUrl, setQrVerificationUrl] = useState('')
  const [qrNftId, setQrNftId] = useState('')
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState('')

  // Inside the ResumeBuilder component but outside of any function or method:
  const [linkedInConnected, setLinkedInConnected] = useState(false);

  // Add a useEffect to check LinkedIn connection status on mount
  useEffect(() => {
    const checkLinkedInToken = () => {
      const token = localStorage.getItem('linkedin_token');
      
      // Simple format validation
      const isValidFormat = token && token.length > 20 && /^[A-Za-z0-9\-_]+$/.test(token);
      setLinkedInConnected(!!isValidFormat);
      
      if (isValidFormat) {
        console.log('LinkedIn token found in localStorage:', true);
        console.log('LinkedIn token length:', token.length);
      }
    };
    
    // Check for token immediately
    checkLinkedInToken();
    
    // Set up listener for storage changes (for when token is added in another window/tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'linkedin_token') {
        checkLinkedInToken();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check once more after a short delay to catch any updates
    const checkAgainTimeout = setTimeout(checkLinkedInToken, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearTimeout(checkAgainTimeout);
    };
  }, []);

  // Helper to retrieve the authentication token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('api_token') || localStorage.getItem('token') || null;
    }
    return null;
  };

  // Function to auto-fit section borders to their content (only used when templates are loaded)
  const autoFitSectionBorders = () => {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const batchUpdates: Array<{id: string, position: {x: number, y: number, width: number, height: number}}> = [];
      
      sections.forEach(section => {
        // Only auto-fit text-based sections (not images, lines, etc.)
        if (!['text', 'custom', 'header', 'experience', 'education', 'projects'].includes(section.type)) {
          return;
        }

        // Get the content to measure
        let contentToMeasure = '';
        let measureFontSize = '10px'; // Default font size for most sections
        
        if (section.type === 'header') {
          const headerSection = section as any;
          contentToMeasure = `<h2 style="margin: 0 0 2px 0; font-size: 20px; font-weight: bold">${headerSection.name}</h2><p style="margin: 0; font-size: 16px">${headerSection.jobTitle}</p>`;
          measureFontSize = '16px'; // Use larger font size for measuring header sections
        } else {
          contentToMeasure = (section as any).content || '';
        }

        if (!contentToMeasure) return;

        // Create a temporary element to measure content size (more efficient)
        const tempElement = document.createElement('div');
        tempElement.innerHTML = contentToMeasure;
        tempElement.style.cssText = `
          position: absolute;
          visibility: hidden;
          pointer-events: none;
          font-size: ${measureFontSize};
          line-height: 1.2;
          padding: 1px;
          margin: 0;
          white-space: pre-wrap;
          overflow-wrap: break-word;
          box-sizing: border-box;
          width: ${section.width}px;
          top: -9999px;
          left: -9999px;
        `;
        
        // Batch DOM operations
        document.body.appendChild(tempElement);
        
        // Get the natural dimensions immediately
        const naturalHeight = Math.max(tempElement.offsetHeight + 10, 40);
        const naturalWidth = Math.max(section.width, 100);
        
        // Clean up immediately
        document.body.removeChild(tempElement);

        // Queue update if dimensions are significantly different
        if (Math.abs(naturalHeight - section.height) > 20) {
          batchUpdates.push({
            id: section.id,
            position: {
              x: section.x,
              y: section.y,
              width: naturalWidth,
              height: naturalHeight
            }
          });
        }
      });
      
      // Apply all updates at once to avoid multiple re-renders
      batchUpdates.forEach(update => {
        updateSectionPosition(update.id, update.position);
      });
    });
  };

  const updateSectionContent = (id: string, newContent: string) =>
    setSections((prev) => prev.map((s): SectionType => {
      if (s.id === id) {
        if (s.type === 'image') {
          const isRound = newContent.includes('border-radius: 50%') || newContent.includes('border-radius:50%')
          return { ...s, content: newContent, isRound }
        }
        return { ...s, content: newContent }
      }
      return s
    }))
  const updateSectionPosition = (id: string, pos: { x: number; y: number; width: number; height: number }) => {
    setSections((prev) => {
      return prev.map((s) => {
        if (s.id === id) {
          // Store the precise position
          return { 
            ...s, 
            x: pos.x, 
            y: pos.y, 
            width: pos.width, 
            height: pos.height 
          };
        }
        return s;
      });
    });
  }

  const deleteSection = (id: string) => {
    // Save current state to history before deleting
    setSectionsHistory(prev => [...prev, [...sections]]);
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  const duplicateSection = (id: string) => {
    const original = sections.find((s) => s.id === id)
    if (!original) return
    
    // Prevent duplicating skills section if one already exists
    if (original.type === 'skills') {
      showToast('Cannot duplicate Skills section. Only one Skills section is allowed.', 'warning');
      return;
    }
    
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
    
    // Prevent adding skills section if one already exists
    if (type === 'skills' && sections.some(section => section.type === 'skills')) {
      showToast('Cannot add Skills section. Only one Skills section is allowed.', 'warning');
      return;
    }

    const common = {
      id: uuidv4(),
      x: 100,
      y: 100,
      width: 200, // Smaller default width
      height: 80, // Smaller default height
    }

    let newSection: SectionType

    switch (type) {
      case 'header':
        newSection = {
          ...common,
          type: 'header',
          name: profile.userId.username || 'Your Name',
          jobTitle: profile.type || 'Your Title',
          width: 160, // Reduced from 400
          height: 60 // Reduced from 100
        } as HeaderSection
        break
      case 'text':
        newSection = {
          ...common,
          type: 'text',
          content: 'Editable text...',
          width: 120, // Reduced from 400
          height: 30 // Reduced from 120
        } as TextSection
        break
      case 'skills':
        newSection = {
          ...common,
          type: 'skills',
          skills: profile.skills.map(skill => skill.name),
          width: 140, // Reduced from 300
          // Reduced from 150
        } as SkillsSection
        break
      case 'languages':
        newSection = {
          ...common,
          type: 'languages',
          languages: [{ name: "Add language", level: "level" }],
          width: 200, // Reduced from 250
          height: 60 // Reduced from 120
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
          description: 'Education description...',
          width: 270, // Reduced from 400
          //height: 100 // Reduced from 140
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
          description: 'Job description...',
          width: 250, // Reduced from 400
       //   height: 100 // Reduced from 150
        } as ExperienceSection
        break
      case 'projects':
        newSection = {
          ...common,
          type: 'projects',
          projects: [{ name: 'Project Name', description: 'Project description...' }],
          width: 230, // Reduced from 400
          //height: 100 // Reduced from 140
        } as ProjectsSection
        break
      case 'image':
        newSection = {
          ...common,
          type: 'image',
          src: '',
          alt: 'Profile image',
          isRound: true,
          content: '<div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(to bottom, #b2e1ff 60%, #71c371 40%); display: flex; justify-content: center; align-items: center; cursor: pointer;">Double-click to upload</div>',
          x: 80,
          y: 80,
          width: 120, // Keep the same
          height: 120 // Keep the same
        } as ImageSection
        break
      case 'line':
        newSection = {
          ...common,
          type: 'line' as const,
          orientation: 'horizontal',
          thickness: 3,
          color: '#556fb5',
          height: 20, // Keep the same
          width: 500 // Reduced from 700
        } as LineSection
        break
      case 'custom':
      default:
        newSection = {
          ...common,
          type: 'custom',
          content: 'Write anything here...',
          width: 190, // Reduced from 350
          height: 50 // Reduced from 120
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

  const showToast = (message: string, severity: AlertColor = 'success') => {
    setToast({
      open: true,
      message,
      severity
    });
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  // Base URL for backend API (normalize to remove trailing slash)
  const rawBackendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  const backendUrl = rawBackendUrl.replace(/\/+$/, '');

  const saveDraft = async () => {
    try {
      // Always save to localStorage first
      localStorage.setItem('resume-draft', JSON.stringify(sections));
      
      const token = getAuthToken();
      if (!token) {
        showToast('Your resume was saved locally. Log in to save to your account.', 'info');
        return;
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // First try to update if we have a resumeId
      if (resumeId) {
        // Direct backend update call
        const updateResponse = await fetch(`${backendUrl}/resume/updateResume/${resumeId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ sections }),
        });

        if (updateResponse.ok) {
          const data = await updateResponse.json();
          showToast('Resume updated successfully!', 'success');
          return;
        }

        // If update failed but not with 404, throw error
        if (updateResponse.status !== 404) {
          const error = await updateResponse.json();
          throw new Error(error.error || 'Failed to update resume');
        }
      }

      // If we get here, either we don't have a resumeId or update failed with 404
      // Direct backend create call
      const createResponse = await fetch(`${backendUrl}/resume/createResume`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sections }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.error || 'Failed to create new resume');
      }

      const newData = await createResponse.json();
      setResumeId(newData.resume?._id);
      showToast(resumeId ? 'Resume saved as new document!' : 'Resume created successfully!', 'success');
      
    } catch (error) {
      console.error('Error saving resume:', error);
      showToast(
        error instanceof Error ? error.message : 'Error saving resume. Changes saved locally.',
        'error'
      );
    }
  };

  const handleBlankTemplate = () => {
    setTemplateModalOpen(false)
    // Store current sections before clearing (for undo functionality)
    if (sections.length > 0) {
      // Save current sections to history
      setSectionsHistory(prev => [...prev, sections])
    }
    // Start with empty sections
    setSections([])
  }

  const handleCanadianTemplate = () => {
    setTemplateModalOpen(false)
    // Store current sections before clearing (for undo functionality)
    if (sections.length > 0) {
      setSectionsHistory(prev => [...prev, sections])
    }
    
    // Add comprehensive Canadian template sections with realistic content and proper positioning
    setSections([
      // Header section with name and title
      {
        id: uuidv4(),
        type: 'header',
        name: 'William Ware',
        jobTitle: 'Chief Information Officer (CIO)',
        content: `<h2 style="margin: 0 0 2px 0; font-size: 20px; font-weight: bold">William Ware</h2><p style="margin: 0; font-size: 16px">Chief Information Officer (CIO)</p>`,
        x: 50,
        y: 30,
        width: 450,
        height: 80
      },
      
      // Contact information in top right
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong>CONTACT</strong><br><br>email@example.com<br>(123) 456-7890<br>LinkedIn: /in/williamware<br>Toronto, ON, Canada',
        x: 520,
        y: 30,
        width: 220,
        height: 130
      },
      
      // Professional Summary
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong>PROFESSIONAL SUMMARY</strong><br><br>Passionate Chief Information Officer with the mission to use technology to improve the lives of people living beyond the status quo. With over 15 years of experience in information management, I help companies deliver the right information to the right people at the right time to optimize daily operations alongside strategic goals.',
        x: 50,
        y: 130,
        width: 450,
        height: 140
      },
      
      // Work Experience section (increased height significantly)
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong>WORK EXPERIENCE</strong><br><br><strong>Chief Information Officer (CIO)</strong><br>Peer Computers Inc<br><em>Jan 2018 - Present</em><br><br>• Developed and executed comprehensive IT strategy to integrate all business operations with advanced technology solutions, resulting in 30% cost reduction and operational efficiency<br>• Managed $5M+ annual technology budget and led cross-functional teams of 50+ employees to deliver IT services that improved business processes and user experience<br>• Spearheaded major system integrations and technology implementations, including cloud migration that reduced infrastructure costs by $2M+ annually<br><br><strong>Assistant Chief Information Officer</strong><br>Peer Computers Inc<br><em>Mar 2015 - Dec 2017</em><br><br>• Developed a system that saved over 500 employee hours annually and reduced the time to do business inventory by 80%<br>• Led strategic technology initiatives and mentored junior staff in emerging IT trends, resulting in improved team performance and reduced turnover by 25%<br>• Implemented new security protocols and compliance measures for financial sector regulations, ensuring 100% compliance with industry standards<br><br><strong>Web Developer</strong><br>Peer Computers Inc<br><em>Apr 2012 - Feb 2015</em><br><br>• Design and develop user-friendly websites, including work with both front-end and back-end coding for various industries<br>• Worked on modernizing legacy systems and databases to improve operational efficiency by 40%<br>• Provide adequate training to end users and maintain excellent documentation for all applications',
        x: 50,
        y: 290,
        width: 450,
        height: 520
      },
      
      // Skills section in right column
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong>GENERAL SKILLS</strong><br><br>Leadership<br>Cybersecurity<br>Digital Transformation<br>Vendor Management<br>IT Project Management<br>Recruiting & Management<br>Communication<br>Budget Planning<br>Artificial Intelligence and Machine Learning',
        x: 520,
        y: 180,
        width: 220,
        height: 220
      },
      
      // Certifications section
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong>CERTIFICATIONS AND MEMBERSHIPS</strong><br><br>Member of the Global CIO Forum (2019 - Present)<br><br>Certified Information Security Manager (CISM)<br><br>Certified Information Privacy Professional (CIPP)<br><br>Certified ScrumMaster (CSM)',
        x: 520,
        y: 420,
        width: 220,
        height: 160
      },
      
      // Languages section
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong>LANGUAGES</strong><br><br>English — Native<br>French — Conversational<br>Spanish — Basic',
        x: 520,
        y: 600,
        width: 220,
        height: 100
      },
      
      // Education section
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong>EDUCATION</strong><br><br><strong>MSc in Technology Management</strong><br>Columbia University, NY<br><em>2010 - 2012</em><br><br><strong>BS in Computer Science</strong><br>Stanford University, CA<br><em>2006 - 2010</em>',
        x: 50,
        y: 830,
        width: 450,
        height: 140
      },
      
      // Interests section
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong>INTERESTS</strong><br><br>🎵 Music<br>🎯 Chess<br>🚴 Hiking<br>⚡ Renewable Energy',
        x: 520,
        y: 720,
        width: 220,
        height: 120
      }
    ])
    
    // Auto-fit borders to content after template is loaded
    autoFitSectionBorders();
  }

  const handleProfessionalTemplate = () => {
    setTemplateModalOpen(false)
    // Store current sections before clearing (for undo functionality)
    if (sections.length > 0) {
      setSectionsHistory(prev => [...prev, sections])
    }
    
    // Add Professional template sections with comprehensive content and proper positioning - using blue color for all titles
    setSections([
      // Header section
      {
        id: uuidv4(),
        type: 'header',
        name: 'JONATHAN PARKER',
        jobTitle: 'SENIOR SOFTWARE ENGINEER',
        content: `<h2 style="margin: 0 0 2px 0; font-size: 20px; font-weight: bold">JONATHAN PARKER</h2><p style="margin: 0; font-size: 16px">SENIOR SOFTWARE ENGINEER</p>`,
        x: 50,
        y: 30,
        width: 450,
        height: 80
      },
      
      // Contact information
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong style="color: #2B6CB0;">CONTACT</strong><br><br>jonathan.parker@email.com<br>+1 (555) 123-4567<br>linkedin.com/in/jonathanparker<br>github.com/jparker<br>San Francisco, CA',
        x: 520,
        y: 30,
        width: 220,
        height: 150
      },
      
      // Professional Summary
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong style="color: #2B6CB0;">PROFESSIONAL SUMMARY</strong><br><br>Results-driven Software Engineer with 7+ years of experience building scaleable web applications and leading development teams. Specialized in modern JavaScript frameworks and cloud architecture. Proven track record of delivering high-performance solutions that drive business growth and improve user experiences.',
        x: 50,
        y: 130,
        width: 450,
        height: 140
      },
      
      // Work Experience (increased height)
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong style="color: #2B6CB0;">PROFESSIONAL EXPERIENCE</strong><br><br><strong>LEAD FRONT-END DEVELOPER</strong><br>Tech Innovations Inc.<br><em>Jan 2020 - Present</em><br><br>• Led frontend development for flagship SaaS application reaching 500,000+ users<br>• Managed team of 6 developers, increasing deployment efficiency by 40%<br>• Implemented CI/CD pipeline using Jenkins and Docker, reducing integration time by 65%<br>• Architected responsive web applications using React, Redux, and TypeScript<br><br><strong>SOFTWARE ENGINEER</strong><br>DataLoop Solutions<br><em>Mar 2017 - Dec 2019</em><br><br>• Developed scalable microservices architecture using Node.js and Express<br>• Optimized database queries and implemented caching strategies, improving application response time by 30%<br>• Collaborated with UX team to implement responsive design patterns and improve user engagement by 25%<br>• Built RESTful APIs and integrated third-party services to enhance application functionality<br><br><strong>JUNIOR DEVELOPER</strong><br>StartupCorp<br><em>Jun 2016 - Feb 2017</em><br><br>• Developed and maintained web applications using HTML5, CSS3, and JavaScript<br>• Participated in agile development processes and daily stand-ups<br>• Contributed to code reviews and testing procedures to ensure high-quality deliverables',
        x: 50,
        y: 290,
        width: 450,
        height: 480
      },
      
      // Skills section (increased height)
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong style="color: #2B6CB0;">TECHNICAL SKILLS</strong><br><br><strong>Programming Languages:</strong><br>JavaScript/TypeScript, Python, Java, C++<br><br><strong>Frontend Technologies:</strong><br>React, Redux, Vue.js, Angular, HTML5, CSS3, SASS<br><br><strong>Backend Technologies:</strong><br>Node.js, Express.js, Django, Spring Boot<br><br><strong>Cloud & DevOps:</strong><br>AWS, Azure, Docker, Kubernetes, Jenkins<br><br><strong>Databases:</strong><br>MongoDB, PostgreSQL, MySQL, Redis<br><br><strong>Tools & Methodologies:</strong><br>Git, Agile/Scrum, RESTful APIs, GraphQL, CI/CD',
        x: 520,
        y: 200,
        width: 220,
        height: 320
      },
      
      // Education
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong style="color: #2B6CB0;">EDUCATION</strong><br><br><strong>Master of Computer Science</strong><br>University of Technology<br><em>2015 - 2017</em><br>GPA: 3.9/4.0<br>Specialization in Distributed Systems<br><br><strong>Bachelor of Software Engineering</strong><br>State University<br><em>2011 - 2015</em><br>Magna Cum Laude',
        x: 50,
        y: 790,
        width: 450,
        height: 160
      },
      
      // Certifications
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong style="color: #2B6CB0;">CERTIFICATIONS</strong><br><br>• AWS Certified Solutions Architect<br>• Google Cloud Professional Developer<br>• Certified Scrum Master (CSM)<br>• MongoDB Certified Developer<br>• Oracle Certified Professional',
        x: 520,
        y: 540,
        width: 220,
        height: 150
      },
      
      // Projects/Achievements
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong style="color: #2B6CB0;">KEY ACHIEVEMENTS</strong><br><br>• Reduced application load time by 50% through performance optimization<br>• Led migration of legacy systems to modern cloud architecture<br>• Mentored 12+ junior developers across multiple projects<br>• Speaker at 3 industry conferences on modern web development',
        x: 520,
        y: 710,
        width: 220,
        height: 140
      }
    ])
    
    // Auto-fit borders to content after template is loaded
    autoFitSectionBorders();
  }

  // Add missing functions
  const handleIconSelected = (iconHtml: string) => {
    // Add the icon as a text section
    const newSection: TextSection = {
        id: uuidv4(),
      type: 'text',
      content: iconHtml,
      x: 100,
      y: 100,
      width: 50,
      height: 50
    };
    setSections(prev => [...prev, newSection]);
  };

  const handleUndo = () => {
    if (sectionsHistory.length > 0) {
      const previousState = sectionsHistory[sectionsHistory.length - 1];
      setSections(previousState);
      setSectionsHistory(prev => prev.slice(0, -1));
    }
  };

  // Generate QR Code for Resume Verification
  const handleGenerateQR = async () => {
    if (!sections || sections.length === 0) {
      alert('Please add some content to your resume before generating QR code');
      return;
    }

    try {
      setQrLoading(true);

      // Get user info from profile or session
      const userInfo = {
        fullName: profile?.userId?.username || session?.user?.name || 'Anonymous User',
        email: profile?.userId?.email || session?.user?.email || 'anonymous@example.com',
        phone: '', // Phone not available in current profile structure
        profession: profile?.type || 'Professional'
      };

      // Check if user already has an NFT stored locally
      const userKey = `nft_${userInfo.email}`;
      const existingNFT = localStorage.getItem(userKey);
      
      if (existingNFT) {
        // User already has an NFT, use existing one
        const nftData = JSON.parse(existingNFT);
        console.log('✅ Using existing NFT:', nftData.nftId);
        
        // Generate QR code for Hedera explorer
        const hederaExplorerUrl = `https://hashscan.io/testnet/token/${nftData.nftId}`;
        const qrDataUrl = await QRCode.toDataURL(hederaExplorerUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrVerificationUrl(hederaExplorerUrl);
        setQrNftId(nftData.nftId);
        setQrModalOpen(true);
        return;
      }

      // User doesn't have an NFT yet, create new one
      console.log('🔄 Creating new NFT for user...');
      
      const response = await nftService.createResumeNFT({
        resumeData: sections,
        userInfo
      });

      if (response.success) {
        console.log('✅ NFT created successfully:', response.nftId);
        
        // Store NFT data locally for future use
        const nftData = {
          nftId: response.nftId,
          verificationUrls: response.verificationUrls,
          createdAt: new Date().toISOString(),
          userInfo: userInfo
        };
        localStorage.setItem(userKey, JSON.stringify(nftData));

        // Use Hedera explorer URL for QR code
        const hederaExplorerUrl = response.verificationUrls.hedera;
        const qrDataUrl = await QRCode.toDataURL(hederaExplorerUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrVerificationUrl(hederaExplorerUrl);
        setQrNftId(response.nftId);
        setQrModalOpen(true);
        showToast('Resume NFT created successfully on Hedera blockchain!', 'success');
      } else {
        throw new Error(response.message || 'Failed to create NFT');
      }
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      const errorMessage = error?.message || 'Failed to create blockchain verification';
      alert(`Error: ${errorMessage}`);
      showToast('Failed to create blockchain verification', 'error');
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    const loadResume = async () => {
      try {
        const token = getAuthToken();
        
        if (token) {
          try {
            // Direct call to backend to fetch resumes
            const response = await fetch(`${backendUrl}/resume/getResumes`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const resumes = await response.json();
              if (resumes && resumes.length > 0) {
                setSections(resumes[0].sections);
                setResumeId(resumes[0]._id);
                return;
              }
            } else {
              const error = await response.text();
              console.error('Failed to load resumes:', error);
              showToast('Failed to load resumes from server', 'error');
            }
          } catch (fetchError) {
            console.error('Error fetching resumes:', fetchError);
            showToast('Error connecting to server', 'error');
          }
        }

        // Fallback to localStorage
        const draft = localStorage.getItem('resume-draft');
        if (draft) {
          try {
            setSections(JSON.parse(draft));
          } catch (parseError) {
            console.warn('Could not parse resume draft:', parseError);
            setTemplateModalOpen(true);
          }
        } else {
          setTemplateModalOpen(true);
        }
      } catch (error) {
        console.error('Error loading resume:', error);
        showToast('Error loading resume', 'error');
        setTemplateModalOpen(true);
      }
    };

    // Check if we should load resumes
    const hasToken = getAuthToken();
    if (hasToken) {
      loadResume();
    } else {
      // No auth token available, check for local draft
      const draft = localStorage.getItem('resume-draft');
      if (draft) {
        try {
          setSections(JSON.parse(draft));
        } catch {
          console.warn('Could not parse resume draft');
          setTemplateModalOpen(true);
        }
      } else {
        setTemplateModalOpen(true);
      }
    }
  }, []); // Run once on mount using localStorage token

  useEffect(() => {
    dispatch(getMyProfile())
  }, [dispatch])

  return (
    <div className={styles.pageWrapper}>
      {/* Top Bar with Actions */}
      <ResumeActions 
        onSaveDraft={saveDraft}
        onExportPDF={exportToPDF}
        onChangeTemplate={() => setTemplateModalOpen(true)}
        onUndo={handleUndo}
        onGenerateQR={handleGenerateQR}
        canUndo={sectionsHistory.length > 0}
        sectionsCount={sections.length}
      />

      {/* Back Button */}
      <IconButton
        onClick={() => router.push('/dashboardCandidate')}
        sx={{
          position: "fixed",
          left: isMobile ? 20 : 300,
          top: 70,
          zIndex: 1000,
          bgcolor: theme.palette.background.paper,
          color: 'primary.main',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'rgba(25, 118, 210, 0.08)',
          }
        }}
        aria-label="back to dashboard"
        size="small"
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>

      {/* Content Area */}
      <div className={`${styles.contentWrapper} ${((drawerOpen || iconsSidebarOpen) && !isMobile) ? styles.sidebarOpen : ''}`}>
        {isMobile ? (
          <>
            {/* Mobile Buttons */}
            <IconButton
              onClick={() => {
                setIconsSidebarOpen(false);
                setDrawerOpen(true);
              }}
              sx={{ position: "fixed", left: 8, top: 68 }}
            >
              <WidgetsIcon />
            </IconButton>
            
            <IconButton
              onClick={() => {
                setDrawerOpen(false);
                setIconsSidebarOpen(true);
              }}
              sx={{ position: "fixed", left: 60, top: 68 }}
            >
              <EmojiEmotionsIcon />
            </IconButton>
            
            {/* Mobile Elements Drawer */}
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              <Sidebar onAdd={addSection} />
            </Drawer>
            
            {/* Mobile Icons Drawer */}
            <Drawer
              anchor="left"
              open={iconsSidebarOpen}
              onClose={() => setIconsSidebarOpen(false)}
            >
              <IconsSidebar onSelectIcon={handleIconSelected} />
            </Drawer>
          </>
        ) : (
          <>
            {/* Elements Button */}
            <button 
              className={styles.elementsButton}
              onClick={() => {
                setIconsSidebarOpen(false); // Close icons sidebar
                setDrawerOpen(true);
              }}
            >
              <WidgetsIcon />
              <span>Elements</span>
            </button>

            {/* Icons Button */}
            <button 
              className={styles.iconsButton}
              onClick={() => {
                setDrawerOpen(false); // Close elements sidebar
                setIconsSidebarOpen(true);
              }}
            >
              <EmojiEmotionsIcon />
              <span>Icons</span>
            </button>
            
            {/* Desktop Elements Sidebar */}
            <div 
              className={`${styles.sidebar} ${drawerOpen ? styles.open : ''}`}
            >
              <Sidebar onAdd={addSection} onClose={() => setDrawerOpen(false)} />
            </div>

            {/* Desktop Icons Sidebar */}
            <div 
              className={`${styles.iconsSidebar} ${iconsSidebarOpen ? styles.open : ''}`}
            >
              <IconsSidebar onSelectIcon={handleIconSelected} onClose={() => setIconsSidebarOpen(false)} />
            </div>
          </>
        )}

        <Canvas zoom={zoom} clearSelection={() => setActiveId(null)}>
          {sections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              updateContent={updateSectionContent}
              updatePosition={updateSectionPosition}
              onDelete={deleteSection}
              onDuplicate={duplicateSection}
              isActive={section.id === activeId}
              onClick={() => setActiveId(section.id)}
              zoom={zoom}
            />
          ))}
        </Canvas>
      </div>

      <ZoomControls
        zoom={zoom}
        setZoom={setZoom}
      />

      {/* Template Modal */}
      <Dialog
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        fullWidth
        maxWidth="md"
        disableEnforceFocus={false}
        disableAutoFocus={false}
        disableRestoreFocus={false}
        keepMounted={false}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            borderRadius: '12px'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Choose a Template</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              Select a template to start building your resume
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 3
            }}>
              {/* Blank Template */}
              <Paper 
                onClick={handleBlankTemplate}
                sx={{ 
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)'
                  },
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ 
                  height: '200px', 
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666'
                }}>
                  <Typography variant="h6">Blank Template</Typography>
                  </Box>
                <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Start from Scratch
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Build your resume from a blank canvas
                  </Typography>
                </Box>
              </Paper>

              {/* Canadian Template */}
              <Paper 
                onClick={handleCanadianTemplate}
                sx={{ 
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)'
                  },
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ 
                  height: '200px', 
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666'
                }}>
                  <Typography variant="h6">Canadian Template</Typography>
                  </Box>
                <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Canadian Style
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Professional template for Canadian job market
                  </Typography>
                </Box>
              </Paper>

              {/* Professional Template */}
              <Paper 
                onClick={handleProfessionalTemplate}
                sx={{ 
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)'
                  },
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ 
                  height: '200px', 
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666'
                }}>
                  <Typography variant="h6">Professional Template</Typography>
                    </Box>
                <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Professional
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Clean and professional design
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => setTemplateModalOpen(false)} 
            variant="outlined"
            sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Modal */}
      <QRCodeModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        verificationUrl={qrVerificationUrl}
        nftId={qrNftId}
        loading={qrLoading}
        error={qrError}
      />

      {/* Toast notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  )
}
