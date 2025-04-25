'use client'

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  Grid,
  Paper,
  InputBase,
  IconButton,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

// Import popular Material-UI icons
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import WebIcon from '@mui/icons-material/Web';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BookIcon from '@mui/icons-material/Book';
import PublicIcon from '@mui/icons-material/Public';
import TranslateIcon from '@mui/icons-material/Translate';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BarChartIcon from '@mui/icons-material/BarChart';

// Define the list of icons with searchable labels
const icons = [
  { icon: EmailIcon, label: 'Email', category: 'contact' },
  { icon: PhoneIcon, label: 'Phone', category: 'contact' },
  { icon: LinkedInIcon, label: 'LinkedIn', category: 'social' },
  { icon: GitHubIcon, label: 'GitHub', category: 'social' },
  { icon: LanguageIcon, label: 'Language', category: 'contact' },
  { icon: LocationOnIcon, label: 'Location', category: 'contact' },
  { icon: PersonIcon, label: 'Person', category: 'general' },
  { icon: WorkIcon, label: 'Work', category: 'career' },
  { icon: SchoolIcon, label: 'School', category: 'education' },
  { icon: CodeIcon, label: 'Code', category: 'skills' },
  { icon: WebIcon, label: 'Website', category: 'contact' },
  { icon: TwitterIcon, label: 'Twitter', category: 'social' },
  { icon: FacebookIcon, label: 'Facebook', category: 'social' },
  { icon: InstagramIcon, label: 'Instagram', category: 'social' },
  { icon: WhatsAppIcon, label: 'WhatsApp', category: 'contact' },
  { icon: TelegramIcon, label: 'Telegram', category: 'contact' },
  { icon: DateRangeIcon, label: 'Date Range', category: 'time' },
  { icon: EventIcon, label: 'Event', category: 'time' },
  { icon: StarIcon, label: 'Star', category: 'rating' },
  { icon: CheckCircleIcon, label: 'Check', category: 'general' },
  { icon: VerifiedIcon, label: 'Verified', category: 'general' },
  { icon: ApartmentIcon, label: 'Apartment', category: 'location' },
  { icon: BusinessIcon, label: 'Business', category: 'career' },
  { icon: GroupIcon, label: 'Group', category: 'general' },
  { icon: InsertDriveFileIcon, label: 'File', category: 'general' },
  { icon: FolderIcon, label: 'Folder', category: 'general' },
  { icon: BuildIcon, label: 'Tools', category: 'skills' },
  { icon: SettingsIcon, label: 'Settings', category: 'general' },
  { icon: DescriptionIcon, label: 'Description', category: 'general' },
  { icon: AssignmentIcon, label: 'Assignment', category: 'general' },
  { icon: MenuBookIcon, label: 'Menu Book', category: 'education' },
  { icon: BookIcon, label: 'Book', category: 'education' },
  { icon: PublicIcon, label: 'Globe', category: 'location' },
  { icon: TranslateIcon, label: 'Translate', category: 'language' },
  { icon: PsychologyIcon, label: 'Psychology', category: 'skills' },
  { icon: EmojiObjectsIcon, label: 'Idea', category: 'general' },
  { icon: LightbulbIcon, label: 'Lightbulb', category: 'general' },
  { icon: AutoGraphIcon, label: 'Graph', category: 'skills' },
  { icon: BarChartIcon, label: 'Chart', category: 'skills' },
];

// Categories for filtering
const categories = [
  'all',
  'contact',
  'social',
  'general',
  'career',
  'education',
  'skills',
  'time',
  'location',
  'language',
  'rating'
];

type IconSelectorProps = {
  open: boolean;
  onClose: () => void;
  onSelectIcon: (iconHtml: string) => void;
};

