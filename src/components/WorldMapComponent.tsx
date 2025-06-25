import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { Box, Typography, Paper, Chip, IconButton, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocationOn as LocationIcon, ZoomIn, ZoomOut } from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const MapWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 500,
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid rgba(131, 16, 255, 0.1)',
  '& .leaflet-container': {
    borderRadius: '16px',
    height: '100%',
    width: '100%',
  },
  '& .leaflet-popup-content-wrapper': {
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(131, 16, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  '& .leaflet-popup-content': {
    margin: '12px',
    fontFamily: '"Inter", sans-serif',
    color: '#333',
  },
  '& .leaflet-popup-tip': {
    background: 'rgba(255, 255, 255, 0.98)',
    border: '1px solid rgba(131, 16, 255, 0.1)',
  },
}));

const ControlPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 20,
  right: 20,
  background: 'rgba(255,255,255,0.95)',
  padding: theme.spacing(2.5),
  borderRadius: 12,
  border: '1px solid rgba(131, 16, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  zIndex: 1000,
  minWidth: 200,
}));

const LegendPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  left: 20,
  background: 'rgba(255,255,255,0.95)',
  padding: theme.spacing(2.5),
  borderRadius: 12,
  border: '1px solid rgba(131, 16, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  zIndex: 1000,
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

interface WorldMapComponentProps {
  userLocations: UserLocation[];
  totalUsers: number;
  getMarkerColor: (count: number) => string;
  getMarkerRadius: (count: number) => number;
  getTopCountries: () => UserLocation[];
  handleZoomIn: () => void;
  handleZoomOut: () => void;
}

