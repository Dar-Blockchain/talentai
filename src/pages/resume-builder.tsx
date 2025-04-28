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
import { useSession } from "next-auth/react"
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { useRouter } from 'next/router'

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

  useEffect(() => {
    const loadResume = async () => {
      try {
        // Try to get the latest resume from backend
        const response = await fetch('/api/resumes/getResumes');
        if (response.ok) {
          const resumes = await response.json();
          if (resumes && resumes.length > 0) {
            // Get the most recent resume (already sorted by createdAt in the backend)
            setSections(resumes[0].sections);
            setResumeId(resumes[0]._id); // Store the resume ID
            return; // Resume loaded, no need to show template selection
          }
        }

        // Fallback to localStorage if no resumes found or API fails
        const draft = localStorage.getItem('resume-draft');
        if (draft) {
          try {
            setSections(JSON.parse(draft));
            return; // Resume loaded from localStorage, no need to show template selection
          } catch {
            console.warn('Could not parse resume draft');
            // Will continue to show template selection
          }
        }
        
        // No resume found either from API or localStorage, show template selection
        setTemplateModalOpen(true);
        
      } catch (error) {
        console.error('Error loading resume:', error);
        // Try localStorage as fallback
        const draft = localStorage.getItem('resume-draft');
        if (draft) {
          try {
            setSections(JSON.parse(draft));
            return; // Resume loaded from localStorage, no need to show template selection
          } catch {
            console.warn('Could not parse resume draft');
            // Will continue to show template selection
          }
        }
        
        // No resume found either from API or localStorage, show template selection
        setTemplateModalOpen(true);
      }
    };

    loadResume();

    // Remove the "first visit" check since we now show the template modal
    // whenever there's no resume, regardless of first visit or not
  }, []);
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
          height: 20, // Default height for horizontal line
          type: 'line',
          orientation: 'horizontal',
          thickness: 2,
          color: '#000000'
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
      // First, always save to localStorage as backup
      localStorage.setItem('resume-draft', JSON.stringify(sections));
      
      // Get the token from NextAuth session
      const token = session?.accessToken;
      
      if (!token) {
        console.log('No auth token found - saving only to localStorage');
        showToast('Your resume was saved locally. Log in to save to your account.', 'info');
        return;
      }
      
      // Prepare headers with auth token
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Try to save to backend
      let response;
      
      if (resumeId) {
        // If we have a resumeId, update the existing resume
        console.log('Updating existing resume with ID:', resumeId);
        response = await fetch(`/api/resumes/${resumeId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ sections }),
        });
      } else {
        // Otherwise create a new resume
        console.log('Creating new resume');
        response = await fetch('/api/resumes/createResume', {
          method: 'POST',
          headers,
          body: JSON.stringify({ sections }),
        });
      }
      
      if (response.status === 413) {
        // Payload too large error
        showToast('Your resume is too large to save to the server, but it has been saved locally.', 'warning');
        return;
      }
      
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        showToast('Error communicating with server. Your resume was saved locally.', 'error');
        return;
      }
      
      if (response.ok) {
        console.log('Resume saved successfully');
        showToast('Resume saved successfully!');
        
        // Update resumeId if this was a new resume
        if (data?.resume && data.resume._id && !resumeId) {
          setResumeId(data.resume._id);
        }
      } else {
        console.error('Failed to save resume:', data);
        showToast(`Error saving to server: ${data?.error || 'Unknown error'}. Your resume was saved locally.`, 'error');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      showToast('Error saving resume. Your changes were saved locally.', 'error');
    }
  }

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
    setTemplateModalOpen(false)
    setSections([
      {
        id: uuidv4(),
        type: 'header',
        name: 'Khalil Troudi',
        jobTitle: 'data scientist',
        content: '<h2 style="margin: 0; font-size: 22px; font-weight: bold; color: #5170b7;">Khalil Troudi</h2><p style="margin: 0; font-size: 14px; color: #333;">data scientist</p>',
        height: 122,
        width: 307,
        x: 13.33333333333333,
        y: 15.333333333333336
      },
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong style="color: #5170b7; text-transform: uppercase;">PROFIL & OBJECTIF</strong><p>Passionné par l\'innovation basée sur les données et les technologies web. Je dispose de compétences solides en analyse de données, apprentissage automatique, développement web full-stack.</p><p>Doté d\'un esprit analytique, d\'une capacité à gérer des projets transverses et d\'une maîtrise des outils de développement modernes, je vise à intégrer un environnement dynamique où je pourrai contribuer à l\'amélioration des performances via de l\'amélioration des processus décisionnels basés sur les données.</p>',
        height: 512,
        width: 240,
        x: 5.333333333333338,
        y: 182.66666666666666
      },
      {
        id: uuidv4(),
        type: 'line',
        orientation: 'horizontal',
        thickness: 1,
        color: '#ccc',
        height: 2,
        width: 240,
        x: 40,
        y: 400
      },
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong style="color: #5170b7; text-transform: uppercase;">CONTACT</strong><p>📞 +12 12457896</p><p>✉️ email@domain.com</p><p>🔗 linkedin.com/in/profile</p><p>🌐 github.com/username</p>',
        height: 150,
        width: 240,
        x: 0,
        y: 663.333333333333
      },
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong style="color: #5170b7; text-transform: uppercase;">FORMATIONS</strong><p><strong>3ème année cycle d\'ingénieur</strong><br>Specialité Architecture IT et Cloud Computing<br><em style="color: #5170b7;">ESPRIT - École Sup Privée d\'Ingénierie et de Technologies</em><br>(Sept. 2022- Present)</p><p><strong>Bachelor en Big Data et analyse des données</strong><br><em style="color: #5170b7;">Institut supérieur des arts multimédia de la Manouba</em><br>(Sept. 2019- Juin 2022)</p><p><strong>Baccalauréat en Informatique</strong><br><em style="color: #5170b7;">Lycée Béchir Nabhani</em> - (Sept. 2015- Juin 2019)</p>',
        height: 344,
        width: 350,
        x: 422,
        y: 0
      },
      {
        id: uuidv4(),
        type: 'line',
        orientation: 'horizontal',
        thickness: 1,
        color: '#ccc',
        height: 2,
        width: 350,
        x: 310,
        y: 210
      },
      {
        id: uuidv4(),
        type: 'text',
        content: '<strong style="color: #5170b7; text-transform: uppercase;">EXPÉRIENCES PROFESSIONNELLES</strong><p><strong>Data Scientist</strong><br>Dinosoftlabs Stage, Remote (<em style="color: #5170b7;">Juillet 2024 - septembre 2024</em>)<ul><li>Analyse et traitement des données financières sur la période 2022-2023 dans une évaluation approfondie des gains et pertes.</li><li>Conception et développement de tableaux de bord interactifs pour Power BI pour visualiser la rétention des clients et la situation financière.</li></ul></p><p><strong>Professeur d\'Algorithmes et Python Tutor</strong><br>TuniX Academy, Part-time, Tunisie (<em style="color: #5170b7;">Juillet 2023 - septembre 2024</em>)<ul><li>Enseignement des concepts de base en algorithmique et en programmation Python.</li></ul></p>',
        height: 416,
        width: 350,
        x: 416.6666666666667,
        y: 342.66666666666725
      },
      // Only add skills section if one doesn't already exist
      ...(sections.some(section => section.type === 'skills') ? [] : [{
        id: uuidv4(),
        type: 'skills' as const,
        skills: ['Python', 'Data Analysis', 'Machine Learning', 'SQL', 'JavaScript', 'React'],
        height: 200,
        width: 240,
        x: 0,
        y: 460
      } as SkillsSection]),
      {
        id: uuidv4(),
        type: 'image',
        alt: 'Profile image',
        isRound: true,
        src: '',
        content: '<div style="width: 160px; height: 160px; margin: 0 auto; border-radius: 50%; overflow: hidden;"><img src="" alt="Profile image" style="width: 100%; height: 100%; object-fit: cover;"></div>',
        height: 168,
        width: 100,
        x: 45.33336666666666,
        y: 82.66663333333332
      }
    ])
  }

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
        const token = session?.accessToken;
        
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }
        
        // Direct call to backend API, ensuring proper URL formatting
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
        const apiUrl = `${baseUrl}/resume/regenerate`.replace(/([^:]\/)\/+/g, "$1");
        
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
      const token = session?.accessToken;
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await fetch('/api/resumes/regenerate', {
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
    const token = session?.accessToken;
    
    if (!token) {
      alert('Please log in to use the regenerate feature');
      return;
    }
    
    setRegenerateModalOpen(true);
  };

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
                    p: 1
                  }}>
                    {/* Left column */}
                    <Box sx={{ 
                      width: '32%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      pr: 0.8
                    }}>
                      <Box sx={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%', 
                        bgcolor: '#e0e0e0', 
                        mb: 1.5, 
                        mx: 'auto' 
                      }}></Box>
                      
                      <Typography sx={{ 
                        fontSize: '7px', 
                        fontWeight: 'bold', 
                        color: '#5170b7',
                        mb: 0.2,
                        textTransform: 'uppercase'
                      }}>
                        CONTACT
                      </Typography>
                      <Typography sx={{ fontSize: '6px', color: '#555', mb: 0.1 }}>
                        📞 +12 12457896
                      </Typography>
                      <Typography sx={{ fontSize: '6px', color: '#555', mb: 0.1 }}>
                        ✉️ email@domain.com
                      </Typography>
                      <Typography sx={{ fontSize: '6px', color: '#555', mb: 0.1 }}>
                        🔗 linkedin.com/in/profile
                      </Typography>
                      <Typography sx={{ fontSize: '6px', color: '#555', mb: 0.8 }}>
                        🌐 github.com/username
                      </Typography>
                      
                      {/* Right column */}
                      <Box sx={{ 
                        width: '68%', 
                        pl: 0.8,
                        borderLeft: '1px solid #eee'
                      }}>
                        {/* Formations section */}
                        <Typography sx={{ 
                          fontSize: '7px', 
                          fontWeight: 'bold', 
                          color: '#5170b7',
                          mb: 0.2,
                          textTransform: 'uppercase'
                        }}>
                          Formations
                        </Typography>
                        <Typography sx={{ fontSize: '6px', fontWeight: 'medium', color: '#444', mb: 0 }}>
                          3ème année cycle d'ingénieur
                        </Typography>
                        <Typography sx={{ fontSize: '6px', color: '#555', mb: 0.1 }}>
                          Specialité Architecture IT et Cloud Computing
                        </Typography>
                        <Typography sx={{ fontSize: '6px', color: '#5170b7', fontStyle: 'italic', mb: 0.5 }}>
                          ESPRIT - École Sup Privée d'Ingénierie et de Technologies
                        </Typography>
                        
                        {/* Experiences section */}
                        <Typography sx={{ 
                          fontSize: '7px', 
                          fontWeight: 'bold', 
                          color: '#5170b7',
                          mb: 0.2,
                          textTransform: 'uppercase'
                        }}>
                          Expériences professionnelles
                        </Typography>
                        <Typography sx={{ fontSize: '6px', fontWeight: 'medium', color: '#444', mb: 0 }}>
                          Data Scientist
                        </Typography>
                        <Typography sx={{ fontSize: '6px', color: '#777', mb: 0.1 }}>
                          Dinosoftlabs Stage, Remote (Juillet 2024 - septembre 2024)
                        </Typography>
                        <Typography sx={{ fontSize: '6px', color: '#555', mb: 0.1 }}>
                          • Analyse et traitement des données financières sur la période 2022-2023...
                        </Typography>
                        <Typography sx={{ fontSize: '6px', color: '#555', mb: 0.5 }}>
                          • Conception et développement de tableaux de bord interactifs...
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight="medium">French Data CV</Typography>
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
        onRegenerate={openRegenerateModal}
      />

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Sidebar onAdd={addSection} onAddIcon={handleIconSelected} />
      </Drawer>

      <Canvas zoom={zoom}>
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
    </div>
  )
}
