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
  { id: 'tshirt-1', name: 'Classic White', category: 'tshirt', color: '#FFFFFF', image: '👕' },
  { id: 'tshirt-2', name: 'Ocean Blue', category: 'tshirt', color: '#2196F3', image: '👕' },
  { id: 'tshirt-3', name: 'Midnight Black', category: 'tshirt', color: '#000000', image: '👕' },
  { id: 'tshirt-4', name: 'Crimson Red', category: 'tshirt', color: '#F44336', image: '👕' },
  { id: 'tshirt-5', name: 'Forest Green', category: 'tshirt', color: '#4CAF50', image: '👕' },
  { id: 'tshirt-6', name: 'Royal Purple', category: 'tshirt', color: '#9C27B0', image: '👕' },
  { id: 'tshirt-7', name: 'Sunset Orange', category: 'tshirt', color: '#FF9800', image: '👕' },
  { id: 'tshirt-8', name: 'Golden Yellow', category: 'tshirt', color: '#FFC107', image: '👕' },
  { id: 'tshirt-9', name: 'Hot Pink', category: 'tshirt', color: '#E91E63', image: '👕' },
  { id: 'tshirt-10', name: 'Steel Gray', category: 'tshirt', color: '#607D8B', image: '👕' },
  { id: 'tshirt-11', name: 'Turquoise', category: 'tshirt', color: '#00BCD4', image: '👕' },
  { id: 'tshirt-12', name: 'Lime Green', category: 'tshirt', color: '#8BC34A', image: '👕' },

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
  {
    id: 'tshirt',
    name: 'T-Shirts',
    icon: '👕',
    items: clothingItems.filter(item => item.category === 'tshirt')
  },
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
  const [selectedSindaCategory, setSelectedSindaCategory] = useState<'sinda1' | 'sinda2' | 'sinda3'>('sinda1'); // 'sinda1', 'sinda2', or 'sinda3'
  const [selectedSinda1Avatar, setSelectedSinda1Avatar] = useState<'dressproblond' | 'winterblond' | 'problond'>('dressproblond'); // 'dressproblond', 'winterblond', or 'problond' for Sinda 1
  const [selectedSinda2Avatar, setSelectedSinda2Avatar] = useState<'dressproblack' | 'problack' | 'winterblack'>('dressproblack'); // 'dressproblack', 'problack', or 'winterblack' for Sinda 2
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);



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
        // background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
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

        <Container maxWidth="xl" sx={{ py: { xs: 1, md: 2 },  mb: { xs: 1, md: 2 }, position: 'relative', zIndex: 1, height: '100vh' }}>
          {/* T-Shirt Colors Navbar */}
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: { xs: 2, md: 3 },
            p: { xs: 1.5, md: 2 },
            mb: { xs: 1.5, md: 2 },
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: isNavbarCollapsed ? 0 : { xs: 1.5, md: 2 } }}>
              <Box sx={{
                width: { xs: 3, md: 4 },
                height: { xs: 16, md: 20 },
                background: 'linear-gradient(45deg, #FF69B4, #FF1493)',
                borderRadius: 2,
                mr: { xs: 1, md: 1.5 }
              }} />
              <Typography variant="h6" sx={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '0.9rem', md: '1.1rem' }
              }}>
                T-Shirt Colors
              </Typography>
              <Box sx={{ flex: 1 }} />
              
              {/* Collapse/Expand Button */}
              <IconButton
                onClick={() => setIsNavbarCollapsed(!isNavbarCollapsed)}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  p: { xs: 0.5, md: 1 },
                  mr: { xs: 1, md: 1.5 },
                  '&:hover': {
                    color: '#FF69B4',
                    background: 'rgba(255,105,180,0.1)'
                  }
                }}
              >
                {isNavbarCollapsed ? '▼' : '▲'}
              </IconButton>
              
              <Typography variant="body2" sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: { xs: '0.7rem', md: '0.75rem' },
                display: { xs: 'none', sm: isNavbarCollapsed ? 'none' : 'block' }
              }}>
                {isNavbarCollapsed ? '' : 'Click to change'}
              </Typography>
            </Box>

            {/* Collapsible T-Shirt Color Grid */}
            <Box sx={{
              maxHeight: isNavbarCollapsed ? 0 : { xs: '200px', md: '300px' },
              opacity: isNavbarCollapsed ? 0 : 1,
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { 
                  xs: 'repeat(auto-fit, minmax(50px, 1fr))', 
                  sm: 'repeat(auto-fit, minmax(60px, 1fr))',
                  md: 'repeat(auto-fit, minmax(65px, 1fr))'
                },
                gap: { xs: 1, md: 1.5 },
                justifyItems: 'center',
                alignItems: 'start',
                maxWidth: '100%',
                pb: { xs: 1, md: 1.5 }
              }}>
                {clothingItems.filter(item => item.category === 'tshirt').map((item) => (
                  <Box key={item.id} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: { xs: '55px', md: '65px' }
                  }}>
                    <Button
                      onClick={() => handleItemSelect(item.id, 'tshirt')}
                      sx={{
                        width: { xs: '40px', sm: '45px', md: '50px' },
                        height: { xs: '40px', sm: '45px', md: '50px' },
                        minWidth: { xs: '40px', sm: '45px', md: '50px' },
                        borderRadius: '50%',
                        p: 0,
                        background: item.color,
                        border: getSelectedItem('tshirt')?.id === item.id
                          ? '2px solid #FF69B4'
                          : '1px solid rgba(255,255,255,0.2)',
                        boxShadow: getSelectedItem('tshirt')?.id === item.id
                          ? '0 0 12px rgba(255,105,180,0.4), 0 2px 8px rgba(0,0,0,0.3)'
                          : '0 2px 8px rgba(0,0,0,0.2)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          border: '2px solid #FF69B4',
                          boxShadow: '0 0 15px rgba(255,105,180,0.5), 0 3px 12px rgba(0,0,0,0.4)',
                        },
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: getSelectedItem('tshirt')?.id === item.id
                            ? 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                            : 'transparent',
                          borderRadius: '50%',
                        },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {getSelectedItem('tshirt')?.id === item.id && (
                        <Box sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: item.color === '#FFFFFF' ? '#000' : '#fff',
                          fontSize: { xs: '12px', sm: '14px', md: '16px' },
                          zIndex: 1,
                          fontWeight: 'bold'
                        }}>
                          ✓
                        </Box>
                      )}
                    </Button>
                    <Typography variant="caption" sx={{
                      color: getSelectedItem('tshirt')?.id === item.id
                        ? 'rgba(255,255,255,1)'
                        : 'rgba(255,255,255,0.7)',
                      textAlign: 'center',
                      mt: { xs: 0.5, md: 0.7 },
                      fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
                      fontWeight: getSelectedItem('tshirt')?.id === item.id ? 'bold' : 'normal',
                      lineHeight: 1.1,
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.name.replace('T-Shirt', '').replace('Shirt', '').trim()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            height: { 
              xs: 'auto', 
              md: isNavbarCollapsed ? 'calc(100vh - 120px)' : 'calc(100vh - 200px)' 
            },
            gap: { xs: 1.5, md: 2 },
            transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            {/* Avatar Preview - Left Side (70%) */}
            <Box sx={{
              flex: { xs: '1', md: '0 0 70%' },
              height: { xs: '350px', sm: '400px', md: '100%' },
              minHeight: { xs: '350px', sm: '400px', md: '500px' }
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
                    pants: customPantsColor,
                    shoes: customShoesColor,
                    accessories: getSelectedItem('accessories')?.color,
                    skin: customSkinColor,
                  }}
                  sindaCategory={selectedSindaCategory}
                  sinda1AvatarType={selectedSinda1Avatar}
                  sinda2AvatarType={selectedSinda2Avatar}
                  onLoad={() => {
                    console.log('FBX model loaded successfully');
                    console.log('Sinda category:', selectedSindaCategory);
                    console.log('Sinda 1 avatar type:', selectedSinda1Avatar);
                    console.log('Sinda 2 avatar type:', selectedSinda2Avatar);
                    console.log('Custom pants color:', customPantsColor);
                    console.log('Custom shoes color:', customShoesColor);
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

            {/* Right Side - Avatar Selection Sidebar (30%) */}
            <Box sx={{
              flex: { xs: '1', md: '0 0 30%' },
              height: { xs: 'auto', md: '100%' },
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 1.5, md: 2 },
              maxHeight: { xs: 'none', md: '100%' },
              overflow: { xs: 'visible', md: 'auto' }
            }}>
              {/* Avatar Selection Panel */}
              <Box sx={{
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: { xs: 2, md: 4 },
                p: { xs: 2, md: 3 },
                height: 'fit-content'
              }}>
                <Typography variant="h6" sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}>
                  Avatar Selection
                </Typography>

                {/* Sinda Category Selection */}
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                  <Typography variant="body2" sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 'bold',
                    mb: { xs: 1.5, md: 2 },
                    fontSize: { xs: '0.85rem', md: '0.9rem' }
                  }}>
                    Sinda Category:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.8, md: 1 } }}>
                    <Button
                      size="medium"
                      variant={selectedSindaCategory === 'sinda1' ? "contained" : "outlined"}
                      onClick={() => {
                        setSelectedSindaCategory('sinda1');
                        setIsUpdatingOutfit(true);
                        setTimeout(() => setIsUpdatingOutfit(false), 500);
                      }}
                      sx={{
                        justifyContent: 'flex-start',
                        height: { xs: '36px', md: '40px' },
                        fontSize: { xs: '0.8rem', md: '0.85rem' },
                        background: selectedSindaCategory === 'sinda1'
                          ? 'linear-gradient(45deg, #FF69B4, #FF1493)'
                          : 'transparent',
                        border: selectedSindaCategory === 'sinda1'
                          ? 'none'
                          : '1px solid rgba(255,255,255,0.3)',
                        color: selectedSindaCategory === 'sinda1' ? 'white' : 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          background: selectedSindaCategory === 'sinda1'
                            ? 'linear-gradient(45deg, #FF1493, #FF69B4)'
                            : 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Sinda 1
                    </Button>
                    <Button
                      size="medium"
                      variant={selectedSindaCategory === 'sinda2' ? "contained" : "outlined"}
                      onClick={() => {
                        setSelectedSindaCategory('sinda2');
                        setIsUpdatingOutfit(true);
                        setTimeout(() => setIsUpdatingOutfit(false), 500);
                      }}
                      sx={{
                        justifyContent: 'flex-start',
                        height: { xs: '36px', md: '40px' },
                        fontSize: { xs: '0.8rem', md: '0.85rem' },
                        background: selectedSindaCategory === 'sinda2'
                          ? 'linear-gradient(45deg, #4CAF50, #45a049)'
                          : 'transparent',
                        border: selectedSindaCategory === 'sinda2'
                          ? 'none'
                          : '1px solid rgba(255,255,255,0.3)',
                        color: selectedSindaCategory === 'sinda2' ? 'white' : 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          background: selectedSindaCategory === 'sinda2'
                            ? 'linear-gradient(45deg, #45a049, #4CAF50)'
                            : 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Sinda 2
                    </Button>
                    <Button
                      size="medium"
                      variant={selectedSindaCategory === 'sinda3' ? "contained" : "outlined"}
                      onClick={() => {
                        setSelectedSindaCategory('sinda3');
                        setIsUpdatingOutfit(true);
                        setTimeout(() => setIsUpdatingOutfit(false), 500);
                      }}
                      sx={{
                        justifyContent: 'flex-start',
                        height: { xs: '36px', md: '40px' },
                        fontSize: { xs: '0.8rem', md: '0.85rem' },
                        background: selectedSindaCategory === 'sinda3'
                          ? 'linear-gradient(45deg, #2196F3, #1976D2)'
                          : 'transparent',
                        border: selectedSindaCategory === 'sinda3'
                          ? 'none'
                          : '1px solid rgba(255,255,255,0.3)',
                        color: selectedSindaCategory === 'sinda3' ? 'white' : 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          background: selectedSindaCategory === 'sinda3'
                            ? 'linear-gradient(45deg, #1976D2, #2196F3)'
                            : 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Sinda 3
                    </Button>
                  </Box>
                </Box>

                {/* Sinda 1 Style Selection */}
                {selectedSindaCategory === 'sinda1' && (
                  <Box sx={{ mb: { xs: 2, md: 3 } }}>
                    <Typography variant="body2" sx={{
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 'bold',
                      mb: { xs: 1.5, md: 2 },
                      fontSize: { xs: '0.8rem', md: '0.85rem' }
                    }}>
                      Sinda 1 Style:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.8, md: 1 } }}>
                      <Button
                        size="medium"
                        variant={selectedSinda1Avatar === 'dressproblond' ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedSinda1Avatar('dressproblond');
                          setIsUpdatingOutfit(true);
                          setTimeout(() => setIsUpdatingOutfit(false), 500);
                        }}
                        sx={{
                          justifyContent: 'flex-start',
                          height: { xs: '32px', md: '36px' },
                          fontSize: { xs: '0.75rem', md: '0.8rem' },
                          background: selectedSinda1Avatar === 'dressproblond'
                            ? 'linear-gradient(45deg, #9C27B0, #7B1FA2)'
                            : 'transparent',
                          border: selectedSinda1Avatar === 'dressproblond'
                            ? 'none'
                            : '1px solid rgba(255,255,255,0.2)',
                          color: selectedSinda1Avatar === 'dressproblond' ? 'white' : 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            background: selectedSinda1Avatar === 'dressproblond'
                              ? 'linear-gradient(45deg, #7B1FA2, #9C27B0)'
                              : 'rgba(255,255,255,0.1)',
                          },
                        }}
                      >
                        Dress
                      </Button>
                      <Button
                        size="medium"
                        variant={selectedSinda1Avatar === 'winterblond' ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedSinda1Avatar('winterblond');
                          setIsUpdatingOutfit(true);
                          setTimeout(() => setIsUpdatingOutfit(false), 500);
                        }}
                        sx={{
                          justifyContent: 'flex-start',
                          height: { xs: '32px', md: '36px' },
                          fontSize: { xs: '0.75rem', md: '0.8rem' },
                          background: selectedSinda1Avatar === 'winterblond'
                            ? 'linear-gradient(45deg, #00BCD4, #0097A7)'
                            : 'transparent',
                          border: selectedSinda1Avatar === 'winterblond'
                            ? 'none'
                            : '1px solid rgba(255,255,255,0.2)',
                          color: selectedSinda1Avatar === 'winterblond' ? 'white' : 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            background: selectedSinda1Avatar === 'winterblond'
                              ? 'linear-gradient(45deg, #0097A7, #00BCD4)'
                              : 'rgba(255,255,255,0.1)',
                          },
                        }}
                      >
                        Winter
                      </Button>
                      <Button
                        size="medium"
                        variant={selectedSinda1Avatar === 'problond' ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedSinda1Avatar('problond');
                          setIsUpdatingOutfit(true);
                          setTimeout(() => setIsUpdatingOutfit(false), 500);
                        }}
                        sx={{
                          justifyContent: 'flex-start',
                          height: { xs: '32px', md: '36px' },
                          fontSize: { xs: '0.75rem', md: '0.8rem' },
                          background: selectedSinda1Avatar === 'problond'
                            ? 'linear-gradient(45deg, #FF9800, #F57C00)'
                            : 'transparent',
                          border: selectedSinda1Avatar === 'problond'
                            ? 'none'
                            : '1px solid rgba(255,255,255,0.2)',
                          color: selectedSinda1Avatar === 'problond' ? 'white' : 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            background: selectedSinda1Avatar === 'problond'
                              ? 'linear-gradient(45deg, #F57C00, #FF9800)'
                              : 'rgba(255,255,255,0.1)',
                          },
                        }}
                      >
                        Casual
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Sinda 2 Style Selection */}
                {selectedSindaCategory === 'sinda2' && (
                  <Box sx={{ mb: { xs: 2, md: 3 } }}>
                    <Typography variant="body2" sx={{
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 'bold',
                      mb: { xs: 1.5, md: 2 },
                      fontSize: { xs: '0.8rem', md: '0.85rem' }
                    }}>
                      Sinda 2 Style:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.8, md: 1 } }}>
                      <Button
                        size="medium"
                        variant={selectedSinda2Avatar === 'dressproblack' ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedSinda2Avatar('dressproblack');
                          setIsUpdatingOutfit(true);
                          setTimeout(() => setIsUpdatingOutfit(false), 500);
                        }}
                        sx={{
                          justifyContent: 'flex-start',
                          height: { xs: '32px', md: '36px' },
                          fontSize: { xs: '0.75rem', md: '0.8rem' },
                          background: selectedSinda2Avatar === 'dressproblack'
                            ? 'linear-gradient(45deg, #424242, #212121)'
                            : 'transparent',
                          border: selectedSinda2Avatar === 'dressproblack'
                            ? 'none'
                            : '1px solid rgba(255,255,255,0.2)',
                          color: selectedSinda2Avatar === 'dressproblack' ? 'white' : 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            background: selectedSinda2Avatar === 'dressproblack'
                              ? 'linear-gradient(45deg, #212121, #424242)'
                              : 'rgba(255,255,255,0.1)',
                          },
                        }}
                      >
                        Dress
                      </Button>
                      <Button
                        size="medium"
                        variant={selectedSinda2Avatar === 'problack' ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedSinda2Avatar('problack');
                          setIsUpdatingOutfit(true);
                          setTimeout(() => setIsUpdatingOutfit(false), 500);
                        }}
                        sx={{
                          justifyContent: 'flex-start',
                          height: { xs: '32px', md: '36px' },
                          fontSize: { xs: '0.75rem', md: '0.8rem' },
                          background: selectedSinda2Avatar === 'problack'
                            ? 'linear-gradient(45deg, #795548, #5D4037)'
                            : 'transparent',
                          border: selectedSinda2Avatar === 'problack'
                            ? 'none'
                            : '1px solid rgba(255,255,255,0.2)',
                          color: selectedSinda2Avatar === 'problack' ? 'white' : 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            background: selectedSinda2Avatar === 'problack'
                              ? 'linear-gradient(45deg, #5D4037, #795548)'
                              : 'rgba(255,255,255,0.1)',
                          },
                        }}
                      >
                        Casual
                      </Button>
                      <Button
                        size="medium"
                        variant={selectedSinda2Avatar === 'winterblack' ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedSinda2Avatar('winterblack');
                          setIsUpdatingOutfit(true);
                          setTimeout(() => setIsUpdatingOutfit(false), 500);
                        }}
                        sx={{
                          justifyContent: 'flex-start',
                          height: { xs: '32px', md: '36px' },
                          fontSize: { xs: '0.75rem', md: '0.8rem' },
                          background: selectedSinda2Avatar === 'winterblack'
                            ? 'linear-gradient(45deg, #607D8B, #455A64)'
                            : 'transparent',
                          border: selectedSinda2Avatar === 'winterblack'
                            ? 'none'
                            : '1px solid rgba(255,255,255,0.2)',
                          color: selectedSinda2Avatar === 'winterblack' ? 'white' : 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            background: selectedSinda2Avatar === 'winterblack'
                              ? 'linear-gradient(45deg, #455A64, #607D8B)'
                              : 'rgba(255,255,255,0.1)',
                          },
                        }}
                      >
                        Winter
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>


            </Box>
          </Box>
        </Container>
        
      </Box>
    </>
  );
}