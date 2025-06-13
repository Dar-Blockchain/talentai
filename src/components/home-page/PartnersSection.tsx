import React from 'react'
import { Box, useTheme } from '@mui/material'
import Image from 'next/image'

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
            key={idx}
            sx={{ 
              height: {xs: 30, sm: 40, md: 60}, 
              mx: 4,
              position: 'relative',
              display: 'inline-block'
            }}
          >
            <Image
              src={src}
              alt={`partner-${idx}`}
              width={200}
              height={60}
              style={{
                height: '100%',
                width: 'auto',
                objectFit: 'contain'
              }}
              priority={idx < 4} // Prioritize loading first set of images
            />
          </Box>
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
