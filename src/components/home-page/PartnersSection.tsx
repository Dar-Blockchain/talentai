import React from 'react'
import { Box, useTheme } from '@mui/material'

const partners = [
  '/images/partners/Darblockchain.png',
  '/images/partners/hashgraph.png',
  '/images/partners/hedera.png',
  '/images/partners/lightency.png'
]

const PartnersSection = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        px: 3,
        py: { xs: 3, sm: 4, md: 5 },
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        width: '100%',
        backgroundColor: theme.palette.background.default,
        position: 'relative'
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          animation: 'scroll-left 20s linear infinite'
        }}
      >
        {[...partners, ...partners].map((src, idx) => (
          <Box
            component="img"
            key={idx}
            src={src}
            alt={`partner-${idx}`}
            sx={{ height: 60, mx: 4 }}
          />
        ))}
      </Box>

      <style jsx global>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </Box>
  )
}

export default PartnersSection
