import React from 'react'
import { Box, Chip, Typography } from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import RuleIcon from '@mui/icons-material/Rule'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store/store'
import { setCreationType } from '@/store/slices/postGenerationSlice'


const JobPostCreationMethod: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()

  const handleSelectAI = () => {
    dispatch(setCreationType('ai'))
  }

  const handleSelectPipeline = () => {
    dispatch(setCreationType('manual'))
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <Box sx={{ maxWidth: 900, width: '100%' }}>
        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            mb: 2,
            color: '#111827',
          }}
        >
          How would you like to create your job post?
        </Typography>

        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: '#6b7280',
            mb: 5,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Choose the method that best suits your needs. You can either use AI to
          quickly generate a post or build a custom recruitment pipeline.
        </Typography>

        {/* Options */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
          }}
        >
          {/* AI Option */}
          <CreationCard
            title="AI-Powered Creation"
            description="Describe your ideal candidate and let AI generate a comprehensive job post with matching configuration in minutes."
            icon={<SmartToyIcon sx={{ fontSize: 32, color: 'white' }} />}
            accent="#10b981"
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            features={[
              'Quick & Easy (2 steps)',
              'AI-generated job description',
              'Automatic candidate matching',
            ]}
            chip={{ label: 'Recommended', bg: '#d1fae5', color: '#065f46' }}
            onClick={handleSelectAI} // ✅ Redux dispatch
          />

          {/* Pipeline Option */}
          <CreationCard
            title="Custom Pipeline Builder"
            description="Design your own recruitment workflow with custom tests, interviews, and conditions for complete control."
            icon={<RuleIcon sx={{ fontSize: 32, color: 'white' }} />}
            accent="#6366f1"
            gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
            features={[
              'Full customization (3 steps)',
              'Visual pipeline builder',
              'Custom evaluation steps',
            ]}
            chip={{ label: 'Advanced', bg: '#e0e7ff', color: '#4338ca' }}
            onClick={handleSelectPipeline} // ✅ Redux dispatch
          />
        </Box>
      </Box>
    </Box>
  )
}

export default JobPostCreationMethod

interface CreationCardProps {
  title: string
  description: string
  icon: React.ReactNode
  accent: string
  gradient: string
  features: string[]
  chip: {
    label: string
    bg: string
    color: string
  }
  onClick: () => void
}

const CreationCard: React.FC<CreationCardProps> = ({
  title,
  description,
  icon,
  accent,
  gradient,
  features,
  chip,
  onClick,
}) => (
  <Box
    onClick={onClick}
    sx={{
      p: 4,
      border: '2px solid #e5e7eb',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
      '&:hover': {
        borderColor: accent,
        boxShadow: `0 10px 30px ${accent}26`,
        transform: 'translateY(-4px)',
      },
    }}
  >
    <Box
      sx={{
        width: 60,
        height: 60,
        borderRadius: '12px',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
      }}
    >
      {icon}
    </Box>

    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5, color: '#111827' }}>
      {title}
    </Typography>

    <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.7, mb: 3 }}>
      {description}
    </Typography>

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {features.map(feature => (
        <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: accent,
            }}
          />
          <Typography variant="body2" sx={{ color: '#374151' }}>
            {feature}
          </Typography>
        </Box>
      ))}
    </Box>

    <Chip
      label={chip.label}
      size="small"
      sx={{
        mt: 3,
        backgroundColor: chip.bg,
        color: chip.color,
        fontWeight: 600,
      }}
    />
  </Box>
)

