import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Paper,
  IconButton,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import FBXAvatar from '../components/FBXAvatar';

// Clothing item types
interface ClothingItem {
  id: string;
  name: string;
  category: 'tshirt' | 'pants' | 'shoes' | 'accessories';
  color: string;
  image: string;
  price?: number;
}

  // Sample clothing data
  const clothingItems: ClothingItem[] = [
    // T-Shirts
    { id: 'tshirt-1', name: 'Classic White T-Shirt', category: 'tshirt', color: '#FFFFFF', image: '👕' },
    { id: 'tshirt-2', name: 'Blue Polo Shirt', category: 'tshirt', color: '#2196F3', image: '👕' },
    { id: 'tshirt-3', name: 'Black Graphic Tee', category: 'tshirt', color: '#000000', image: '👕' },
    { id: 'tshirt-4', name: 'Red Striped Shirt', category: 'tshirt', color: '#F44336', image: '👕' },
    { id: 'tshirt-5', name: 'Green Casual Shirt', category: 'tshirt', color: '#4CAF50', image: '👕' },
    
    // Accessories
    { id: 'acc-1', name: 'Black Cap', category: 'accessories', color: '#000000', image: '🧢' },
    { id: 'acc-2', name: 'Sunglasses', category: 'accessories', color: '#000000', image: '🕶️' },
    { id: 'acc-3', name: 'Watch', category: 'accessories', color: '#FFD700', image: '⌚' },
    { id: 'acc-4', name: 'Backpack', category: 'accessories', color: '#795548', image: '🎒' },
    { id: 'acc-5', name: 'Necklace', category: 'accessories', color: '#FFD700', image: '📿' },
  ];

  // Color options for pants
  const pantsColors = [
    { name: 'Blue', color: '#1976D2' },
    { name: 'Black', color: '#212121' },
    { name: 'Khaki', color: '#8D6E63' },
    { name: 'Gray', color: '#757575' },
    { name: 'White', color: '#FAFAFA' },
    { name: 'Red', color: '#F44336' },
    { name: 'Green', color: '#4CAF50' },
    { name: 'Purple', color: '#9C27B0' },
    { name: 'Orange', color: '#FF9800' },
    { name: 'Pink', color: '#E91E63' },
    { name: 'Brown', color: '#795548' },
    { name: 'Navy', color: '#0D47A1' },
  ];

  // Color options for skin
  const skinColors = [
    { name: 'White', color: '#FFFFFF' },
    { name: 'Light', color: '#FFDBB4' },
    { name: 'Fair', color: '#F1C27D' },
    { name: 'Medium', color: '#E6B17A' },
    { name: 'Olive', color: '#D4A574' },
    { name: 'Tan', color: '#C68642' },
    { name: 'Dark', color: '#8D5524' },
    { name: 'Deep', color: '#5D4037' },
    { name: 'Very Dark', color: '#3E2723' },
  ];

  const categories = [
    { id: 'tshirt', name: 'T-Shirts', icon: '👕' },
    { id: 'pants', name: 'Pants Colors', icon: '👖' },
    { id: 'shoes', name: 'Shoes Colors', icon: '👟' },
    { id: 'accessories', name: 'Accessories', icon: '🧢' },
    { id: 'skin', name: 'Skin Color', icon: '👤' },
  ];