// Country coordinates mapping
const countryCoordinates: Record<string, [number, number]> = {
  'United States': [39.8283, -98.5795],
  'United States of America': [39.8283, -98.5795],
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
  'Libya': [26.3351, 17.2283],
  'Togo': [8.6195, 0.8248],
  'Cameroon': [7.3697, 12.3547],
  'Saudi Arabia': [23.8859, 45.0792],
  'United Arab Emirates': [23.4241, 53.8478],
  'Qatar': [25.3548, 51.1839],
  'Kuwait': [29.3117, 47.4818],
  'Bahrain': [26.0667, 50.5577],
  'Oman': [21.4735, 55.9754],
  'Jordan': [30.5852, 36.2384],
  'Lebanon': [33.8547, 35.8623],
  'Syria': [34.8021, 38.9968],
  'Iraq': [33.2232, 43.6793],
  'Iran': [32.4279, 53.6880],
  'Turkey': [38.9637, 35.2433],
  'Israel': [31.0461, 34.8516],
  'Palestine': [31.9522, 35.2332],
  'Yemen': [15.5527, 48.5164],
  'Afghanistan': [33.9391, 67.7100],
  'Bangladesh': [23.6850, 90.3563],
  'Sri Lanka': [7.8731, 80.7718],
  'Nepal': [28.3949, 84.1240],
  'Bhutan': [27.5142, 90.4336],
  'Maldives': [3.2028, 73.2207],
  'Myanmar': [21.9162, 95.9560],
  'Laos': [19.8563, 102.4955],
  'Cambodia': [12.5657, 104.9910],
  'Taiwan': [23.6978, 121.1355],
  'North Korea': [40.3399, 127.5101],
  'Mongolia': [46.8625, 103.8467],
  'Kazakhstan': [48.0196, 66.9237],
  'Uzbekistan': [41.3775, 64.5853],
  'Kyrgyzstan': [41.2044, 74.7661],
  'Tajikistan': [38.5358, 71.0965],
  'Turkmenistan': [38.9697, 59.5563],
  'Azerbaijan': [40.1431, 47.5769],
  'Georgia': [42.3154, 43.3569],
  'Armenia': [40.0691, 45.0382],
  'Belarus': [53.7098, 27.9534],
  'Ukraine': [48.3794, 31.1656],
  'Moldova': [47.4116, 28.3699],
  'Romania': [45.9432, 24.9668],
  'Bulgaria': [42.7339, 25.4858],
  'Greece': [39.0742, 21.8243],
  'Croatia': [45.1000, 15.2000],
  'Slovenia': [46.0569, 14.5058],
  'Hungary': [47.1625, 19.5033],
  'Slovakia': [48.6690, 19.6990],
  'Czech Republic': [49.8175, 15.4730],
  'Poland': [51.9194, 19.1451],
  'Lithuania': [55.1694, 23.8813],
  'Latvia': [56.8796, 24.6032],
  'Estonia': [58.5953, 25.0136],
  'Finland': [61.9241, 25.7482],
  'Sweden': [60.1282, 18.6435],
  'Norway': [60.4720, 8.4689],
  'Denmark': [56.2639, 9.5018],
  'Netherlands': [52.1326, 5.2913],
  'Belgium': [50.8503, 4.3517],
  'Switzerland': [46.8182, 8.2275],
  'Austria': [47.5162, 14.5501],
  'Portugal': [39.3999, -8.2245],
  'Ireland': [53.1424, -7.6921],
  'Iceland': [64.9631, -19.0208],
  'Malta': [35.9375, 14.3754],
  'Cyprus': [35.1264, 33.4299],
  'Luxembourg': [49.8153, 6.1296],
  'Monaco': [43.7384, 7.4246],
  'Liechtenstein': [47.1660, 9.5554],
  'Andorra': [42.5063, 1.5218],
  'San Marino': [43.9424, 12.4578],
  'Vatican City': [41.9029, 12.4534],
  'Guatemala': [15.7835, -90.2308],
  'Belize': [17.1899, -88.4976],
  'El Salvador': [13.7942, -88.8965],
  'Honduras': [15.1999, -86.2419],
  'Nicaragua': [12.8654, -85.2072],
  'Costa Rica': [9.9281, -84.0907],
  'Panama': [8.5380, -80.7821],
  'Venezuela': [6.4238, -66.5897],
  'Guyana': [4.8604, -58.9302],
  'Suriname': [3.9193, -56.0278],
  'French Guiana': [3.9339, -53.1258],
  'Ecuador': [-1.8312, -78.1834],
  'Bolivia': [-16.2902, -63.5887],
  'Paraguay': [-23.4425, -58.4438],
  'Uruguay': [-32.5228, -55.7658],
  'New Zealand': [-40.9006, 174.8860],
  'Fiji': [-17.7134, 178.0650],
  'Papua New Guinea': [-6.3150, 143.9555],
  'New Caledonia': [-20.9043, 165.6180],
  'Vanuatu': [-15.3767, 166.9592],
  'Solomon Islands': [-9.6457, 160.1562],
  'Tonga': [-21.1790, -175.1982],
  'Samoa': [-13.8506, -171.7514],
  'Kiribati': [-3.3704, -168.7340],
  'Tuvalu': [-7.1095, 177.6493],
  'Nauru': [-0.5228, 166.9315],
  'Palau': [7.5150, 134.5825],
  'Marshall Islands': [7.1315, 171.1845],
  'Micronesia': [7.4256, 150.5508],
  'Cook Islands': [-21.2368, -159.7777],
  'Niue': [-19.0544, -169.8672],
  'Tokelau': [-9.2002, -171.8484],
  'American Samoa': [-14.2709, -170.1322],
  'Guam': [13.4443, 144.7937],
  'Northern Mariana Islands': [17.3308, 145.3847],
  'Benin': [9.3075, 2.3158],
  'Ivory Coast': [7.5395, -5.5471],
  'Senegal': [14.6928, -14.0060],
};

// Country name normalization
const normalizeCountryName = (countryName: string): string => {
  const normalized = countryName.trim();
  const mapping: Record<string, string> = {
    'US': 'United States',
    'USA': 'United States',
    'United States': 'United States',
    'United States of America': 'United States of America',
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
    'TG': 'Togo',
    'CM': 'Cameroon',
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
    'SN': 'Senegal',
    'CI': 'Ivory Coast',
    'BJ': 'Benin',
    
  };
  return mapping[normalized] || normalized;
};

// Component to handle map instance
const MapController: React.FC<{ setMap: (map: L.Map) => void }> = ({ setMap }) => {
  const map = useMap();
  
  useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  
  return null;
};

