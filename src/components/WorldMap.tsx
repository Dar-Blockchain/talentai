import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, Paper, Chip, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocationOn as LocationIcon, ZoomIn, ZoomOut } from '@mui/icons-material';

// Dynamically import the entire map component with SSR disabled
const WorldMapComponent = dynamic(
  () => import('@/components/WorldMapComponent'),
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ 
        height: 500, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(131, 16, 255, 0.1)'
      }}>
        <Typography variant="h6" sx={{ color: '#8310FF' }}>
          Loading map...
        </Typography>
      </Box>
    )
  }
) as any;

interface UserLocation {
  country: string;
  count: number;
  users: Array<{
    _id: string;
    username: string;
    email: string;
    Localisation?: string;
  }>;
}

interface WorldMapProps {
  userLocations: UserLocation[];
  totalUsers: number;
}

// Country coordinates mapping
const countryCoordinates: Record<string, [number, number]> = {
  'United States': [39.8283, -98.5795],
  'Canada': [56.1304, -106.3468],
  'Mexico': [23.6345, -102.5528],
  'Brazil': [-14.2350, -51.9253],
  'Argentina': [-38.4161, -63.6167],
  'Colombia': [4.5709, -74.2973],
  'Peru': [-9.1900, -75.0152],
  'Chile': [-35.6751, -71.5430],
  'United Kingdom': [55.3781, -3.4360],
  'France': [46.2276, 2.2137],
  'Germany': [51.1657, 10.4515],
  'Italy': [41.8719, 12.5674],
  'Spain': [40.4637, -3.7492],
  'Russia': [61.5240, 105.3188],
  'China': [35.8617, 104.1954],
  'India': [20.5937, 78.9629],
  'Japan': [36.2048, 138.2529],
  'South Korea': [35.9078, 127.7669],
  'Thailand': [15.8700, 100.9925],
  'Vietnam': [14.0583, 108.2772],
  'Malaysia': [4.2105, 108.9758],
  'Singapore': [1.3521, 103.8198],
  'Indonesia': [-0.7893, 113.9213],
  'Philippines': [12.8797, 121.7740],
  'Pakistan': [30.3753, 69.3451],
  'South Africa': [-30.5595, 22.9375],
  'Egypt': [26.8206, 30.8025],
  'Tunisia': [33.8869, 9.5375],
  'Morocco': [31.7917, -7.0926],
  'Algeria': [28.0339, 1.6596],
  'Saudi Arabia': [23.8859, 45.0792],
  'United Arab Emirates': [23.4241, 53.8478],
  'Turkey': [38.9637, 35.2433],
  'Israel': [31.0461, 34.8516],
  'Australia': [-25.2744, 133.7751],
  'New Zealand': [-40.9006, 174.8860],

};

// Country name normalization
const normalizeCountryName = (countryName: string): string => {
  const normalized = countryName.trim();
  const mapping: Record<string, string> = {
    'US': 'United States',
    'USA': 'United States',
    'United States': 'United States',
    'UK': 'United Kingdom',
    'Great Britain': 'United Kingdom',
    'England': 'United Kingdom',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'FR': 'France',
    'DE': 'Germany',
    'ES': 'Spain',
    'IT': 'Italy',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'AU': 'Australia',
    'BR': 'Brazil',
    'AR': 'Argentina',
    'ZA': 'South Africa',
    'EG': 'Egypt',
    'RU': 'Russia',
    'TN': 'Tunisia',
    'MA': 'Morocco',
    'DZ': 'Algeria',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'TR': 'Turkey',
    'IL': 'Israel',
    'PK': 'Pakistan',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'KR': 'South Korea',
    'MX': 'Mexico',
    'CO': 'Colombia',
    'PE': 'Peru',
    'CL': 'Chile',
    'NZ': 'New Zealand',
  };
  return mapping[normalized] || normalized;
};

const WorldMap: React.FC<WorldMapProps> = ({ userLocations, totalUsers }) => {
  const [map, setMap] = useState<L.Map | null>(null);

  const getMarkerColor = (count: number) => {
    if (count >= 20) return '#8310FF';
    if (count >= 10) return '#9C27B0';
    if (count >= 5) return '#E1BEE7';
    if (count >= 1) return '#F3E5F5';
    return '#F8F9FA';
  };

  const getMarkerRadius = (count: number) => {
    if (count >= 20) return 12;
    if (count >= 10) return 10;
    if (count >= 5) return 8;
    if (count >= 1) return 6;
    return 4;
  };

  const getTopCountries = () => {
    return userLocations
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };

  return (
    <WorldMapComponent
      userLocations={userLocations}
      totalUsers={totalUsers}
      getMarkerColor={getMarkerColor}
      getMarkerRadius={getMarkerRadius}
      getTopCountries={getTopCountries}
      handleZoomIn={handleZoomIn}
      handleZoomOut={handleZoomOut}
    />
  );
};

export default WorldMap; 