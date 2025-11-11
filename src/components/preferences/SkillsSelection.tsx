import React, { useState, useMemo } from 'react';
import { Box, Typography, Chip, Paper, Tabs, Tab, RadioGroup, FormControlLabel, Radio, Slider, Tooltip, TextField, InputAdornment, IconButton, Pagination } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BugReportIcon from '@mui/icons-material/BugReport';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// Skills data
// --- Skills List ---
const ALL_SKILLS = [
  // Development
  { label: 'JavaScript', color: 'F7DF1E', category: 'development' },
  { label: 'TypeScript', color: '3178C6', category: 'development' },
  { label: 'React', color: '61DAFB', category: 'development' },
  { label: 'Vue.js', color: '4FC08D', category: 'development' },
  { label: 'Angular', color: 'DD0031', category: 'development' },
  { label: 'Svelte', color: 'FF3E00', category: 'development' },
  { label: 'Node.js', color: '339933', category: 'development' },
  { label: 'Express.js', color: '000000', category: 'development' },
  { label: 'Next.js', color: '000000', category: 'development' },
  { label: 'Nuxt.js', color: '00DC82', category: 'development' },
  { label: 'Python', color: '3776AB', category: 'development' },
  { label: 'Django', color: '092E20', category: 'development' },
  { label: 'Flask', color: '000000', category: 'development' },
  { label: 'FastAPI', color: '009688', category: 'development' },
  { label: 'Java', color: '007396', category: 'development' },
  { label: 'Spring Boot', color: '6DB33F', category: 'development' },
  { label: 'C#', color: '239120', category: 'development' },
  { label: '.NET', color: '512BD4', category: 'development' },
  { label: 'PHP', color: '777BB4', category: 'development' },
  { label: 'Laravel', color: 'FF2D20', category: 'development' },
  { label: 'Ruby', color: 'CC342D', category: 'development' },
  { label: 'Ruby on Rails', color: 'D30001', category: 'development' },
  { label: 'Go', color: '00ADD8', category: 'development' },
  { label: 'Rust', color: '000000', category: 'development' },
  { label: 'C++', color: '00599C', category: 'development' },
  { label: 'C', color: 'A8B9CC', category: 'development' },
  { label: 'Swift', color: 'FA7343', category: 'development' },
  { label: 'Kotlin', color: '7F52FF', category: 'development' },
  { label: 'GraphQL', color: 'E10098', category: 'development' },
  { label: 'REST API', color: '009688', category: 'development' },
  { label: 'MongoDB', color: '47A248', category: 'development' },
  { label: 'PostgreSQL', color: '336791', category: 'development' },
  { label: 'MySQL', color: '4479A1', category: 'development' },
  { label: 'Redis', color: 'DC382D', category: 'development' },
  { label: 'Docker', color: '2496ED', category: 'development' },
  { label: 'Kubernetes', color: '326CE5', category: 'development' },
  { label: 'AWS', color: 'FF9900', category: 'development' },
  { label: 'Azure', color: '0089D6', category: 'development' },
  { label: 'Google Cloud', color: '4285F4', category: 'development' },
  { label: 'Git', color: 'F05032', category: 'development' },
  { label: 'CI/CD', color: '2088FF', category: 'development' },
  { label: 'Jest', color: 'C21325', category: 'development' },
  { label: 'Cypress', color: '17202C', category: 'development' },
  { label: 'Webpack', color: '8DD6F9', category: 'development' },
  { label: 'Vite', color: '646CFF', category: 'development' },
  { label: 'Tailwind CSS', color: '06B6D4', category: 'development' },
  { label: 'Material-UI', color: '007FFF', category: 'development' },
  { label: 'Bootstrap', color: '7952B3', category: 'development' },
  { label: 'Sass', color: 'CC6699', category: 'development' },
  { label: 'Redux', color: '764ABC', category: 'development' },
  { label: 'Hedera', color: '02E2FF', category: 'development' },
  // Marketing
  { label: 'SEO', color: 'FF6B6B', category: 'marketing' },
  { label: 'Content Marketing', color: '4ECDC4', category: 'marketing' },
  { label: 'Social Media', color: '45B7D1', category: 'marketing' },
  { label: 'Email Marketing', color: '96CEB4', category: 'marketing' },
  { label: 'Analytics', color: 'FFEEAD', category: 'marketing' },
  { label: 'Web3 Marketing', color: '00B894', category: 'marketing' },
  { label: 'NFT Marketing', color: '6C5CE7', category: 'marketing' },
  { label: 'Community Management', color: '0984E3', category: 'marketing' },
  { label: 'Token Economics', color: 'F7DF1E', category: 'marketing' },
  { label: 'DeFi Marketing', color: 'FF6B6B', category: 'marketing' },
  { label: 'Crypto PR', color: '00B894', category: 'marketing' },
  { label: 'Blockchain Events', color: 'E84393', category: 'marketing' },
  { label: 'DAO Governance', color: '6C5CE7', category: 'marketing' },
  // QA
  { label: 'Manual Testing', color: '9C27B0', category: 'qa' },
  { label: 'Automated Testing', color: '673AB7', category: 'qa' },
  { label: 'Test Planning', color: '3F51B5', category: 'qa' },
  { label: 'Performance Testing', color: '2196F3', category: 'qa' },
  { label: 'API Testing', color: '03A9F4', category: 'qa' },
  { label: 'Security Testing', color: '00BCD4', category: 'qa' },
  // Business
  { label: 'Project Management', color: '6C5CE7', category: 'business' },
  { label: 'Agile', color: '00B894', category: 'business' },
  { label: 'Scrum', color: 'FDCB6E', category: 'business' },
  { label: 'Product Management', color: 'E84393', category: 'business' },
  { label: 'Business Analysis', color: '0984E3', category: 'business' },
  // Web3
  { label: 'Solidity', color: '363636', category: 'web3' },
  { label: 'Ethereum', color: '627EEA', category: 'web3' },
  { label: 'Smart Contracts', color: 'F7931A', category: 'web3' },
  { label: 'DeFi', color: 'FF6B6B', category: 'web3' },
  { label: 'NFTs', color: '00B894', category: 'web3' },
  { label: 'Web3.js', color: 'F16822', category: 'web3' },
  { label: 'Hardhat', color: 'F7DF1E', category: 'web3' },
  { label: 'Truffle', color: '3FE0C5', category: 'web3' },
  { label: 'Massa', color: '00B894', category: 'web3' },
  { label: 'Hedera', color: '02E2FF', category: 'web3' },
  { label: 'Polkadot', color: 'E6007A', category: 'web3' },
  { label: 'NEAR', color: '000000', category: 'web3' },
  { label: 'Substrate', color: '000000', category: 'web3' },
  { label: 'Cosmos', color: '2E3148', category: 'web3' },
  { label: 'Solana', color: '00FFA3', category: 'web3' },
  { label: 'Avalanche', color: 'E84142', category: 'web3' },
  { label: 'Polygon', color: '8247E5', category: 'web3' },
  { label: 'Arbitrum', color: '28A0F0', category: 'web3' },
  { label: 'Optimism', color: 'FF0420', category: 'web3' },
  { label: 'Base', color: '0052FF', category: 'web3' },
  // AI
  { label: 'Machine Learning', color: 'FF6B6B', category: 'ai' },
  { label: 'Deep Learning', color: '00B894', category: 'ai' },
  { label: 'TensorFlow', color: 'FF6F00', category: 'ai' },
  { label: 'PyTorch', color: 'EE4C2C', category: 'ai' },
  { label: 'Keras', color: 'D00000', category: 'ai' },
  { label: 'Scikit-learn', color: 'F7931E', category: 'ai' },
  { label: 'Natural Language Processing', color: '4ECDC4', category: 'ai' },
  { label: 'Computer Vision', color: '6C5CE7', category: 'ai' },
  { label: 'Reinforcement Learning', color: '0984E3', category: 'ai' },
  { label: 'Data Science', color: '00B894', category: 'ai' },
  { label: 'Neural Networks', color: 'FF3838', category: 'ai' },
  { label: 'OpenAI', color: '412991', category: 'ai' },
  { label: 'LangChain', color: '1C3C3C', category: 'ai' },
  { label: 'Hugging Face', color: 'FFD21E', category: 'ai' },
  { label: 'MLOps', color: '00B894', category: 'ai' },
  { label: 'Data Analysis', color: '6C5CE7', category: 'ai' },
  { label: 'Pandas', color: '150458', category: 'ai' },
  { label: 'NumPy', color: '013243', category: 'ai' },
  { label: 'Jupyter', color: 'F37626', category: 'ai' },
  { label: 'Data Visualization', color: '4ECDC4', category: 'ai' },
  { label: 'Big Data', color: 'FF6B6B', category: 'ai' },
  { label: 'Apache Spark', color: 'E25A1C', category: 'ai' },
  { label: 'Hadoop', color: 'FF9900', category: 'ai' },
  { label: 'AI Ethics', color: '6C5CE7', category: 'ai' },
  { label: 'Generative AI', color: '00B894', category: 'ai' },
  { label: 'LLM Fine-tuning', color: '412991', category: 'ai' },
  { label: 'Prompt Engineering', color: '00B894', category: 'ai' }
];

