import React from 'react';
import { Box, TextField, Button, InputAdornment, Autocomplete, Paper } from '@mui/material';
import Image from 'next/image';
import { JOB_LOCATIONS } from '@/constants/post';

interface JobSearchBarProps {
  searchQuery: string;
  selectedLocation: string;
  onSearchQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
}

const JobSearchBar: React.FC<JobSearchBarProps> = ({
  searchQuery,
  selectedLocation,
  onSearchQueryChange,
  onLocationChange,
  onSearch,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        maxWidth: 900,
        alignItems: 'center',
        gap: { xs: 2, sm: 0 },
        mb: 4,
        p: 1,
        backgroundColor: '#fff',
        borderRadius: '50px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        mx: 'auto',
      }}
    >
      {/* Job Title Input */}
      <TextField
        fullWidth
        placeholder="Job Title"
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        onKeyUp={(e) => e.key === 'Enter' && onSearch()}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Image
                src="/icons/search.svg"
                alt="search"
                width={24}
                height={24}
                style={{ opacity: 0.7 }}
              />
            </InputAdornment>
          ),
          sx: {
            height: '48px',
            paddingRight: 1,
            '& input': {
              padding: '10px 0px',
              fontSize: '14px',
              color: '#333',
            },
          },
        }}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            display: 'flex',
            alignItems: 'center',
            borderRadius: 0,
            border: 'none',
            backgroundColor: 'transparent',
            '& fieldset': { border: 'none' },
          },
          '& input::placeholder': {
            fontSize: '16px',
            color: 'rgba(135, 135, 134, 1)',
          },
        }}
      />

      {/* Divider (hidden on mobile) */}
      <Box
        sx={{
          width: '1px',
          backgroundColor: '#e5e7eb',
          height: '30px',
          display: { xs: 'none', sm: 'block' },
          mx: 1,
        }}
      />

      {/* Location Autocomplete */}
      <Autocomplete
        value={selectedLocation}
        onChange={(e, newValue) => onLocationChange(newValue || '')}
        options={JOB_LOCATIONS}
        freeSolo
        onInputChange={(event, newInputValue) => {
          if (event?.type === 'change') onLocationChange(newInputValue);
        }}
        PaperComponent={({ children, ...other }) => (
          <Paper
            {...other}
            sx={{
              maxHeight: 300,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            {children}
          </Paper>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="All Locations"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Image
                    src="/icons/location.svg"
                    alt="location"
                    width={24}
                    height={24}
                    style={{ opacity: 0.7 }}
                  />
                </InputAdornment>
              ),
              sx: {
                height: '48px',
                paddingRight: 1,
                '& input': {
                  padding: '10px 0px',
                  fontSize: '16px',
                },
              },
            }}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                border: 'none',
                '& fieldset': { border: 'none' },
              },
              '& input::placeholder': {
                fontSize: '16px',
                color: 'rgba(135, 135, 134, 1)',
              },
            }}
          />
        )}
        sx={{ flex: 1 }}
      />

      {/* Search Button */}
      <Button
        onClick={onSearch}
        sx={{
          border: '1px solid rgba(163, 98, 239, 1)',
          color: 'rgba(163, 98, 239, 1)',
          borderRadius: '50px',
          textTransform: 'none',
          px: 3,
          py: 1.2,
          fontWeight: 600,
          fontSize: '16px',
          minWidth: '160px',
          ml: { xs: 0, sm: 1 },
          mt: { xs: 1, sm: 0 },
          '&:hover': {
            backgroundColor: 'rgba(163, 98, 239, 1)',
            color: 'white',
          },
        }}
      >
        Search Job
      </Button>
    </Box>
  );
};

export default React.memo(JobSearchBar);