export default function AvatarCustomizer() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedCategory, setSelectedCategory] = useState('tshirt');
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({
    tshirt: 'tshirt-1',
    pants: 'pants-1',
    shoes: 'shoes-1',
    accessories: '',
  });
  const [customPantsColor, setCustomPantsColor] = useState('#1976D2');
  const [customShoesColor, setCustomShoesColor] = useState('#000000');
  const [customSkinColor, setCustomSkinColor] = useState('#FFDBB4');
  const [isUpdatingOutfit, setIsUpdatingOutfit] = useState(false);



  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleItemSelect = (itemId: string, category: string) => {
    setIsUpdatingOutfit(true);
    setSelectedItems(prev => ({
      ...prev,
      [category]: itemId,
    }));
    
    // Simulate outfit update delay for better UX
    setTimeout(() => {
      setIsUpdatingOutfit(false);
    }, 500);
  };

  const handleSave = () => {
    // Save avatar configuration
    localStorage.setItem('avatarConfig', JSON.stringify(selectedItems));
    // You can also send this to your backend
    console.log('Avatar saved:', selectedItems);
  };

  const handleReset = () => {
    setSelectedItems({
      tshirt: 'tshirt-1',
      pants: 'pants-1',
      shoes: 'shoes-1',
      accessories: '',
    });
  };

  const getSelectedItemsForCategory = () => {
    if (selectedCategory === 'pants' || selectedCategory === 'shoes') {
      return []; // No items to show for pants/shoes, only color picker
    }
    return clothingItems.filter(item => item.category === selectedCategory);
  };

  const getSelectedItem = (category: string) => {
    const itemId = selectedItems[category];
    const item = clothingItems.find(item => item.id === itemId);
    
    // For pants, use custom color if available
    if (category === 'pants' && item) {
      return {
        ...item,
        color: customPantsColor
      };
    }
    
    // For shoes, use custom color if available
    if (category === 'shoes' && item) {
      return {
        ...item,
        color: customShoesColor
      };
    }
    
    return item;
  };

  return (
    <>
      <Head>
        <title>Avatar Customizer - TalentAI</title>
        <meta name="description" content="Customize your avatar with different clothing options" />
      </Head>
      
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        
        <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.back()}
              sx={{ 
                mb: 3, 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Back
            </Button>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                mb: 2,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Avatar Customizer
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Design your perfect avatar with our collection of clothing and accessories
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Avatar Preview */}
            <Box sx={{ flex: { xs: '1', md: '0 0 33.333%' } }}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  minHeight: 500,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                  Your Avatar
                </Typography>
                
                                {/* 3D FBX Avatar Display */}
                <Box
                  sx={{
                    width: '100%',
                    height: 450,
                    mb: 3,
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    position: 'relative',
                  }}
                >
                  <FBXAvatar 
                    clothingColor={getSelectedItem('tshirt')?.color || '#4A90E2'}
                    selectedOutfit={{
                      tshirt: getSelectedItem('tshirt')?.color,
                      pants: getSelectedItem('pants')?.color,
                      shoes: getSelectedItem('shoes')?.color,
                      accessories: getSelectedItem('accessories')?.color,
                      skin: customSkinColor,
                    }}
                    onLoad={() => {
                      console.log('FBX model loaded successfully');
                      console.log('Current pants color:', getSelectedItem('pants')?.color);
                      console.log('Custom pants color:', customPantsColor);
                      console.log('Skin color:', customSkinColor);
                    }}
                  />
                  
                  {/* Outfit Update Loading Overlay */}
                  {isUpdatingOutfit && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        borderRadius: 3,
                      }}
                    >
                      <Box sx={{ textAlign: 'center', color: 'white' }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Updating Outfit...
                        </Typography>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderTop: '3px solid #00FF9D',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' },
                            },
                            mx: 'auto',
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Selected Items Summary */}
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                    Current Outfit
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(selectedItems).map(([category, itemId]) => {
                      const item = getSelectedItem(category);
                      if (item && itemId) {
                        return (
                          <Chip
                            key={category}
                            label={`${item.image} ${item.name}`}
                            size="small"
                            sx={{
                              backgroundColor: item.color,
                              color: item.color === '#FFFFFF' ? '#333' : 'white',
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                              },
                            }}
                          />
                        );
                      }
                      return null;
                    })}
                  </Stack>
                  
                  {/* Outfit Change Indicator */}
                  {isUpdatingOutfit && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#00FF9D', fontWeight: 'bold' }}>
                        ✨ Outfit Updated!
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ mt: 3, width: '100%' }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(45deg, #00FF9D, #00C853)',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #00C853, #00FF9D)',
                      },
                    }}
                  >
                    Save Avatar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleReset}
                    sx={{
                      borderColor: '#00FF9D',
                      color: '#00FF9D',
                      '&:hover': {
                        borderColor: '#00C853',
                        backgroundColor: 'rgba(0,255,157,0.1)',
                      },
                    }}
                  >
                    Reset
                  </Button>
                </Stack>
              </Paper>
            </Box>

            {/* Clothing Selection */}
            <Box sx={{ flex: { xs: '1', md: '0 0 66.667%' } }}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  minHeight: 500,
                }}
              >
                {/* Category Tabs */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                    Choose Your Style
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {categories.map((category) => (
                      <Box key={category.id}>
                        <Button
                          variant={selectedCategory === category.id ? 'contained' : 'outlined'}
                          onClick={() => handleCategoryChange(category.id)}
                          startIcon={<span style={{ fontSize: '20px' }}>{category.icon}</span>}
                          sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontWeight: 'bold',
                            ...(selectedCategory === category.id && {
                              background: 'linear-gradient(45deg, #00FF9D, #00C853)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #00C853, #00FF9D)',
                              },
                            }),
                            ...(selectedCategory !== category.id && {
                              borderColor: '#00FF9D',
                              color: '#00FF9D',
                              '&:hover': {
                                borderColor: '#00C853',
                                backgroundColor: 'rgba(0,255,157,0.1)',
                              },
                            }),
                          }}
                        >
                          {category.name}
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Clothing Items Grid */}
                {selectedCategory !== 'pants' && selectedCategory !== 'shoes' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                    {getSelectedItemsForCategory().map((item) => (
                      <Box key={item.id}>
                        <Card
                          elevation={selectedItems[selectedCategory] === item.id ? 8 : 2}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: selectedItems[selectedCategory] === item.id ? '3px solid #00FF9D' : '3px solid transparent',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            },
                          }}
                          onClick={() => handleItemSelect(item.id, selectedCategory)}
                        >
                          <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Box
                              sx={{
                                fontSize: '40px',
                                mb: 1,
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                              }}
                            >
                              {item.image}
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 'bold',
                                color: '#333',
                                fontSize: '0.8rem',
                                lineHeight: 1.2,
                              }}
                            >
                              {item.name}
                            </Typography>
                            {selectedItems[selectedCategory] === item.id && (
                              <CheckCircleIcon
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  color: '#00FF9D',
                                  fontSize: '20px',
                                }}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Pants Color Picker */}
                {selectedCategory === 'pants' && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                      Choose Pants Color
                    </Typography>
                    
                    {/* Debug Button */}
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        console.log('Manual test: Current pants color is:', customPantsColor);
                        setCustomPantsColor('#FF0000'); // Force red
                        console.log('Manual test: Changed to red');
                      }}
                      sx={{ mb: 2, background: '#FF0000' }}
                    >
                      TEST: Force Red Pants
                    </Button>
                    
                    {/* Force Color Button */}
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        console.log('FORCE COLOR TEST');
                        setCustomPantsColor('#00FF00'); // Force green
                        setIsUpdatingOutfit(true);
                        setTimeout(() => setIsUpdatingOutfit(false), 1000);
                      }}
                      sx={{ mb: 2, background: '#00FF00', ml: 1 }}
                    >
                      FORCE GREEN
                    </Button>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(4, 1fr)', sm: 'repeat(6, 1fr)', md: 'repeat(8, 1fr)' }, gap: 2 }}>
                      {pantsColors.map((colorOption) => (
                        <Box key={colorOption.color}>
                          <Card
                            elevation={customPantsColor === colorOption.color ? 8 : 2}
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              border: customPantsColor === colorOption.color ? '3px solid #00FF9D' : '3px solid transparent',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                              },
                            }}
                            onClick={() => {
                              setCustomPantsColor(colorOption.color);
                              setIsUpdatingOutfit(true);
                              setTimeout(() => setIsUpdatingOutfit(false), 500);
                            }}
                          >
                            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  backgroundColor: colorOption.color,
                                  border: '3px solid #fff',
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                  mx: 'auto',
                                  mb: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#333',
                                  fontSize: '0.7rem',
                                }}
                              >
                                {colorOption.name}
                              </Typography>
                              {customPantsColor === colorOption.color && (
                                <CheckCircleIcon
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    color: '#00FF9D',
                                    fontSize: '20px',
                                  }}
                                />
                              )}
                            </CardContent>
                          </Card>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Shoes Color Picker */}
                {selectedCategory === 'shoes' && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                      Choose Shoes Color
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(4, 1fr)', sm: 'repeat(6, 1fr)', md: 'repeat(8, 1fr)' }, gap: 2 }}>
                      {pantsColors.map((colorOption) => (
                        <Box key={colorOption.color}>
                          <Card
                            elevation={customShoesColor === colorOption.color ? 8 : 2}
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              border: customShoesColor === colorOption.color ? '3px solid #00FF9D' : '3px solid transparent',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                              },
                            }}
                            onClick={() => {
                              setCustomShoesColor(colorOption.color);
                              setIsUpdatingOutfit(true);
                              setTimeout(() => setIsUpdatingOutfit(false), 500);
                            }}
                          >
                            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  backgroundColor: colorOption.color,
                                  border: '3px solid #fff',
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                  mx: 'auto',
                                  mb: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#333',
                                  fontSize: '0.7rem',
                                }}
                              >
                                {colorOption.name}
                              </Typography>
                              {customShoesColor === colorOption.color && (
                                <CheckCircleIcon
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    color: '#00FF9D',
                                    fontSize: '20px',
                                  }}
                                />
                              )}
                            </CardContent>
                          </Card>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Skin Color Picker */}
                {selectedCategory === 'skin' && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                      Choose Skin Color
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(4, 1fr)', sm: 'repeat(6, 1fr)', md: 'repeat(8, 1fr)' }, gap: 2 }}>
                      {skinColors.map((colorOption) => (
                        <Box key={colorOption.color}>
                          <Card
                            elevation={customSkinColor === colorOption.color ? 8 : 2}
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              border: customSkinColor === colorOption.color ? '3px solid #00FF9D' : '3px solid transparent',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                              },
                            }}
                            onClick={() => {
                              setCustomSkinColor(colorOption.color);
                              setIsUpdatingOutfit(true);
                              setTimeout(() => setIsUpdatingOutfit(false), 500);
                            }}
                          >
                            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  backgroundColor: colorOption.color,
                                  border: '3px solid #fff',
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                  mx: 'auto',
                                  mb: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#333',
                                  fontSize: '0.7rem',
                                }}
                              >
                                {colorOption.name}
                              </Typography>
                              {customSkinColor === colorOption.color && (
                                <CheckCircleIcon
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    color: '#00FF9D',
                                    fontSize: '20px',
                                  }}
                                />
                              )}
                            </CardContent>
                          </Card>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
} 