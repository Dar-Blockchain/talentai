import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import Head from 'next/head';
import AvatarCustomizerLink from '@/components/AvatarCustomizerLink';

export default function AvatarDemo() {
  return (
    <>
      <Head>
        <title>Avatar Customizer Demo - TalentAI</title>
        <meta name="description" content="Demo page for avatar customization features" />
      </Head>
      
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold', 
              mb: 2,
              textAlign: 'center'
            }}
          >
            Avatar Customizer Demo
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)', 
              mb: 6,
              textAlign: 'center'
            }}
          >
            Try out our new avatar customization feature with different clothing options
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Feature Overview */}
            <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  height: '100%',
                }}
              >
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                  🎨 Customize Your Avatar
                </Typography>
                
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, color: '#00FF9D', fontWeight: 'bold' }}>
                      👕 T-Shirts & Tops
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      Choose from a variety of t-shirts, polo shirts, and casual tops in different colors and styles.
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, color: '#00FF9D', fontWeight: 'bold' }}>
                      👖 Pants & Bottoms
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      Select from jeans, dress pants, chinos, and casual bottoms to complete your look.
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, color: '#00FF9D', fontWeight: 'bold' }}>
                      👟 Shoes & Footwear
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      Pick the perfect footwear from sneakers, dress shoes, boots, and more.
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, color: '#00FF9D', fontWeight: 'bold' }}>
                      🧢 Accessories
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      Add the finishing touches with caps, sunglasses, watches, and other accessories.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* Quick Access */}
            <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  height: '100%',
                }}
              >
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                  🚀 Get Started
                </Typography>
                
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                      Try the Avatar Customizer
                    </Typography>
                    <AvatarCustomizerLink size="large" />
                  </Box>
                  
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                      Different Link Styles
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <AvatarCustomizerLink variant="button" size="small" />
                      <AvatarCustomizerLink variant="icon" size="medium" />
                      <AvatarCustomizerLink variant="text" />
                    </Stack>
                  </Box>
                  
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                      Features
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        ✅ Real-time avatar preview
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        ✅ Multiple clothing categories
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        ✅ Save and reset functionality
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        ✅ Responsive design
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        ✅ Modern UI with animations
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* Usage Examples */}
            <Box sx={{ width: '100%' }}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                  💻 Code Examples
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                  <Box>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#00FF9D' }}>
                          Button Style
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, fontFamily: 'monospace' }}>
                          {`<AvatarCustomizerLink />`}
                        </Typography>
                        <AvatarCustomizerLink size="small" />
                      </CardContent>
                    </Card>
                  </Box>
                  
                  <Box>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#00FF9D' }}>
                          Icon Style
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, fontFamily: 'monospace' }}>
                          {`<AvatarCustomizerLink variant="icon" />`}
                        </Typography>
                        <AvatarCustomizerLink variant="icon" size="medium" />
                      </CardContent>
                    </Card>
                  </Box>
                  
                  <Box>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#00FF9D' }}>
                          Text Style
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, fontFamily: 'monospace' }}>
                          {`<AvatarCustomizerLink variant="text" />`}
                        </Typography>
                        <AvatarCustomizerLink variant="text" />
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
} 