export default function IconSelector({ open, onClose, onSelectIcon }: IconSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter icons based on search query and category
  const filteredIcons = icons.filter(icon => {
    const matchesSearch = icon.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleIconSelect = (IconComponent: React.ElementType) => {
    // Create a mapping of icon names to SVG icons
    const iconMap: Record<string, string> = {
      // Social Media with SVG icons
      'Twitter': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#1DA1F2">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>`,
      'Facebook': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#4267B2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>`,
      'Instagram': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#E1306C">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>`,
      'LinkedIn': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#0077b5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>`,
      'GitHub': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#333333">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>`,
      'WhatsApp': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>`,
      'Telegram': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#0088cc">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>`,
      
      // Contact & Location icons (using emojis for non-social media)
      'Email': '✉️',
      'Phone': '📞',
      'Location': '📍',
      'Website': '🌐',
      'Language': '🔤',
      
      // Time & Date
      'Date Range': '📅',
      'Event': '🗓️',
      
      // Career & Education
      'Work': '💼',
      'School': '🎓',
      'Person': '👤',
      'Group': '👥',
      'Business': '🏢',
      'Apartment': '🏙️',
      
      // Skills & Tools
      'Code': '💻',
      'Tools': '🛠️',
      'Settings': '⚙️',
      'Psychology': '🧠',
      'Star': '⭐',
      'Verified': '✅',
      'Check': '✓',
      
      // Documents & Projects
      'File': '📄',
      'Folder': '📁',
      'Description': '📝',
      'Assignment': '📋',
      'Book': '📚',
      'Menu Book': '📖',
      
      // Ideas & Creativity
      'Lightbulb': '💡',
      'Idea': '💡',
      
      // Data & Analytics 
      'Graph': '📊',
      'Chart': '📈',
      
      // Other
      'Public': '🌎',
      'Globe': '🌎',
      'Translate': '🌐',
    };
    
    // Find the corresponding icon in our filtered icons array
    const iconObj = icons.find(i => i.icon === IconComponent);
    const iconLabel = iconObj?.label || '';
    const iconText = iconMap[iconLabel] || '●'; // Default to a bullet point if not found
    
    // Create an HTML element with the icon
    const iconHtml = `<div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
      ${iconText.includes('<svg') ? iconText : `<span style="font-size: 30px; line-height: 1; color: #333;">${iconText}</span>`}
    </div>`;
    
    onSelectIcon(iconHtml);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: 'white',
          borderRadius: '12px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6">Select an Icon</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ px: 3, pb: 2 }}>
        {/* Search input */}
        <Paper
          component="form"
          sx={{ 
            p: '2px 4px', 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            mb: 2
          }}
        >
          <IconButton sx={{ p: '10px', color: 'rgba(255, 255, 255, 0.7)' }}>
            <SearchIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1, color: 'white' }}
            placeholder="Search icons"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Paper>

        {/* Category filters */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {categories.map((category) => (
            <Button
              key={category}
              size="small"
              variant={selectedCategory === category ? "contained" : "outlined"}
              onClick={() => setSelectedCategory(category)}
              sx={{ 
                textTransform: 'capitalize',
                color: selectedCategory === category ? 'white' : 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: selectedCategory === category ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: selectedCategory === category ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              {category}
            </Button>
          ))}
        </Box>
      </Box>

      <DialogContent sx={{ pt: 0 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1 
          }}
        >
          {filteredIcons.map(({ icon: Icon, label }) => (
            <Box 
              key={label} 
              sx={{ 
                width: { xs: 'calc(16.666% - 8px)', sm: 'calc(8.333% - 8px)' },
                mb: 1 
              }}
            >
              <Tooltip title={label}>
                <Paper
                  onClick={() => handleIconSelect(Icon)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 8px',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s',
                    borderRadius: '8px',
                    height: '64px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Icon sx={{ fontSize: 24, color: 'white', mb: 1 }} />
                  <Typography variant="caption" noWrap sx={{ fontSize: '9px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {label}
                  </Typography>
                </Paper>
              </Tooltip>
            </Box>
          ))}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
} 