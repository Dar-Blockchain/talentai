import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  TablePagination,
  Typography,
  Stack,
} from '@mui/material';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchInterviewAssessments,
  setPage,
  setRowsPerPage,
  setCurrentTab,
  selectInterview,
} from '@/store/slices/interviewSlice';
import { INTERVIEW_TYPES } from '@/constants/interviewConstants';
import PostInterviewTab from './PostInterviewTab';
import InterviewGridView from './InterviewGridView';

export type InterviewDetailsTabsProps = {
  profile: any;
};

export default function InterviewDetailsTabs({ profile }: InterviewDetailsTabsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error, total, page, rowsPerPage, currentTab } = useSelector(selectInterview);

  // Fetch data when tab, page, or rowsPerPage changes
  useEffect(() => {
    if (profile?._id) {
      dispatch(
        fetchInterviewAssessments({
          type: currentTab,
          page,
          limit: rowsPerPage,
          candidateId: profile._id,
        })
      );
    }
  }, [currentTab, page, rowsPerPage, profile?._id, dispatch]);

  const handleTabChange = useCallback(
    (_: any, newValue: string) => {
      dispatch(setCurrentTab(newValue));
    },
    [dispatch]
  );

  const handleChangePage = useCallback(
    (_: any, newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  const handleChangeRowsPerPage = useCallback(
    (e: any) => {
      dispatch(setRowsPerPage(parseInt(e.target.value, 10)));
    },
    [dispatch]
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tabs Navigation */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            py: 1,
            backgroundColor: '#f8f9fc',
            borderRadius: 2,
            boxShadow: 'inset 0 0 0 1px rgba(131,16,255,0.08)',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              minHeight: 44,
              minWidth: 120,
              color: '#555',
              borderRadius: 1.5,
              mx: 0.5,
              px: 1.5,
              transition: 'all .2s ease',
              '&:hover': {
                backgroundColor: '#ffffff',
                boxShadow: '0 6px 18px rgba(0,0,0,.06)',
              },
              '&.Mui-selected': {
                color: '#2b2152',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 22px rgba(131,16,255,.15)',
              },
            },
            '& .MuiTabs-indicator': {
              height: 0,
              background: 'linear-gradient(90deg,#8310FF 0%,#02E2FF 100%)',
              borderRadius: 2,
            },
          }}
        >
          {INTERVIEW_TYPES.map((t) => (
            <Tab
              key={t.value}
              value={t.value}
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  {t.icon}
                  <Typography sx={{ fontWeight: 800 }}>{t.label}</Typography>
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#8310FF' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Tab Content */}
          {currentTab === 'post_interview' ? (
            <PostInterviewTab data={data} loading={loading} error={error} />
          ) : currentTab === 'skill' ? (
            <InterviewGridView
              data={data}
              type="skill"
              total={total}
              emptyMessage="No skill assessments found"
              emptySubtext="Assessments you complete will appear here."
            />
          ) : currentTab === 'hr' ? (
            <InterviewGridView
              data={data}
              type="hr"
              total={total}
              emptyMessage="No HR interviews found"
              emptySubtext="Your HR interviews will appear here."
            />
          ) : currentTab === 'onboarding' ? (
            <InterviewGridView
              data={data}
              type="onboarding"
              total={total}
              emptyMessage="No onboarding items yet"
              emptySubtext="Onboarding items will appear here."
            />
          ) : currentTab === 'soft' ? (
            <InterviewGridView
              data={data}
              type="soft"
              total={total}
              emptyMessage="No soft skills assessments found"
              emptySubtext="Soft skills assessments you complete will appear here."
            />
          ) : null}

          {/* Pagination */}
          {data.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[3, 5, 10]}
                sx={
                  currentTab === 'post_interview'
                    ? {
                        '& .MuiTablePagination-toolbar': {
                          backgroundColor: '#f8f9fa',
                          borderRadius: 2,
                          px: 2,
                        },
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                          color: '#666',
                          fontWeight: 500,
                        },
                      }
                    : {}
                }
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