const CATEGORIES = [
  { id: 'development', label: 'Development', icon: <CodeIcon /> },
  { id: 'web3', label: 'Web3', icon: <DesignServicesIcon /> },
  { id: 'ai', label: 'AI', icon: <AnalyticsIcon /> },
  { id: 'marketing', label: 'Marketing', icon: <AnalyticsIcon /> },
  { id: 'qa', label: 'Quality Assurance', icon: <BugReportIcon /> },
  { id: 'business', label: 'Business', icon: <BusinessIcon /> },
];

interface SkillsSelectionProps {
  userType: 'candidate' | 'company' | '';
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  skills: string[];
  setSkills: (skills: string[]) => void;
  requiredSkills: string[];
  setRequiredSkills: (skills: string[]) => void;
  hederaExp: 'yes' | 'no' | '';
  setHederaExp: (exp: 'yes' | 'no' | '') => void;
  skillWarning: string;
  GREEN_MAIN: string;
}

const SkillsSelection: React.FC<SkillsSelectionProps> = ({
  userType,
  selectedCategory,
  setSelectedCategory,
  skills,
  setSkills,
  requiredSkills,
  setRequiredSkills,
  hederaExp,
  setHederaExp,
  skillWarning,
  GREEN_MAIN
}) => {
  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Filter skills by category and search query
  const filteredSkills = useMemo(() => {
    const categoryFiltered = ALL_SKILLS.filter(s => s.category === selectedCategory);

    if (!searchQuery.trim()) {
      return categoryFiltered;
    }

    return categoryFiltered.filter(skill =>
      skill.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedCategory, searchQuery]);

  // Paginate filtered skills
  const paginatedSkills = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSkills.slice(startIndex, endIndex);
  }, [filteredSkills, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredSkills.length / ITEMS_PER_PAGE);

  // Reset to page 1 when category or search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const toggleSkill = (label: string) => {
    if (skills.includes(label)) {
      const x = skills.filter((s: string) => s !== label) || []
      setSkills(x);
    } else {
      // Candidate: single-select, auto-switch to new skill
      if (userType === 'candidate') {
        setSkills([label]);
        return;
      }
      // Company (should not hit here; company uses requiredSkills path)
      if (skills.length >= 1) return;
      const x = [...skills, label]
      setSkills(x);
    }
  };

  const toggleRequiredSkill = (label: string) => {
    if (requiredSkills.includes(label)) {
      const x = requiredSkills.filter((s: string) => s !== label)
      setRequiredSkills(x);
    } else {
      const x = [...requiredSkills, label]
      setRequiredSkills(x);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
          boxShadow: '0 8px 25px rgba(0, 255, 157, 0.3)'
        }}>
          <CodeIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ color: 'black', fontWeight: 700, mb: 2 }}>
          {userType === 'company' ? 'Skills you might be looking for ' : 'Skill Assessment'}
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}>
          {userType === 'company' 
            ? 'Choose the skills that best match your company\'s requirements.'
            : 'Select the skill you want to be assessed on.'
          }
        </Typography>
      </Box>

      {/* Categories Tabs */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)', border: '2px solid #DEE2E6' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600, textAlign: 'center' }}>
          Choose a Skill Category
        </Typography>
        <Tabs
          value={selectedCategory}
          onChange={(_, v) => setSelectedCategory(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 140,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#666',
              borderRadius: 2,
              mx: 0.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 157, 0.1)',
                color: GREEN_MAIN
              },
              '&.Mui-selected': {
                color: GREEN_MAIN,
                backgroundColor: 'rgba(0, 255, 157, 0.15)',
                fontWeight: 700
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: GREEN_MAIN,
              height: 4,
              borderRadius: 2
            }
          }}
        >
          {CATEGORIES.map(c => (
            <Tab
              key={c.id}
              value={c.id}
              label={c.label}
              icon={c.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Skills Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" mb={2} sx={{ color: '#333', fontWeight: 600, textAlign: 'center' }}>
          {userType === 'company' ? `Select ${selectedCategory} skills` : `Choose your ${selectedCategory} skill`}
        </Typography>

        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', mb: 3 }}>
          {filteredSkills.length} skills available • {userType === 'company' ? 'Click to select multiple' : 'Click to select one'}
        </Typography>

        {/* Search Input */}
        <Box sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: GREEN_MAIN }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                    sx={{
                      color: '#999',
                      '&:hover': {
                        color: GREEN_MAIN,
                        backgroundColor: `${GREEN_MAIN}14`,
                      }
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
                '& fieldset': {
                  borderColor: '#E9ECEF',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: GREEN_MAIN,
                },
                '&.Mui-focused fieldset': {
                  borderColor: GREEN_MAIN,
                  borderWidth: 2,
                },
                '& .MuiInputBase-input': {
                  padding: '12px 14px',
                }
              }
            }}
          />
        </Box>

        {skillWarning && (
          <Box sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: '#FFF3CD', border: '1px solid #FFEAA7', textAlign: 'center' }}>
            <Typography color="warning.main" sx={{ fontWeight: 600 }}>⚠️ {skillWarning}</Typography>
          </Box>
        )}

        {/* No Results Message */}
        {filteredSkills.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
              No skills found
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              Try adjusting your search or select a different category
            </Typography>
          </Box>
        )}

        {/* Scrollable Skills Container */}
        {filteredSkills.length > 0 && (
          <>
            <Box sx={{
              maxHeight: 500,
              overflowY: 'auto',
              overflowX: 'hidden',
              p: 2,
              borderRadius: 3,
              backgroundColor: '#FAFBFC',
              border: '2px solid #E9ECEF',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#F1F3F5',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: GREEN_MAIN,
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: GREEN_MAIN,
                  opacity: 0.8,
                }
              }
            }}>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)', lg: 'repeat(5,1fr)' },
                gap: 2,
              }}>
                {paginatedSkills.map(skill => {
              const isCompany = userType === 'company';
              const skillsList = isCompany ? requiredSkills : skills;
              const sel = skillsList.includes(skill.label);

              return (
                <Tooltip
                  key={skill.label}
                  title={`Click to ${sel ? (isCompany ? 'remove' : 'switch to') : (isCompany ? 'add' : 'select')} ${skill.label}`}
                  arrow
                  placement="top"
                >
                  <Box sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                    }
                  }}>
                    <Chip
                      label={skill.label}
                      clickable
                      onClick={() => {
                        if (isCompany) {
                          toggleRequiredSkill(skill.label);
                        } else {
                          toggleSkill(skill.label);
                        }
                      }}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        minHeight: 44,
                        padding: '8px 12px',
                        border: `2px solid #${skill.color}`,
                        backgroundColor: sel ? `#${skill.color}` : 'white',
                        color: sel ? '#fff' : `#${skill.color}`,
                        fontWeight: sel ? 700 : 600,
                        fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                        transition: 'all 0.2s ease',
                        boxShadow: sel ? `0 4px 12px rgba(0,0,0,0.15)` : '0 2px 4px rgba(0,0,0,0.05)',
                        '& .MuiChip-label': {
                          whiteSpace: 'normal',
                          wordWrap: 'break-word',
                          textAlign: 'center',
                          display: 'block',
                          padding: 0,
                          lineHeight: 1.4,
                        },
                        '&:hover': {
                          backgroundColor: `#${skill.color}`,
                          color: '#fff',
                          boxShadow: `0 6px 16px rgba(0,0,0,0.2)`,
                          transform: 'scale(1.02)'
                        }
                      }}
                    />
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: `${GREEN_MAIN}14`,
                  },
                  '&.Mui-selected': {
                    backgroundColor: GREEN_MAIN,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: GREEN_MAIN,
                      opacity: 0.9,
                    }
                  }
                }
              }}
            />
          </Box>
        )}
          </>
        )}

        {/* Skills Summary */}
        <Box sx={{ p: 3, borderRadius: 3, backgroundColor: '#F8F9FA', border: '2px solid #E9ECEF', textAlign: 'center', mt: 3 }}>
          <Typography variant="body1" sx={{ color: '#495057', fontWeight: 600, mb: 1 }}>
            {userType === 'company' ? 'Selected Skills:' : 'Your Selected Skill:'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {userType === 'company' ? (
              requiredSkills.length > 0 ? (
                requiredSkills.map((skill, index) => (
                  <Chip key={index} label={skill} sx={{ background: GREEN_MAIN, color: 'white', fontWeight: 600 }} />
                ))
              ) : (
                <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>No skills selected yet</Typography>
              )
            ) : (
              skills.length > 0 ? (
                skills.map((skill, index) => (
                  <Chip key={index} label={skill} sx={{ background: GREEN_MAIN, color: 'white', fontWeight: 600 }} />
                ))
              ) : (
                <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>No skill selected yet</Typography>
              )
            )}
          </Box>
        </Box>
      </Box>

      {/* Hedera Experience Question */}
      {((userType === 'candidate' && skills.includes('Hedera')) ||
        (userType === 'company' && requiredSkills.includes('Hedera'))) && (
        <Box sx={{ mt: 6, p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #02E2FF08 0%, #00FFC308 100%)', border: '2px solid #02E2FF30', textAlign: 'center' }}>
          <Box sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: '0 6px 20px rgba(2, 226, 255, 0.3)'
          }}>
            <BugReportIcon sx={{ fontSize: 30, color: 'white' }} />
          </Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 600, mb: 3 }}>
            {userType === 'company' ? 'Is Hedera experience required?' : 'Do you have experience working with Hedera?'}
          </Typography>
          <RadioGroup
            row
            value={hederaExp}
            onChange={(e) => setHederaExp(e.target.value as 'yes' | 'no')}
            sx={{ justifyContent: 'center', gap: 4 }}
          >
            <FormControlLabel
              value="yes"
              control={<Radio sx={{ color: '#02E2FF', '&.Mui-checked': { color: '#02E2FF' } }} />}
              label={<Typography sx={{ color: '#333', fontWeight: 500 }}>Yes, I have experience</Typography>}
            />
            <FormControlLabel
              value="no"
              control={<Radio sx={{ color: '#02E2FF', '&.Mui-checked': { color: '#02E2FF' } }} />}
              label={<Typography sx={{ color: '#333', fontWeight: 500 }}>No, I'm new to Hedera</Typography>}
            />
          </RadioGroup>
        </Box>
      )}

      {/* Help Text */}
      <Box sx={{ mt: 4, p: 3, borderRadius: 3, backgroundColor: '#E8F5E8', border: '2px solid #C8E6C9', textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
        <Typography variant="body2" sx={{ color: '#2E7D32', lineHeight: 1.6 }}>
          <strong>💡 Tip:</strong> {userType === 'company' 
            ? 'Select skills that accurately represent your company\'s needs.'
            : 'Choose the skill you\'re most confident in.'
          }
        </Typography>
      </Box>
    </Box>
  );
};

export default SkillsSelection;
