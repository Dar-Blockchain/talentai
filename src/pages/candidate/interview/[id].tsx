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
                const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}interviewDetails/getInterviewDetailsById/${id}`;
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
                            {data.post?.jobDetails?.status && (
                                <Typography variant="subtitle1" sx={{ color: '#191919', fontWeight: 600 }}>
                                    Status: <Chip label={data.post.jobDetails.status} color="default" size="small" />
                                </Typography>
                            )}
                        </Box>
                        {/* Skill Analysis Section */}
                        {data.skillAnalysis && (
                            <Box sx={{ mb: 4, p: 3, background: '#f8fafc', borderRadius: 3, border: '1px solid #eee' }}>
                                <Typography variant="h6" sx={{ color: GREEN_MAIN, fontWeight: 700, mb: 2 }}>
                                    Skill Analysis
                                </Typography>
                                {data.skillAnalysis.skillSummary && (
                                    <>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Main Technologies:</Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                                            {data.skillAnalysis.skillSummary.mainTechnologies?.map((tech: string, idx: number) => (
                                                <Chip key={idx} label={tech} color="primary" variant="outlined" />
                                            ))}
                                        </Stack>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Complementary Skills:</Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                                            {data.skillAnalysis.skillSummary.complementarySkills?.map((skill: string, idx: number) => (
                                                <Chip key={idx} label={skill} color="secondary" variant="outlined" />
                                            ))}
                                        </Stack>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Learning Path:</Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                                            {data.skillAnalysis.skillSummary.learningPath?.map((lp: string, idx: number) => (
                                                <Chip key={idx} label={lp} color="success" variant="outlined" />
                                            ))}
                                        </Stack>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Stack Complexity:</Typography>
                                        <Chip label={data.skillAnalysis.skillSummary.stackComplexity} color="default" variant="outlined" />
                                    </>
                                )}
                                {data.skillAnalysis.requiredSkills && (
                                    <>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Required Skills:</Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                                            {data.skillAnalysis.requiredSkills.map((skill: any) => (
                                                <Chip key={skill._id} label={`${skill.name} (${skill.level})`} color="primary" variant="outlined" />
                                            ))}
                                        </Stack>
                                    </>
                                )}
                                {data.skillAnalysis.suggestedSkills && (
                                    <>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Suggested Skills:</Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                                            {Object.entries(data.skillAnalysis.suggestedSkills).map(([cat, arr]) => (
                                                (arr as any[]).map((sugg, idx) => (
                                                    <Chip key={sugg._id || idx} label={`${sugg.name}${sugg.priority ? ` (${sugg.priority})` : ''}`} color="info" variant="outlined" />
                                                ))
                                            ))}
                                        </Stack>
                                    </>
                                )}
                            </Box>
                        )}
                        {/* LinkedIn Post Section */}
                        {data.linkedinPost && data.linkedinPost.formattedContent && (
                            <Box sx={{ mb: 4, p: 3, background: '#f3f0ff', borderRadius: 3, border: '1px solid #eee' }}>
                                <Typography variant="h6" sx={{ color: GREEN_MAIN, fontWeight: 700, mb: 2 }}>
                                    LinkedIn Post Preview
                                </Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                    {data.linkedinPost.formattedContent.headline}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {data.linkedinPost.formattedContent.introduction}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {data.linkedinPost.formattedContent.companyPitch}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {data.linkedinPost.formattedContent.roleOverview}
                                </Typography>
                                {data.linkedinPost.formattedContent.keyPoints && (
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                        {data.linkedinPost.formattedContent.keyPoints.map((point: string, idx: number) => (
                                            <li key={idx} style={{ color: '#333', marginBottom: 4 }}>{point}</li>
                                        ))}
                                    </ul>
                                )}
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {data.linkedinPost.formattedContent.skillsRequired}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {data.linkedinPost.formattedContent.benefitsSection}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1, color: GREEN_MAIN, fontWeight: 600 }}>
                                    {data.linkedinPost.formattedContent.callToAction}
                                </Typography>
                                {data.linkedinPost.hashtags && (
                                    <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
                                        {data.linkedinPost.hashtags.map((tag: string, idx: number) => (
                                            <Chip key={idx} label={tag} color="secondary" variant="outlined" />
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        )}
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