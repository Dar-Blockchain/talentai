import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from 'react-simple-maps';
import { Box, Typography, Paper, Chip, Tooltip as MuiTooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocationOn as LocationIcon } from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid rgba(131, 16, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(131,16,255,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(131,16,255,0.12)'
  }
}));

const MapContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 500,
  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid rgba(131, 16, 255, 0.1)',
}));

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

const WorldMap: React.FC<WorldMapProps> = ({ userLocations, totalUsers }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Enhanced country mapping for better matching
  const countryMapping: Record<string, string> = {
    'US': 'United States of America',
    'USA': 'United States of America',
    'United States': 'United States of America',
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
    'LY': 'Libya',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'QA': 'Qatar',
    'KW': 'Kuwait',
    'BH': 'Bahrain',
    'OM': 'Oman',
    'JO': 'Jordan',
    'LB': 'Lebanon',
    'SY': 'Syria',
    'IQ': 'Iraq',
    'IR': 'Iran',
    'TR': 'Turkey',
    'IL': 'Israel',
    'PS': 'Palestine',
    'YE': 'Yemen',
    'PK': 'Pakistan',
    'AF': 'Afghanistan',
    'BD': 'Bangladesh',
    'LK': 'Sri Lanka',
    'NP': 'Nepal',
    'BT': 'Bhutan',
    'MV': 'Maldives',
    'MM': 'Myanmar',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'LA': 'Laos',
    'KH': 'Cambodia',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'TW': 'Taiwan',
    'KR': 'South Korea',
    'KP': 'North Korea',
    'MN': 'Mongolia',
    'KZ': 'Kazakhstan',
    'UZ': 'Uzbekistan',
    'KG': 'Kyrgyzstan',
    'TJ': 'Tajikistan',
    'TM': 'Turkmenistan',
    'AZ': 'Azerbaijan',
    'GE': 'Georgia',
    'AM': 'Armenia',
    'BY': 'Belarus',
    'UA': 'Ukraine',
    'MD': 'Moldova',
    'RO': 'Romania',
    'BG': 'Bulgaria',
    'GR': 'Greece',
    'HR': 'Croatia',
    'SI': 'Slovenia',
    'HU': 'Hungary',
    'SK': 'Slovakia',
    'CZ': 'Czech Republic',
    'PL': 'Poland',
    'LT': 'Lithuania',
    'LV': 'Latvia',
    'EE': 'Estonia',
    'FI': 'Finland',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'PT': 'Portugal',
    'IE': 'Ireland',
    'IS': 'Iceland',
    'MT': 'Malta',
    'CY': 'Cyprus',
    'LU': 'Luxembourg',
    'MC': 'Monaco',
    'LI': 'Liechtenstein',
    'AD': 'Andorra',
    'SM': 'San Marino',
    'VA': 'Vatican City',
    'MX': 'Mexico',
    'GT': 'Guatemala',
    'BZ': 'Belize',
    'SV': 'El Salvador',
    'HN': 'Honduras',
    'NI': 'Nicaragua',
    'CR': 'Costa Rica',
    'PA': 'Panama',
    'CO': 'Colombia',
    'VE': 'Venezuela',
    'GY': 'Guyana',
    'SR': 'Suriname',
    'GF': 'French Guiana',
    'EC': 'Ecuador',
    'PE': 'Peru',
    'BO': 'Bolivia',
    'PY': 'Paraguay',
    'UY': 'Uruguay',
    'CL': 'Chile',
    'NZ': 'New Zealand',
    'FJ': 'Fiji',
    'PG': 'Papua New Guinea',
    'NC': 'New Caledonia',
    'VU': 'Vanuatu',
    'SB': 'Solomon Islands',
    'TO': 'Tonga',
    'WS': 'Samoa',
    'KI': 'Kiribati',
    'TV': 'Tuvalu',
    'NR': 'Nauru',
    'PW': 'Palau',
    'MH': 'Marshall Islands',
    'FM': 'Micronesia',
    'CK': 'Cook Islands',
    'NU': 'Niue',
    'TK': 'Tokelau',
    'AS': 'American Samoa',
    'GU': 'Guam',
    'MP': 'Northern Mariana Islands',
  };

  const normalizeCountryName = (countryName: string): string => {
    const normalized = countryName.trim();
    return countryMapping[normalized] || normalized;
  };

  const getCountryColor = (geo: any) => {
    const countryName = geo.properties.ADMIN || geo.properties.name;
    const normalizedCountryName = normalizeCountryName(countryName);
    
    const countryData = userLocations.find(loc => 
      normalizeCountryName(loc.country).toLowerCase() === normalizedCountryName.toLowerCase()
    );
    
    if (countryData) {
      const intensity = Math.min(countryData.count / 20, 1); // Normalize to 0-1
      const baseColor = [131, 16, 255]; // Purple base
      const alpha = 0.2 + intensity * 0.8;
      return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`;
    }
    return '#f8f9fa';
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX + 15, y: event.clientY - 15 });
  };

  const handleMouseLeave = () => {
    setTooltipContent('');
    setSelectedCountry(null);
  };

  const handleMouseEnter = (geo: any) => {
    const countryName = geo.properties.ADMIN || geo.properties.name;
    const normalizedCountryName = normalizeCountryName(countryName);
    
    const countryData = userLocations.find(loc => 
      normalizeCountryName(loc.country).toLowerCase() === normalizedCountryName.toLowerCase()
    );
    
    setSelectedCountry(countryName);
    
    if (countryData) {
      setTooltipContent(`
        <div style="padding: 12px; font-family: 'Inter', sans-serif;">
          <div style="font-weight: 600; font-size: 14px; color: #8310FF; margin-bottom: 4px;">
            ${countryName}
          </div>
          <div style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px;">
            ${countryData.count} users
          </div>
          <div style="font-size: 12px; color: #666;">
            ${countryData.users.length > 0 ? `${countryData.users[0].username} and ${countryData.count - 1} others` : 'No users'}
          </div>
        </div>
      `);
    } else {
      setTooltipContent(`
        <div style="padding: 12px; font-family: 'Inter', sans-serif;">
          <div style="font-weight: 600; font-size: 14px; color: #8310FF; margin-bottom: 4px;">
            ${countryName}
          </div>
          <div style="font-size: 12px; color: #666;">
            No users registered yet
          </div>
        </div>
      `);
    }
  };

  const getTopCountries = () => {
    return userLocations
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return (
    <StyledPaper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#8310FF', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon sx={{ fontSize: 28 }} />
          Global User Distribution
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`${userLocations.length} Countries`} 
            color="primary" 
            variant="outlined"
            size="small"
          />
          <Chip 
            label={`${totalUsers} Total Users`} 
            color="secondary" 
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>
      
      <MapContainer>
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: 147,
            center: [0, 0]
          }}
        >
          <ZoomableGroup>
            <Geographies geography="/world-countries.json">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.ADMIN || geo.properties.name;
                  const normalizedCountryName = normalizeCountryName(countryName);
                  
                  const countryData = userLocations.find(loc => 
                    normalizeCountryName(loc.country).toLowerCase() === normalizedCountryName.toLowerCase()
                  );
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getCountryColor(geo)}
                      stroke={selectedCountry === countryName ? '#8310FF' : '#ffffff'}
                      strokeWidth={selectedCountry === countryName ? 2 : 0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: { 
                          fill: countryData ? '#8310FF' : '#e8eaf6',
                          outline: 'none',
                          cursor: countryData ? 'pointer' : 'default',
                          stroke: '#8310FF',
                          strokeWidth: 1.5,
                        },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={() => handleMouseEnter(geo)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        
        {/* Enhanced Legend */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 20, 
          left: 20, 
          background: 'rgba(255,255,255,0.95)', 
          padding: 2.5, 
          borderRadius: 3,
          border: '1px solid rgba(131, 16, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#8310FF' }}>
            User Density
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 24, height: 16, background: 'rgba(131, 16, 255, 0.2)', borderRadius: 1 }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>1-5 users</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 24, height: 16, background: 'rgba(131, 16, 255, 0.5)', borderRadius: 1 }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>6-15 users</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 24, height: 16, background: 'rgba(131, 16, 255, 0.8)', borderRadius: 1 }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>16-20 users</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 24, height: 16, background: 'rgba(131, 16, 255, 1)', borderRadius: 1 }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>20+ users</Typography>
            </Box>
          </Box>
        </Box>

        {/* Top Countries Panel */}
        {getTopCountries().length > 0 && (
          <Box sx={{ 
            position: 'absolute', 
            top: 20, 
            right: 20, 
            background: 'rgba(255,255,255,0.95)', 
            padding: 2.5, 
            borderRadius: 3,
            border: '1px solid rgba(131, 16, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            minWidth: 200
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#8310FF' }}>
              Top Countries
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {getTopCountries().map((location, index) => (
                <Box key={location.country} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 500, color: '#333' }}>
                    {index + 1}. {location.country}
                  </Typography>
                  <Chip 
                    label={location.count} 
                    size="small" 
                    sx={{ 
                      background: 'rgba(131, 16, 255, 0.1)', 
                      color: '#8310FF',
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }} 
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </MapContainer>

      {/* Enhanced Tooltip */}
      {tooltipContent && (
        <div
          style={{
            position: 'fixed',
            top: tooltipPosition.y,
            left: tooltipPosition.x,
            background: 'rgba(255, 255, 255, 0.98)',
            color: '#333',
            padding: '0',
            borderRadius: '12px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            maxWidth: '250px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid rgba(131, 16, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
    </StyledPaper>
  );
};

export default WorldMap; 