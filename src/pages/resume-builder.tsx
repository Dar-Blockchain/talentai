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
import { useSession } from "next-auth/react"
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { useRouter } from 'next/router'
import FrenchDataCV from '@/components/templates/FrenchDataCV'
import ReactDOM from 'react-dom/client'
import BugReportIcon from '@mui/icons-material/BugReport'
import LinkedInIcon from '@mui/icons-material/LinkedIn'

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
      width: 400,
      height: 100,
    }

    let newSection: SectionType

    switch (type) {
      case 'header':
        newSection = {
          ...common,
          type: 'header',
          name: profile.userId.username || 'Your Name',
          jobTitle: profile.type || 'Your Title'
        } as HeaderSection
        break
      case 'text':
        newSection = {
          ...common,
          type: 'text',
          content: 'Editable text...'
        } as TextSection
        break
      case 'skills':
        newSection = {
          ...common,
          type: 'skills',
          skills: profile.skills.map(skill => skill.name)
        } as SkillsSection
        break
      case 'languages':
        newSection = {
          ...common,
          type: 'languages',
          languages: [{ name: "Add language", level: "level" }]
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
          description: 'Education description...'
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
          description: 'Job description...'
        } as ExperienceSection
        break
      case 'projects':
        newSection = {
          ...common,
          type: 'projects',
          projects: [{ name: 'Project Name', description: 'Project description...' }]
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
          width: 100,
          height: 100
        } as ImageSection
        break
      case 'line':
        newSection = {
          ...common,
          type: 'line' as const,
          orientation: 'horizontal',
          thickness: 3,
          color: '#556fb5',
          height: 20,
          width: 700,
          content: `<div style="width:100%;height:3px;background-color:#556fb5;margin-top:3px;margin-bottom:3px;"></div>`
        } as LineSection
        break
      case 'custom':
      default:
        newSection = {
          ...common,
          type: 'custom',
          content: 'Write anything here...'
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

  const handleFrenchTemplate = () => {
    setTemplateModalOpen(false);
    
    // Create exact sections matching the user's data
    setSections([
      // Header section
      {
        id: uuidv4(),
        type: 'header' as const,
        name: 'John Smith',
        jobTitle: 'Senior Data Scientist',
        content: "<h2 style=\"margin: 0; font-size: 22px; font-weight: bold; color: #5170b7;\">John Smith</h2><p style=\"margin: 0; font-size: 16px; color: #333;\">Senior Data Scientist</p>",
        height: 100,
        width: 400,
        x: 31.99999999999998,
        y: 8.66666666666656
      },
      
      // Contact section
      {
        id: uuidv4(),
        type: 'text' as const,
        content: "<strong style=\"color: #5170b7; text-transform: uppercase; font-size: 16px;\">Contact</strong><div style=\"margin-top: 8px;\"><p style=\"margin: 4px 0;\">📍 New York, USA          <span style=\"background-color: transparent; font-size: 16px; letter-spacing: -0.01em;\">📱 +1 (555) 123-4567         </span><span style=\"background-color: transparent; font-size: 16px; letter-spacing: -0.01em;\">📧 john.smith@example.com</span></p><p style=\"margin: 4px 0;\">    linkedin.com/in/johnsmith                      <span style=\"background-color: transparent; font-size: 16px; letter-spacing: -0.01em;\">github.com/johnsmith</span></p></div>",
        height: 185,
        width: 733,
        x: 36.99999999999999,
        y: 111.33333333333327
      },
      
      // Professional Summary
      {
        id: uuidv4(),
        type: 'text' as const,
        content: "<strong style=\"color: #5170b7; text-transform: uppercase; font-size: 16px;\">Professional Summary</strong><p style=\"margin-top: 8px; line-height: 1.5;\">Data Scientist with over 5 years of experience in data analysis and development of artificial intelligence algorithms. Expertise in machine learning, deep learning, and processing large datasets. Results-oriented with a strong team spirit and proven leadership abilities.</p>",
        height: 159,
        width: 745,
        x: 37.33333333333333,
        y: 234.00000000000014
      },
      
      // Professional Experience
      {
        id: uuidv4(),
        type: 'text' as const,
        content: "<strong style=\"color: #5170b7; text-transform: uppercase; font-size: 16px;\">Professional Experience</strong><div style=\"margin-top: 8px;\"><div style=\"margin-bottom: 15px;\"><strong>Senior Data Scientist</strong><br><span style=\"color: #5170b7;\">Tech Innovations Inc. • New York, USA</span><br><em style=\"font-size: 12px; color: #666;\">January 2020 - Present</em><ul style=\"margin-top: 5px; padding-left: 20px;\"><li>Implemented a recommendation system that increased sales by 23%</li><li>Led a team of 5 junior data scientists</li><li>Reduced data processing time by 40%</li></ul></div><div><strong>Data Science Intern</strong><br><span style=\"color: #5170b7;\">Global Analytics • San Francisco, USA</span><br><em style=\"font-size: 12px; color: #666;\">June 2019 - December 2019</em><ul style=\"margin-top: 5px; padding-left: 20px;\"><li>Created a real-time data visualization dashboard</li><li>Developed a prediction algorithm with 88% accuracy</li></ul></div></div>",
        height: 329,
        width: 669,
        x: 28,
        y: 620.0006666666663
      },
      
      // Education
      {
        id: uuidv4(),
        type: 'text' as const,
        content: "<strong style=\"color: #5170b7; text-transform: uppercase; font-size: 16px;\">Education</strong><div style=\"margin-top: 8px;\"><div style=\"margin-bottom: 15px;\"><strong>Master of Science in Computer Science</strong><br><span style=\"color: #5170b7;\">MIT • AI Specialization</span><br><em style=\"font-size: 12px; color: #666;\">2017 - 2019</em><p style=\"margin-top: 5px; margin-bottom: 0;\">GPA: 3.95/4.0, Thesis on neural network optimization</p></div><div><strong>Bachelor of Science in Data Science</strong><br><span style=\"color: #5170b7;\">Stanford University • Computer Science</span><br><em style=\"font-size: 12px; color: #666;\">2013 - 2017</em><p style=\"margin-top: 5px; margin-bottom: 0;\">Graduated with honors</p></div></div>",
        height: 258,
        width: 644,
        x: 36.66666666666666,
        y: 377.3333333333323
      },
      
      // Languages
      {
        id: uuidv4(),
        type: 'text' as const,
        content: "<strong style=\"color: #5170b7; text-transform: uppercase; font-size: 16px;\">Languages</strong><div style=\"margin-top: 8px;\"><div style=\"display: flex; justify-content: space-between; margin-bottom: 5px;\"><span>English</span><span>Native</span></div><div style=\"display: flex; justify-content: space-between; margin-bottom: 5px;\"><span>Spanish</span><span>Fluent (C1)</span></div><div style=\"display: flex; justify-content: space-between; margin-bottom: 5px;\"><span>German</span><span>Intermediate (B1)</span></div></div>",
        height: 120,
        width: 250,
        x: 485.3333333333333,
        y: 615.333333333334
      },
      
      // Certifications
      {
        id: uuidv4(),
        type: 'text' as const,
        content: "<strong style=\"color: #5170b7; text-transform: uppercase; font-size: 16px;\">Certifications</strong><div style=\"margin-top: 8px;\"><div style=\"display: flex; justify-content: space-between; margin-bottom: 5px;\"><span>Google Professional Data Engineer</span><span>2022</span></div><div style=\"display: flex; justify-content: space-between; margin-bottom: 5px;\"><span>AWS Certified Machine Learning</span><span>2021</span></div><div style=\"display: flex; justify-content: space-between; margin-bottom: 5px;\"><span>Deep Learning Specialization</span><span>2020</span></div></div>",
        height: 194,
        width: 250,
        x: 482.66666666666674,
        y: 380.6666666666663
      },
      
      // LinkedIn icon (custom section)
      {
        id: uuidv4(),
        type: 'custom' as const,
        content: "<div style=\"display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; background-color: rgba(255, 255, 255, 0.8); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);\"><div style=\"display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"#0077b5\">\n        <path d=\"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z\"></path>\n      </svg>\n    </div></div>",
        height: 54,
        width: 43,
        x: 39.33333333333336,
        y: 168.66666666666646
      },
      
      // GitHub icon (custom section)
      {
        id: uuidv4(),
        type: 'custom' as const,
        content: "<div style=\"display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; background-color: rgba(255, 255, 255, 0.8); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);\"><div style=\"display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"#333333\">\n        <path d=\"M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12\"/>\n      </svg>\n    </div></div>",
        height: 60,
        width: 60,
        x: 272.66666666666674,
        y: 163.33333333333323
      },
      
      // Skills section
      ...(sections.some(section => section.type === 'skills') 
        ? [] 
        : [{
            id: uuidv4(),
            type: 'skills' as const,
            skills: ["React", "Python", "JavaScript", "Docker", "Node.js"],
            content: "<strong style=\"color: rgb(56, 123, 229);\">Skills</strong><strong style=\"color: rgb(19, 25, 216);\">:</strong><ul style=\"list-style-position: inside; padding-left: 0\"><li>React</li><li>Python</li><li>JavaScript</li><li>Docker</li><li>Node.js</li></ul>",
            height: 160,
            width: 727,
            x: 32.00000454682027,
            y: 937.3333333333339
          }])
    ]);
  };

  const handleDataScientistTemplate = () => {
    setTemplateModalOpen(false);
    
    // Check if profile is loaded
    if (!profile) {
      showToast('Profile not loaded. Using default template.', 'warning');
      return;
    }
    
    // Get user skills from profile
    const userSkills = profile.skills?.map(skill => skill.name) || ["Python", "Data Analysis", "Machine Learning", "SQL", "TensorFlow"];
    
    setSections([
      // Header section (Name and title)
      {
        id: uuidv4(),
        type: 'header' as const,
        x: 18.66666666666667,
        y: 6.666666666666667,
        width: 400,
        height: 100,
        name: profile.userId?.username || 'Khalil Troudi',
        jobTitle: profile.type || 'Data Scientist',
        content: `<h2 style="margin:0;font-size:28px;color:#556fb5;font-weight:600;">${profile.userId?.username || 'Khalil Troudi'}</h2><p style="margin:0;font-size:18px;color:#333;font-weight:400;">${profile.type || 'data scientist'}</p>`
      },
      
      // Education section (Formations)
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 458,
        y: 6.66666,
        width: 336,
        height: 327,
        content: "<div><strong style=\"font-size:18px;color:#556fb5;text-transform:uppercase;letter-spacing:0.5px;\">FORMATIONS</strong></div>"
      },
      
      // Formations line
      {
        id: uuidv4(),
        type: 'line' as const,
        x: 458.00000067545574,
        y: 33.33366777102141,
        width: 336,
        height: 67,
        orientation: 'horizontal',
        thickness: 3,
        color: '#556fb5',
        content: "<div style=\"width:100%;height:3px;background-color:#556fb5;margin-top:3px;margin-bottom:3px;\"></div>"
      },
      
      // Profile & Objective section
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 18.66666666666667,
        y: 98.6666666666667,
        width: 400,
        height: 156,
        content: "<div><strong style=\"font-size:18px;color:#556fb5;text-transform:uppercase;letter-spacing:0.5px;\">PROFIL & OBJECTIF</strong></div>"
      },
      
      // Profile line
      {
        id: uuidv4(),
        type: 'line' as const,
        x: 20.666633333333326,
        y: 124.66699999999987,
        width: 563,
        height: 40,
        orientation: 'horizontal',
        thickness: 3,
        color: '#556fb5',
        content: "<div style=\"width:100%;height:3px;background-color:#556fb5;margin-top:3px;margin-bottom:3px;\"></div>"
      },
      
      // Contact section
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 17.33333333333332,
        y: 240,
        width: 350,
        height: 141,
        content: "<div><strong style=\"font-size:18px;color:#556fb5;text-transform:uppercase;letter-spacing:0.5px;\">CONTACT</strong></div>"
      },
      
      // Horizontal line
      {
        id: uuidv4(),
        type: 'line' as const,
        x: 21.3333,
        y: 266.667,
        width: 563,
        height: 40,
        orientation: 'horizontal',
        thickness: 3,
        color: '#556fb5',
        content: "<div style=\"width:100%;height:3px;background-color:#556fb5;margin-top:3px;margin-bottom:3px;\"></div>"
      },
      
      // Professional Experience section
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 13.333333333333362,
        y: 397.3333333333332,
        width: 400,
        height: 349,
        content: "<div><strong style=\"font-size:18px;color:#556fb5;text-transform:uppercase;letter-spacing:0.5px;\">EXPÉRIENCES PROFESSIONNELLES</strong></div>"
      },
      
      // Experience line
      {
        id: uuidv4(),
        type: 'line' as const,
        x: 17.33330511360166,
        y: 424.66699400469656,
        width: 508,
        height: 47,
        orientation: 'horizontal',
        thickness: 3,
        color: '#556fb5',
        content: "<div style=\"width:100%;height:3px;background-color:#556fb5;margin-top:3px;margin-bottom:3px;\"></div>"
      },
      
      // Skills section - now using user's actual skills from profile
      {
        id: uuidv4(),
        type: 'skills' as const,
        x: 460.66702894973747,
        y: 334.66702405470596,
        width: 276,
        height: 176,
        skills: userSkills,
        content: `<strong style="color: rgb(13, 109, 211);">Skills:</strong><ul style="list-style-position: inside; padding-left: 0">${userSkills.map(skill => `<li>${skill}</li>`).join('')}</ul>`
      },
      
      // Skills line
      {
        id: uuidv4(),
        type: 'line' as const,
        x: 463.99996651933,
        y: 352.6669932380663,
        width: 269,
        height: 52,
        orientation: 'horizontal',
        thickness: 3,
        color: '#556fb5',
        content: "<div style=\"width:100%;height:3px;background-color:#556fb5;margin-top:3px;margin-bottom:3px;\"></div>"
      },
      
      // Interests section
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 456,
        y: 537.3333333333331,
        width: 250,
        height: 114,
        content: "<div><strong style=\"font-size:18px;color:#556fb5;text-transform:uppercase;letter-spacing:0.5px;\">CENTRES D'INTÉRÊT</strong></div>"
      },
      
      // Interests line
      {
        id: uuidv4(),
        type: 'line' as const,
        x: 457.99996651933,
        y: 560.0003265713995,
        width: 269,
        height: 52,
        orientation: 'horizontal',
        thickness: 3,
        color: '#556fb5',
        content: "<div style=\"width:100%;height:3px;background-color:#556fb5;margin-top:3px;margin-bottom:3px;\"></div>"
      },
      
      // Languages section
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 519.9999821980794,
        y: 778.0740966796877,
        width: 250,
        height: 145,
        content: "<div><strong style=\"font-size:18px;color:#556fb5;text-transform:uppercase;letter-spacing:0.5px;\">LANGUES</strong></div>"
      },
      
      // Languages line
      {
        id: uuidv4(),
        type: 'line' as const,
        x: 519.99996651933,
        y: 803.333659904733,
        width: 269,
        height: 52,
        orientation: 'horizontal',
        thickness: 3,
        color: '#556fb5',
        content: "<div style=\"width:100%;height:3px;background-color:#556fb5;margin-top:3px;margin-bottom:3px;\"></div>"
      },
      
      // Projects section
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 14.666666666666663,
        y: 774.6666666553384,
        width: 521,
        height: 284,
        content: "<div><strong style=\"font-size:18px;color:#556fb5;text-transform:uppercase;letter-spacing:0.5px;\">PROJET PERTINENT</strong></div>"
      },
      
      // Projects line
      {
        id: uuidv4(),
        type: 'line' as const,
        x: 15.333305113601668,
        y: 804.0003273380298,
        width: 508,
        height: 47,
        orientation: 'horizontal',
        thickness: 3,
        color: '#556fb5',
        content: "<div style=\"width:100%;height:3px;background-color:#556fb5;margin-top:3px;margin-bottom:3px;\"></div>"
      },
      
      // Add appropriate content sections after the titles and lines
      
      // Education content
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 458,
        y: 70,
        width: 336,
        height: 250,
        content: "<p style=\"margin-top:8px;font-size:14px;font-weight:500;\">3ème année cycle d'Ingénieur<br>Spécialité Architecture IT Et Cloud Computing<br><span style=\"color:#556fb5;font-style:italic;\">ESPRIT - École Sup Privée d'Ingénierie et de Technologies</span><br><span style=\"color:#666;font-style:italic;\">(Sept. 2022- Présent)</span></p><p style=\"margin:12px 0;font-size:14px;font-weight:500;\">Bachelor en Big data et analyse des données<br><span style=\"color:#556fb5;font-style:italic;\">Institut supérieur des arts multimédia de La Manouba</span><br><span style=\"color:#666;font-style:italic;\">(Sept. 2019- Juin 2022)</span></p><p style=\"margin:12px 0;font-size:14px;font-weight:500;\">Baccalauréat en Informatique<br><span style=\"color:#556fb5;font-style:italic;\">Lycée Bechir Nabheni</span><br><span style=\"color:#666;font-style:italic;\">(Sept. 2015- Juil. 2019)</span></p>"
      },
      
      // Profile content
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 18.66666666666667,
        y: 164.6666666666667,
        width: 400,
        height: 70,
        content: "<p style=\"margin-top:8px;font-size:14px;line-height:1.5;\">Passionné par l'innovation basée sur les données et les technologies web. Compétences solides en analyse de données, machine learning, et développement full-stack, recherche un stage PFE de 6 mois pour contribuer aux projets de transformation digitale.</p>"
      },
      
      // Contact content
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 17.33333333333332,
        y: 295,
        width: 350,
        height: 86,
        content: "<p style=\"margin:8px 0;font-size:14px;line-height:1.6;\"><span style=\"color:#556fb5;margin-right:5px;\">📱</span> +216 53508615<br><span style=\"color:#556fb5;margin-right:5px;\">📧</span> khalil.troudi@esprit.tn<br><span style=\"color:#556fb5;margin-right:5px;\">🔗</span> www.linkedin.com/in/TroudiKhalil<br><span style=\"color:#556fb5;margin-right:5px;\">👤</span> 24 ans, 12/07/2000</p>"
      },
      
      // Experience content
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 13.333333333333362,
        y: 471.3333333333332,
        width: 400,
        height: 275,
        content: "<div style=\"margin-top:8px;font-size:14px;\"><div><strong>Data Scientist</strong><br><span style=\"color:#556fb5;\">Opencertif</span>, Stage, Remote <span style=\"color:#666;font-style:italic;\">(juillet 2024 - septembre 2024)</span><ul style=\"margin-top:5px;padding-left:20px;list-style-type:square;color:#556fb5;\"><li><span style=\"color:#333;\">Analyse et prétraitement des données financières sur la période 2022-2024, avec une évaluation approfondie des gains et pertes.</span></li><li><span style=\"color:#333;\">Conception et développement de tableaux de bord interactifs sous Power BI pour visualiser la rétention des clients.</span></li></ul></div><div style=\"margin-top:15px;\"><strong>Data Scientist</strong><br><span style=\"color:#556fb5;\">BFI GROUPE</span>, Stage, Tunisie <span style=\"color:#666;font-style:italic;\">(Fév. 2022 - juin 2022)</span><ul style=\"margin-top:5px;padding-left:20px;list-style-type:square;color:#556fb5;\"><li><span style=\"color:#333;\">Prétraitement des données avec suppression des valeurs aberrantes, clustering avec k-means et visualisation.</span></li></ul></div></div>"
      },
      
      // Interests content
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 456,
        y: 612.3333333333331,
        width: 250,
        height: 65,
        content: "<ul style=\"margin-top:8px;padding-left:20px;font-size:14px;list-style-type:square;color:#556fb5;\"><li><span style=\"color:#333;\">Technologie</span></li><li><span style=\"color:#333;\">Sport</span></li><li><span style=\"color:#333;\">Gaming</span></li></ul>"
      },
      
      // Languages content
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 519.9999821980794,
        y: 855.0740966796877,
        width: 250,
        height: 96,
        content: "<div style=\"margin-top:8px;font-size:14px;\"><div style=\"display:flex;justify-content:space-between;margin-bottom:5px;\"><span>Français</span><span>Compétence professionnelle</span></div><div style=\"display:flex;justify-content:space-between;margin-bottom:5px;\"><span>Anglais</span><span>Compétence professionnelle</span></div><div style=\"display:flex;justify-content:space-between;\"><span>Arabe</span><span>Compétence native</span></div></div>"
      },
      
      // Projects content
      {
        id: uuidv4(),
        type: 'text' as const,
        x: 14.666666666666663,
        y: 851.6666666553384,
        width: 521,
        height: 207,
        content: "<div style=\"margin-top:8px;font-size:14px;\"><strong>Gestion des risques</strong><ul style=\"margin-top:5px;padding-left:20px;list-style-type:square;color:#556fb5;\"><li><span style=\"color:#333;\">Analyse des données de transactions de devises EUR/TND, calcul du risque d'exposition et élaboration de tableaux de bord via Excel.</span></li></ul><strong style=\"margin-top:15px;display:block;\">Analyse des données de location immobilière</strong><ul style=\"margin-top:5px;padding-left:20px;list-style-type:square;color:#556fb5;\"><li><span style=\"color:#333;\">Prétraitement et analyse des données: gestion des valeurs nulles et identification des relations entre les variables.</span></li><li><span style=\"color:#333;\">Identification de la loi de probabilité de la variable cible et développement d'un modèle prédictif.</span></li></ul></div>"
      }
    ]);
  };

  // Add an undo function
  const handleUndo = () => {
    if (sectionsHistory.length > 0) {
      // Get the last state from history
      const lastState = sectionsHistory[sectionsHistory.length - 1];
      
      // Restore that state
      setSections(lastState);
      
      // Remove the used state from history
      setSectionsHistory(prev => prev.slice(0, -1));
    }
  }

  // Update the handleIconSelected function with improved styling
  const handleIconSelected = (iconHtml: string) => {
    // Calculate a reasonable position for the new icon
    // We'll place it in the center of the visible area by default
    const canvasCenter = { x: 400, y: 300 };
    
    // Generate a unique ID for the new section
    const newIconId = uuidv4();
    
    // Create a new custom section containing just the icon with improved styling
    const newIconSection = {
      id: newIconId,
      type: 'custom' as const,
      x: canvasCenter.x - 30, // Center the icon
      y: canvasCenter.y - 30,
      width: 60,  // Slightly larger for better visibility
      height: 60, // Slightly larger for better visibility
      content: `<div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; background-color: rgba(255, 255, 255, 0.8); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${iconHtml}</div>`
    };
    
    // Add the new icon section to the sections array
    setSections(prev => [...prev, newIconSection]);
    
    // Select the newly created icon section
    setActiveId(newIconId);
  };

  const handleRegenerate = async () => {
    try {
      if (!prompt.trim()) {
        alert('Please enter a description about yourself');
        return;
      }

      setIsRegenerating(true);
      
      // First try direct API call to backend
      try {
        // Get the auth token from the session
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }
        
        // Direct call to backend API, ensuring proper URL formatting
        const apiUrl = `${backendUrl}/resume/regenerate`.replace(/([^:]\/\/)\/+/g, "$1");
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            block: 'bio', 
            content: prompt 
          }),
        });
        
        if (!response.ok) {
          throw new Error('Direct API call failed');
        }
        
        const data = await response.json();
        
        if (data.content) {
          // Create a new text section with the content
          const newSection = {
            id: uuidv4(),
            type: 'text' as const,
            content: data.content,
            x: 100,
            y: 100,
            width: 400,
            height: 300
          } as TextSection;
          
          setSections(prev => [...prev, newSection]);
          setRegenerateModalOpen(false);
          setPrompt('');
          setIsRegenerating(false);
          return;
        }
      } catch (directError) {
        console.log('Direct API call failed, trying through Next.js API route', directError);
        // Continue to the Next.js API route if direct call fails
      }
      
      // Call through Next.js API route as fallback
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await fetch(`${backendUrl}/resume/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          block: 'bio',
          content: prompt 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to regenerate resume content');
      }
      
      const data = await response.json();
      
      if (data.content) {
        // Create a new text section with the content
        const newSection = {
          id: uuidv4(),
          type: 'text' as const,
          content: data.content,
          x: 100,
          y: 100,
          width: 400,
          height: 300
        } as TextSection;
        
        setSections(prev => [...prev, newSection]);
        setRegenerateModalOpen(false);
        setPrompt('');
      }
    } catch (error: any) {
      console.error('Error regenerating resume:', error);
      
      const errorMessage = error?.message || 'Unknown error';
      
      // Provide more specific error messages based on the error
      if (errorMessage.includes('404')) {
        alert('Error: API endpoint not found. Please check if the backend server is running and the API routes are correct.');
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        alert('Error: Authentication failed. Please log in again before trying.');
      } else if (errorMessage.includes('500')) {
        alert('Error: The server encountered an error. This might be due to missing configuration like the OpenAI API key.');
      } else {
        alert(`Error regenerating resume: ${errorMessage}. Please try again.`);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const openRegenerateModal = () => {
    // Check if the user is authenticated
    const token = getAuthToken();
    
    if (!token) {
      alert('Please log in to use the regenerate feature');
      return;
    }
    
    setRegenerateModalOpen(true);
   
  };

  // Add a new useEffect to log whenever the session or resumeId changes
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log('Session updated:', session?.user?.name);
      console.log('Has token:', !!session?.accessToken);
      console.log('Current resumeId:', resumeId);
    }
  }, [session, resumeId]);

  // Add handleOpenDebugDialog function
  const handleOpenDebugDialog = () => {
    updateDebugInfo();
    setDebugDialogOpen(true);
  }

  // Add function to manually reload resume by ID
  const handleManualLoadResume = async (id: string) => {
    // Retrieve token from localStorage or session
    const token = getAuthToken();
    if (!token) {
      showToast('You need to be logged in to load a resume', 'error');
      return;
    }

    try {
      // Direct backend fetch by ID
      const response = await fetch(`${backendUrl}/resume/getResume/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.sections) {
          setSections(data.sections);
          setResumeId(id);
          showToast('Resume loaded successfully!', 'success');
          setDebugDialogOpen(false);
        } else {
          showToast('Resume has no sections', 'error');
        }
      } else {
        const error = await response.text();
        showToast(`Failed to load resume: ${error}`, 'error');
      }
    } catch (error) {
      showToast(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  }

  // Replace the existing handleShareLinkedIn function with this updated version:
  const handleShareLinkedIn = async (): Promise<void> => {
    try {
      // First check if we need to clear any URL query parameters that might be causing issues
      if (router.query.linkedin || router.query.t || router.query.error) {
        const url = new URL(window.location.href);
        // Clear all query parameters for a fresh start
        url.search = '';
        router.replace(url.toString(), undefined, { shallow: true });
      }

      // Check for token in localStorage instead of cookies
      console.log('Checking for LinkedIn token in localStorage...');
      const token = localStorage.getItem('linkedin_token');
      
      console.log('LinkedIn token found in localStorage:', !!token);
      
      // Add debugging for token value
      if (token) {
        console.log('Token length:', token.length);
        // Check if token format is valid (should be a long string without spaces)
        const isValidFormat = /^[A-Za-z0-9\-_]+$/.test(token);
        console.log('Token format appears valid:', isValidFormat);
        
        if (!isValidFormat) {
          console.warn('Token appears to be malformed, clearing and requesting new one');
          localStorage.removeItem('linkedin_token');
          if (window.confirm('Your LinkedIn token appears invalid. Would you like to reconnect?')) {
            window.open('/api/linkedin/auth/start', '_blank', 'width=600,height=700');
            showToast('Complete LinkedIn login in the popup window, then try sharing again', 'info');
          }
          return;
        }
      }
      
      if (!token) {
        console.log('LinkedIn token not found in localStorage');
        // Simplified auth flow
        if (window.confirm('Connect with LinkedIn to share your resume?')) {
          window.open('/api/linkedin/auth/start', '_blank', 'width=600,height=700');
          showToast('Complete LinkedIn login in the popup window, then try sharing again', 'info');
          return;
        }
        return;
      }
      
      // Token exists, proceed with sharing
      showToast('Preparing to share to LinkedIn...', 'info');
      
      // Try the main sharing endpoint first
      console.log('Sending token to direct share endpoint...');
      showToast('Sharing to LinkedIn...', 'info');
      
      const shareResponse = await fetch('/api/linkedin/directShare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          message: 'Hello! Testing my post from TalentAI resume builder.'
        })
      });
      
      let result;
      try {
        result = await shareResponse.json();
      } catch (e) {
        console.error('Failed to parse JSON from LinkedIn share response:', e);
        result = { error: 'Invalid response from server' };
      }
      
      console.log('LinkedIn share response:', {
        status: shareResponse.status,
        statusText: shareResponse.statusText,
        result
      });
      
      if (shareResponse.ok && result.success) {
        showToast('Successfully shared to LinkedIn!', 'success');
        return;
      }
      
      // If we get a 403 error (permission issue), try the simple sharing endpoint that doesn't need profile access
      if (shareResponse.status === 403) {
        console.log('Got 403 permission error, trying simplified sharing method...');
        
        const simpleShareResponse = await fetch('/api/linkedin/directShareSimple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            message: 'Hello! Testing my post from TalentAI resume builder.'
          })
        });
        
        let simpleResult;
        try {
          simpleResult = await simpleShareResponse.json();
        } catch (e) {
          console.error('Failed to parse JSON from simple LinkedIn share response:', e);
          simpleResult = { error: 'Invalid response from server' };
        }
        
        console.log('Simple LinkedIn share response:', {
          status: simpleShareResponse.status,
          statusText: simpleShareResponse.statusText,
          result: simpleResult
        });
        
        if (simpleShareResponse.ok && simpleResult.success) {
          showToast('Successfully shared to LinkedIn!', 'success');
          return;
        }
        
        // If both methods fail with permission issues, prompt to reconnect with both scopes
        console.log('Both sharing methods failed, need to reconnect with expanded permissions');
        const reconnectWithScopes = window.confirm(
          'LinkedIn requires additional permissions to share content.\n\n' +
          'Would you like to reconnect with expanded permissions?'
        );
        
        if (reconnectWithScopes) {
          localStorage.removeItem('linkedin_token');
          window.open('/api/linkedin/auth/start', '_blank', 'width=600,height=700');
          showToast('Please accept all permissions in the LinkedIn window', 'info');
        }
        return;
      }
      
      // Handle other error cases
      if (shareResponse.status === 401) {
        // Unauthorized - token is invalid/expired
        console.log('LinkedIn token is invalid or expired');
        localStorage.removeItem('linkedin_token');
        
        const reconnect = window.confirm(
          'Your LinkedIn session has expired. Would you like to reconnect?'
        );
        
        if (reconnect) {
          window.open('/api/linkedin/auth/start', '_blank', 'width=600,height=700');
          showToast('Please log in to LinkedIn in the new window, then try sharing again', 'info');
        }
        return;
      }
      
      // In case of server error (500) or other errors, just show the error
      const errorMessage = result?.error || 'Unknown error';
      const errorDetails = result?.message || result?.details || '';
      console.error('LinkedIn sharing failed:', errorMessage, errorDetails);
      
      // If we get a "fetch failed" error, it could be a networking issue on the server
      if (errorMessage === 'Error sharing to LinkedIn' && errorDetails === 'fetch failed') {
        const retryFromScratch = window.confirm(
          'LinkedIn connection failed. This could be due to an invalid token or network issue.\n\n' + 
          'Would you like to reconnect and try again?'
        );
        
        if (retryFromScratch) {
          // Clear token and start fresh
          localStorage.removeItem('linkedin_token');
          window.open('/api/linkedin/auth/start', '_blank', 'width=600,height=700');
          showToast('Please log in to LinkedIn in the new window, then try sharing again', 'info');
          return;
        }
      }
      
      showToast(`Error sharing to LinkedIn: ${errorMessage}`, 'error');
    } catch (error) {
      console.error('Error in LinkedIn sharing flow:', error);
      showToast('Error sharing to LinkedIn', 'error');
    }
  };

  // Add useEffect to handle LinkedIn query parameters
  useEffect(() => {
    // Check for LinkedIn callback flags in the URL
    const linkedinParam = router.query.linkedin;
    const linkedinError = router.query.error;
    const timeParam = router.query.t;
    
    if (linkedinParam) {
      // Process the parameters only once
      if (linkedinParam === 'scope_error') {
        // LinkedIn scope error occurred
        showToast(
          `LinkedIn authorization error: ${linkedinError || 'Insufficient permissions'}. The app will use only the w_member_social scope.`, 
          'warning'
        );
      } else if (linkedinParam === 'success') {
        // Successfully authenticated with LinkedIn
        showToast('Successfully connected to LinkedIn! You can now share your resume.', 'success');
      }
      
      // Clear the LinkedIn parameters after processing to prevent repeated messages
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('linkedin');
        url.searchParams.delete('error');
        
        // Keep the timestamp parameter to prevent stale callbacks
        if (!timeParam) {
          url.searchParams.delete('t');
        }
        
        router.replace(url.pathname + url.search, undefined, { shallow: true });
      }
    }
  }, [router.query.linkedin, router.query.error, router]); // Include router in the dependency array

  // Add listener for auth success messages from popup window
  useEffect(() => {
    // Function to handle messages from auth-success page
    const handleAuthMessage = (event: MessageEvent) => {
      // Verify the origin for security
      if (event.origin !== window.location.origin) return;
      
      // Check if it's an auth success message
      if (event.data?.type === 'AUTH_SUCCESS' && event.data?.provider === 'linkedin') {
        console.log('Received auth success message from popup');
        
        // Store the token if it was passed in the message
        if (event.data?.token) {
          console.log('Saving LinkedIn token from popup message');
          localStorage.setItem('linkedin_token', event.data.token);
        }
        
        showToast('Successfully connected to LinkedIn! You can now share your resume.', 'success');
      }
    };
    
    // Add event listener
    window.addEventListener('message', handleAuthMessage);
    
    // Clean up
    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, []);

  return (
    <div className={styles.container}>
      <IconButton
        onClick={() => router.push('/dashboardCandidate')}
        sx={{
          position: "fixed",
          left: isMobile ? 120 : 260, // Moved further to the right
          top: 16,
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
              {/* Blank Template Preview */}
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
                  height: '260px', 
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1
                }}>
                  {/* Simple blank template preview */}
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%', 
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1
                  }}>
                    <Box sx={{ width: '40%', height: '20px', bgcolor: '#e0e0e0', mb: 1 }}></Box>
                    <Box sx={{ width: '60%', height: '12px', bgcolor: '#e0e0e0', mb: 2 }}></Box>
                    <Box sx={{ width: '90%', height: '8px', bgcolor: '#f0f0f0', mb: 1 }}></Box>
                    <Box sx={{ width: '80%', height: '8px', bgcolor: '#f0f0f0', mb: 1 }}></Box>
                    <Box sx={{ width: '85%', height: '8px', bgcolor: '#f0f0f0', mb: 3 }}></Box>
                    
                    <Box sx={{ width: '30%', height: '12px', bgcolor: '#e0e0e0', mb: 1 }}></Box>
                    <Box sx={{ width: '70%', height: '8px', bgcolor: '#f0f0f0', mb: 1 }}></Box>
                    <Box sx={{ width: '65%', height: '8px', bgcolor: '#f0f0f0', mb: 1 }}></Box>
                  </Box>
                </Box>
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight="medium">Blank Template</Typography>
                </Box>
              </Paper>

              {/* French Data CV Template */}
              <Paper 
                onClick={handleFrenchTemplate}
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
                  height: '260px', 
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1
                }}>
                  {/* French Data CV template preview */}
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%', 
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    p: 1,
                    overflow: 'hidden'
                  }}>
                    <FrenchDataCV isPreview={true} />
                  </Box>
                </Box>
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight="medium">French Data CV</Typography>
                </Box>
              </Paper>

              {/* Data Scientist CV Template */}
              <Paper 
                onClick={handleDataScientistTemplate}
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
                  height: '260px', 
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1
                }}>
                  {/* Data Scientist CV template preview */}
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%', 
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    p: 1,
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Left column preview */}
                    <Box sx={{ width: '40%', height: '100%', pr: 1 }}>
                    <Box sx={{ 
                        height: '20px', 
                        bgcolor: '#5170b7', 
                        width: '70%', 
                        mb: 1 
                      }}></Box>
                    <Box sx={{ 
                        height: '40px', 
                        borderTop: '2px solid #5170b7',
                        borderBottom: '1px solid #e0e0e0',
                        mb: 1 
                    }}></Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                        gap: 0.5
                      }}>
                        <Box sx={{ height: '6px', width: '90%', bgcolor: '#f0f0f0' }}></Box>
                        <Box sx={{ height: '6px', width: '85%', bgcolor: '#f0f0f0' }}></Box>
                        <Box sx={{ height: '6px', width: '80%', bgcolor: '#f0f0f0' }}></Box>
                    </Box>
                    </Box>
                    
                    {/* Right column preview */}
                    <Box sx={{ width: '60%', height: '100%', pl: 1 }}>
                <Box sx={{ 
                        height: '20px', 
                        bgcolor: '#5170b7', 
                        width: '70%', 
                        mb: 1 
                      }}></Box>
                  <Box sx={{ 
                          height: '40px',
                        borderTop: '2px solid #5170b7',
                        borderBottom: '1px solid #e0e0e0',
                        mb: 1 
                        }}></Box>
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5
                      }}>
                        <Box sx={{ height: '8px', width: '90%', bgcolor: '#f0f0f0' }}></Box>
                        <Box sx={{ height: '8px', width: '60%', bgcolor: '#f0f0f0', mb: 1 }}></Box>
                        <Box sx={{ height: '6px', width: '30%', bgcolor: '#5170b7', ml: 2 }}></Box>
                        <Box sx={{ height: '6px', width: '80%', bgcolor: '#f0f0f0', ml: 2 }}></Box>
                        <Box sx={{ height: '6px', width: '70%', bgcolor: '#f0f0f0', ml: 2, mb: 1 }}></Box>
                        <Box sx={{ height: '6px', width: '85%', bgcolor: '#f0f0f0' }}></Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight="medium">Data Scientist CV</Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateModalOpen(false)} variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={regenerateModalOpen}
        onClose={() => setRegenerateModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
          Regenerate Resume Content
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', mb: 2 }}>
              Enter a description about yourself, and our AI will help enhance your resume content.
            </Typography>
            <TextField
              label="Your description"
              multiline
              rows={4}
              fullWidth
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Je suis Mohamed Aziz Ben Ismail, ingénieur en informatique spécialisé en..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setRegenerateModalOpen(false)} 
            variant="outlined"
            sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRegenerate} 
            variant="contained"
            disabled={!prompt.trim() || isRegenerating}
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              minWidth: '120px'
            }}
          >
            {isRegenerating ? <CircularProgress size={24} color="inherit" /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {isMobile ? (
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{ position: "fixed", left: 8, top: 8 }}
        >
          <MenuIcon />
        </IconButton>
      ) : (
        <Sidebar onAdd={addSection} onAddIcon={handleIconSelected} />
      )}

      <ResumeActions 
        onSaveDraft={saveDraft}
        onExportPDF={exportToPDF}
        onChangeTemplate={() => setTemplateModalOpen(true)}
        onUndo={handleUndo}
        canUndo={sectionsHistory.length > 0}
        sectionsCount={sections.length}
      />

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Sidebar onAdd={addSection} onAddIcon={handleIconSelected} />
      </Drawer>

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

      <ZoomControls
        zoom={zoom}
        setZoom={setZoom}
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

      {/* Add debug button only in development mode */}
      {DEBUG_MODE && (
        <IconButton
          onClick={handleOpenDebugDialog}
          sx={{
            position: 'fixed',
            right: '80px',
            bottom: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }
          }}
        >
          <BugReportIcon />
        </IconButton>
      )}

      {/* Debug Dialog */}
      <Dialog open={debugDialogOpen} onClose={() => setDebugDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Debug Information</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Session Info</Typography>
          <Box sx={{ mb: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, overflow: 'auto', maxHeight: '150px' }}>
            <pre>{JSON.stringify({ 
              user: session?.user,
              expires: session?.expires,
              hasToken: !!session?.accessToken
            }, null, 2)}</pre>
          </Box>

          <Typography variant="h6">Resume Info</Typography>
          <Box sx={{ mb: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography>Current Resume ID: {resumeId || 'None'}</Typography>
            <Typography>Has Local Storage Draft: {debugInfo.hasLocalStorage ? 'Yes' : 'No'}</Typography>
            <Typography>Sections Count: {sections.length}</Typography>
          </Box>

          <Typography variant="h6">Manually Load Resume</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField 
              label="Resume ID" 
              variant="outlined" 
              fullWidth
              defaultValue={resumeId || ''}
              placeholder="Enter resume ID from database"
              inputProps={{ style: { fontFamily: 'monospace' } }}
            />
            <Button 
              variant="contained" 
              onClick={(e) => {
                const input = (e.target as HTMLButtonElement)
                  .previousElementSibling?.querySelector('input');
                if (input) {
                  handleManualLoadResume(input.value);
                }
              }}
            >
              Load
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDebugDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
