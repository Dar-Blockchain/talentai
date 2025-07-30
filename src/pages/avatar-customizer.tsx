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
    { name: 'Gray', color: '#757575' },
    { name: 'White', color: '#FAFAFA' },
    { name: 'Green', color: '#4CAF50' },
   
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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
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
          background: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          pointerEvents: 'none'
        }} />
        
        <Container maxWidth="xl" sx={{ py: 2, position: 'relative', zIndex: 1, height: '100vh' }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            height: { xs: 'auto', md: 'calc(100vh - 100px)' },
            gap: { xs: 2, md: 3 }
          }}>
            {/* Avatar Preview - Left Side (70%) */}
            <Box sx={{ 
              flex: { xs: '1', md: '0 0 60%' }, 
              height: { xs: '400px', md: '100%' },
              minHeight: { xs: '400px', md: '600px' }
            }}>
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: { xs: 2, md: 4 },
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                      borderRadius: { xs: 2, md: 4 },
                    }}
                  >
                    <Box sx={{ textAlign: 'center', color: 'white' }}>
                      <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        Updating Outfit...
                      </Typography>
                      <Box
                        sx={{
                          width: { xs: 30, md: 40 },
                          height: { xs: 30, md: 40 },
                          border: '3px solid rgba(255,255,255,0.3)',
                          borderTop: '3px solid #FF69B4',
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
            </Box>

            {/* Right Side - Categories Sidebar + Content (30%) */}
            <Box sx={{ 
              flex: { xs: '1', md: '0 0 40%' }, 
              height: { xs: 'auto', md: '100%' },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' }
            }}>
              {/* Categories Sidebar */}
              <Box sx={{ 
                width: { xs: '100%', md: '60px', lg: '80px' }, 
                height: { xs: 'auto', md: '100%' },
                minHeight: { xs: '60px', md: 'auto' },
                background: 'rgba(0,0,0,0.9)',
                borderRight: { xs: 'none', md: '1px solid rgba(255,255,255,0.1)' },
                borderBottom: { xs: '1px solid rgba(255,255,255,0.1)', md: 'none' },
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' },
                alignItems: 'center',
                justifyContent: { xs: 'space-around', md: 'flex-start' },
                pt: { xs: 1, md: 3 },
                pb: { xs: 1, md: 0 },
                gap: { xs: 1, md: 2 }
              }}>
                {categories.map((category) => (
                  <Box key={category.id}>
                    <Button
                      onClick={() => handleCategoryChange(category.id)}
                      sx={{
                        minWidth: { xs: '40px', md: '50px', lg: '60px' },
                        height: { xs: '40px', md: '50px', lg: '60px' },
                        borderRadius: '50%',
                        p: 0,
                        background: selectedCategory === category.id 
                          ? 'linear-gradient(45deg, #FF69B4, #FF1493)' 
                          : 'transparent',
                        border: selectedCategory === category.id 
                          ? '2px solid #FF69B4' 
                          : '2px solid rgba(255,255,255,0.2)',
                        color: selectedCategory === category.id ? 'white' : 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          background: selectedCategory === category.id 
                            ? 'linear-gradient(45deg, #FF1493, #FF69B4)' 
                            : 'rgba(255,255,255,0.1)',
                          borderColor: '#FF69B4',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{category.icon}</span>
                    </Button>
                  </Box>
                ))}
              </Box>

              {/* Content Area */}
              <Box sx={{ 
                flex: 1, 
                height: { xs: 'auto', md: '100%' },
                minHeight: { xs: '400px', md: 'auto' },
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: { xs: '0 0 4px 4px', md: '0 4px 4px 0' },
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Search Bar */}
                <Box sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderBottom: '1px solid rgba(255,255,255,0.1)' 
                }}>
                  <Typography variant="h6" sx={{ 
                    color: 'white', 
                    fontWeight: 'bold', 
                    mb: 2,
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }}>
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </Typography>
                </Box>

                                                  {/* Clothing Items Grid - Vertical Layout */}
                  <Box sx={{ 
                    flex: 1, 
                    p: { xs: 2, md: 3 }, 
                    overflow: 'auto' 
                  }}>
                    {selectedCategory !== 'pants' && selectedCategory !== 'shoes' && selectedCategory !== 'skin' && (
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: { xs: 1, md: 2 },
                        maxHeight: { xs: '300px', md: '400px' },
                        overflow: 'auto',
                        pr: 1
                      }}>
                        {getSelectedItemsForCategory().map((item) => (
                          <Box key={item.id}>
                            <Card
                              elevation={selectedItems[selectedCategory] === item.id ? 8 : 2}
                              sx={{
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: selectedItems[selectedCategory] === item.id ? '3px solid #FF69B4' : '3px solid transparent',
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                  transform: 'translateX(4px)',
                                  boxShadow: '0 8px 25px rgba(255,105,180,0.3)',
                                  borderColor: '#FF69B4',
                                },
                              }}
                              onClick={() => handleItemSelect(item.id, selectedCategory)}
                            >
                              <CardContent sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 1.5, md: 2 },
                                p: { xs: 1.5, md: 2 }
                              }}>
                                <Box
                                  sx={{
                                    fontSize: { xs: '28px', md: '32px' },
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                                    flexShrink: 0,
                                    width: { xs: '40px', md: '48px' },
                                    height: { xs: '40px', md: '48px' },
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                  }}
                                >
                                  {item.image}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 'bold',
                                      color: 'white',
                                      fontSize: { xs: '0.8rem', md: '0.9rem' },
                                      mb: 0.25,
                                    }}
                                  >
                                    {item.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'rgba(255,255,255,0.6)',
                                      fontSize: { xs: '0.65rem', md: '0.7rem' },
                                    }}
                                  >
                                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                  </Typography>
                                </Box>
                                {selectedItems[selectedCategory] === item.id && (
                                  <CheckCircleIcon
                                    sx={{
                                      color: '#FF69B4',
                                      fontSize: { xs: '20px', md: '22px' },
                                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                              </CardContent>
                            </Card>
                          </Box>
                        ))}
                      </Box>
                    )}

                  {/* Color Picker Sidebar */}
                  {(selectedCategory === 'pants' || selectedCategory === 'shoes' || selectedCategory === 'skin') && (
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      {/* Color Picker Header */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        mb: 2
                      }}>
                   
                     
                      </Box>

                      {/* Color Grid - Vertical Layout */}
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: { xs: 1, md: 2 },
                        maxHeight: { xs: '300px', md: '400px' },
                        overflow: 'auto',
                        pr: 1
                      }}>
                        {(selectedCategory === 'pants' ? pantsColors :
                          selectedCategory === 'shoes' ? pantsColors :
                          skinColors).map((colorOption) => (
                          <Box key={colorOption.color}>
                            <Card
                              elevation={
                                (selectedCategory === 'pants' && customPantsColor === colorOption.color) ||
                                (selectedCategory === 'shoes' && customShoesColor === colorOption.color) ||
                                (selectedCategory === 'skin' && customSkinColor === colorOption.color) ? 8 : 2
                              }
                              sx={{
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: 
                                  (selectedCategory === 'pants' && customPantsColor === colorOption.color) ||
                                  (selectedCategory === 'shoes' && customShoesColor === colorOption.color) ||
                                  (selectedCategory === 'skin' && customSkinColor === colorOption.color) 
                                    ? '3px solid #FF69B4' 
                                    : '3px solid transparent',
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                  transform: 'translateX(4px)',
                                  boxShadow: '0 8px 25px rgba(255,105,180,0.3)',
                                  borderColor: '#FF69B4',
                                },
                              }}
                              onClick={() => {
                                if (selectedCategory === 'pants') {
                                  setCustomPantsColor(colorOption.color);
                                } else if (selectedCategory === 'shoes') {
                                  setCustomShoesColor(colorOption.color);
                                } else if (selectedCategory === 'skin') {
                                  setCustomSkinColor(colorOption.color);
                                }
                                setIsUpdatingOutfit(true);
                                setTimeout(() => setIsUpdatingOutfit(false), 500);
                              }}
                            >
                              <CardContent sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 1.5, md: 2 },
                                p: { xs: 1.5, md: 2 }
                              }}>
                                <Box
                                  sx={{
                                    width: { xs: 32, md: 36 },
                                    height: { xs: 32, md: 36 },
                                    borderRadius: '50%',
                                    backgroundColor: colorOption.color,
                                    border: '2px solid #fff',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                    flexShrink: 0,
                                  }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 'bold',
                                      color: 'white',
                                      fontSize: { xs: '0.8rem', md: '0.9rem' },
                                      mb: 0.25,
                                    }}
                                  >
                                    {colorOption.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'rgba(255,255,255,0.6)',
                                      fontSize: { xs: '0.65rem', md: '0.7rem' },
                                    }}
                                  >
                                    {colorOption.color}
                                  </Typography>
                                </Box>
                                {((selectedCategory === 'pants' && customPantsColor === colorOption.color) ||
                                  (selectedCategory === 'shoes' && customShoesColor === colorOption.color) ||
                                  (selectedCategory === 'skin' && customSkinColor === colorOption.color)) && (
                                  <CheckCircleIcon
                                    sx={{
                                      color: '#FF69B4',
                                      fontSize: { xs: '20px', md: '22px' },
                                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                      flexShrink: 0,
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

                                    
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </>
    );
} 