const WorldMapComponent: React.FC<WorldMapComponentProps> = ({ 
  userLocations, 
  totalUsers, 
  getMarkerColor, 
  getMarkerRadius, 
  getTopCountries, 
  handleZoomIn, 
  handleZoomOut 
}) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [topCountToShow, setTopCountToShow] = useState(5);

  const sortedCountries = userLocations
    .sort((a, b) => b.count - a.count);
  const showLoadMore = sortedCountries.length > topCountToShow;

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
      
      <MapWrapper>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <MapController setMap={setMap} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {userLocations.map((location) => {
            const normalizedCountry = normalizeCountryName(location.country);
            const coordinates = countryCoordinates[normalizedCountry];
            
            if (!coordinates) return null;
            
            return (
              <CircleMarker
                key={location.country}
                center={coordinates}
                radius={getMarkerRadius(location.count)}
                fillColor={getMarkerColor(location.count)}
                color="#8310FF"
                weight={2}
                opacity={0.8}
                fillOpacity={0.7}
              >
                <Popup>
                  <div style={{ textAlign: 'center', minWidth: '200px' }}>
                    <Typography variant="h6" sx={{ color: '#8310FF', fontWeight: 600, mb: 1 }}>
                      {normalizedCountry}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                      {location.count} users
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {location.users.length > 0 ? `${location.users[0].username} and ${location.count - 1} others` : 'No users'}
                    </Typography>
                  </div>
                </Popup>
                <Tooltip>
                  <div>
                    <strong>{normalizedCountry}</strong><br />
                    {location.count} users
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Control Panel */}
        <ControlPanel>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#8310FF' }}>
            Map Controls
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <IconButton
              onClick={handleZoomIn}
              size="small"
              sx={{
                background: 'rgba(131, 16, 255, 0.1)',
                color: '#8310FF',
                '&:hover': { background: 'rgba(131, 16, 255, 0.2)' }
              }}
            >
              <ZoomIn fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleZoomOut}
              size="small"
              sx={{
                background: 'rgba(131, 16, 255, 0.1)',
                color: '#8310FF',
                '&:hover': { background: 'rgba(131, 16, 255, 0.2)' }
              }}
            >
              <ZoomOut fontSize="small" />
            </IconButton>
          </Box>
          
          {sortedCountries.length > 0 && (
            <>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  color: '#8310FF',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  background: 'rgba(255,255,255,0.95)',
                  borderBottom: '1px solid #f3e5f5',
                  py: 1,
                  px: 1,
                  borderRadius: '8px 8px 0 0',
                }}
              >
                Top Countries
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  maxHeight: 250,
                  overflowY: 'auto',
                  background: 'rgba(131,16,255,0.04)',
                  border: '1px solid #f3e5f5',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(131,16,255,0.04)',
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': {
                    width: 6,
                    background: '#f3e5f5',
                    borderRadius: 8,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#d1b3ff',
                    borderRadius: 8,
                  },
                }}
              >
                {sortedCountries.slice(0, topCountToShow).map((location, index) => (
                  <React.Fragment key={location.country}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 500, color: '#333' }}>
                        {index + 1}. {normalizeCountryName(location.country)}
                      </Typography>
                      <Chip
                        label={location.count}
                        size="small"
                        sx={{
                          background: 'rgba(131, 16, 255, 0.1)',
                          color: '#8310FF',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                    {index < topCountToShow - 1 && index < sortedCountries.length - 1 && <Divider sx={{ mx: 1 }} />}
                  </React.Fragment>
                ))}
                {showLoadMore && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
                    <button
                      style={{
                        background: 'linear-gradient(90deg, #8310FF 60%, #9C27B0 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 20px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        boxShadow: '0 2px 8px rgba(131,16,255,0.10)',
                        letterSpacing: 1,
                        transition: 'background 0.2s',
                      }}
                      onClick={() => setTopCountToShow(sortedCountries.length)}
                    >
                      Load More
                    </button>
                  </Box>
                )}
              </Box>
            </>
          )}
        </ControlPanel>

        {/* Legend Panel */}
        <LegendPanel>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#8310FF' }}>
            User Density
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: '#8310FF' }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>20+ users</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', background: '#9C27B0' }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>10-19 users</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: '#E1BEE7' }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>5-9 users</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#F3E5F5' }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>1-4 users</Typography>
            </Box>
          </Box>
        </LegendPanel>
      </MapWrapper>
    </StyledPaper>
  );
};

export default WorldMapComponent; 