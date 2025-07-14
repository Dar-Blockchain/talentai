import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';

const GREEN_MAIN = '#8310FF';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  background: '#fff',
  borderRadius: '24px',
  border: '1px solid #eee',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
}));

export default function CandidateInterviewDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('api_token');
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}interviewDetails/${id}`;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch interview details');
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/dashboardCandidate')}
        sx={{ mb: 3, color: GREEN_MAIN, fontWeight: 600 }}
      >
        Back to Dashboard
      </Button>
      <StyledPaper>
        <Typography variant="h4" sx={{ fontWeight: 800, color: GREEN_MAIN, mb: 2 }}>
          Interview Details
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !data ? (
          <Alert severity="info">No data found for this interview.</Alert>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: '#191919', fontWeight: 600 }}>
                Type: <Chip label={data.type || '-'} color="primary" size="small" />
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#191919', fontWeight: 600 }}>
                Overall Score: <Chip label={data.overallScore ?? '-'} color="success" size="small" />
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#191919', fontWeight: 600 }}>
                Post Name: {data.post?.jobDetails?.title || '-'}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#191919', fontWeight: 600 }}>
                Date: {data.createdAt ? new Date(data.createdAt).toLocaleString() : '-'}
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN_MAIN, mb: 2 }}>
              Interview Q&A Details
            </Typography>
            {Array.isArray(data.skillDetails) && data.skillDetails.length > 0 ? (
              data.skillDetails.map((s: any, i: number) => (
                <Box key={i} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#191919' }}>
                    {s.name || '-'}
                  </Typography>
                  {Array.isArray(s.questionAnswerList) && s.questionAnswerList.length > 0 ? (
                    s.questionAnswerList.map((qa: any, idx: number) => (
                      <Box key={idx} sx={{ mb: 1, pl: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Q{idx + 1}: {qa.question || '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 2 }}>
                          A{idx + 1}: {qa.answer || '-'}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', pl: 2 }}>
                      No questions/answers.
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography>No Q&A details available.</Typography>
            )}
          </>
        )}
      </StyledPaper>
    </Container>
  );
} 