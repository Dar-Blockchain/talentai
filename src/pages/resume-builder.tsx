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
import { getMyProfile } from "@/store/features/profileSlice"
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

  // New state for debug dialog
  const [debugDialogOpen, setDebugDialogOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<{
    session: any,
    token: string | null,
    resumeId: string | null,
    hasLocalStorage: boolean
  }>({
    session: null,
    token: null,
    resumeId: null,
    hasLocalStorage: false
  })

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

  // Function to update debug info
  const updateDebugInfo = () => {
    setDebugInfo({
      session: session,
      token: getAuthToken(),
      resumeId: resumeId,
      hasLocalStorage: !!localStorage.getItem('resume-draft')
    });
  }

  // Base URL for backend API (normalize to remove trailing slash)
  const rawBackendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  const backendUrl = rawBackendUrl.replace(/\/+$/, '');

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
    // Add Canadian template sections with the same text as in the preview
    setSections([
      {
        id: uuidv4(),
        type: 'header',
        name: 'YOUR NAME',
        jobTitle: 'Professional Title',
        x: 100,
        y: 50,
        width: 400,
        height: 100
      },
      {
        id: uuidv4(),
        type: 'text',
        content: 'PROFESSIONAL SUMMARY\n\nExperienced professional with a proven track record of success in delivering high-quality results. Skilled in problem-solving and teamwork.',
        x: 100,
        y: 180,
        width: 400,
        height: 120
      },
      {
        id: uuidv4(),
        type: 'experience',
        title: 'Job Title',
        company: 'Company Name',
        startDate: '2020',
        endDate: 'Present',
        description: '• Developed and implemented successful strategies\n• Collaborated with cross-functional teams',
        x: 100,
        y: 320,
        width: 400,
        height: 150
      },
      {
        id: uuidv4(),
        type: 'education',
        institution: 'University Name',
        degree: 'Degree Name',
        startDate: '2016',
        endDate: '2020',
        description: 'Relevant coursework and achievements',
        x: 100,
        y: 490,
        width: 400,
        height: 120
      },
      // Only one skills section
      {
        id: uuidv4(),
        type: 'skills',
        skills: ['JavaScript', 'React', 'Node.js'],
        x: 520,
        y: 180,
        width: 250,
        height: 150
      },
      {
        id: uuidv4(),
        type: 'languages',
        languages: [
          { name: "English", level: "Native" },
          { name: "French", level: "Intermediate" }
        ],
        x: 520,
        y: 350,
        width: 250,
        height: 120
      },
      {
        id: uuidv4(),
        type: 'text',
        content: 'CONTACT\n\nemail@example.com\n(123) 456-7890',
        x: 520,
        y: 50,
        width: 250,
        height: 110
      }
    ])
  }

  const handleProfessionalTemplate = () => {
    setTemplateModalOpen(false)
    // Add Professional template sections with the same text as in the preview
    setSections([
      {
        id: uuidv4(),
        type: 'header',
        name: 'JONATHAN PARKER',
        jobTitle: 'SENIOR SOFTWARE ENGINEER',
        x: 100,
        y: 50,
        width: 400,
        height: 100
      },
      {
        id: uuidv4(),
        type: 'text',
        content: 'RESULTS-DRIVEN SOFTWARE ENGINEER WITH 7+ YEARS OF EXPERIENCE BUILDING SCALEABLE WEB APPLICATIONS AND LEADING DEVELOPMENT TEAMS. SPECIALIZED IN MODERN JAVASCRIPT FRAMEWORKS AND CLOUD ARCHITECTURE.',
        x: 100,
        y: 180,
        width: 400,
        height: 120
      },
      {
        id: uuidv4(),
        type: 'experience',
        title: 'LEAD FRONT-END DEVELOPER',
        company: 'TECH INNOVATIONS INC.',
        startDate: '2020',
        endDate: 'PRESENT',
        description: '• Led frontend development for flagship SaaS application reaching 500,000+ users\n• Managed team of 6 developers, increasing deployment efficiency by 40%\n• Implemented CI/CD pipeline, reducing integration time by 65%',
        x: 100,
        y: 320,
        width: 400,
        height: 150
      },
      {
        id: uuidv4(),
        type: 'experience',
        title: 'SOFTWARE ENGINEER',
        company: 'DATALOOP SOLUTIONS',
        startDate: '2017',
        endDate: '2020',
        description: '• Developed scalable microservices architecture using Node.js\n• Optimized database queries, improving application response time by 30%\n• Collaborated with UX team to implement responsive design patterns',
        x: 100,
        y: 500,
        width: 400,
        height: 150
      },
      {
        id: uuidv4(),
        type: 'education',
        institution: 'UNIVERSITY OF TECHNOLOGY',
        degree: 'MASTER OF COMPUTER SCIENCE',
        startDate: '2015',
        endDate: '2017',
        description: 'GPA: 3.9/4.0\nSpecialization in Distributed Systems',
        x: 520,
        y: 320,
        width: 250,
        height: 120
      },
      // Only one skills section
      {
        id: uuidv4(),
        type: 'skills',
        skills: ['JavaScript/TypeScript', 'React/Redux', 'Node.js', 'AWS/Cloud', 'CI/CD', 'RESTful & GraphQL APIs'],
        x: 520,
        y: 460,
        width: 250,
        height: 190
      },
      {
        id: uuidv4(),
        type: 'text',
        content: 'CONTACT\n\njonathan.parker@email.com\n+1 (555) 123-4567\nlinkedin.com/in/jonathanparker\ngithub.com/jparker',
        x: 520,
        y: 50,
        width: 250,
        height: 100
      },
      {
        id: uuidv4(),
        type: 'text',
        content: 'CERTIFICATIONS\n\n• AWS Certified Solutions Architect\n• Google Cloud Professional Developer\n• Certified Scrum Master',
        x: 520,
        y: 170,
        width: 250,
        height: 130
      }
    ])
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
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            borderRadius: '12px'
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
