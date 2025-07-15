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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

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
                setData(json.data);
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/dashboardCandidate')}
                    sx={{ color: GREEN_MAIN, fontWeight: 600 }}
                >
                    Back to Dashboard
                </Button>
                {/* Télécharger PDF Button */}
                {(!loading && !error && data) && (
                    <Button
                        variant="contained"
                        sx={{ background: GREEN_MAIN, color: '#fff', fontWeight: 700, borderRadius: 3, textTransform: 'none' }}
                        onClick={() => window.print()}
                    >
                        Télécharger PDF
                    </Button>
                )}
            </Box>
            {/* Print-only CSS */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #printable-content, #printable-content * { visibility: visible !important; }
                    #printable-content { position: absolute !important; left: 0; top: 0; width: 100vw; background: #fff !important; }
                    .MuiPaper-root, .MuiBox-root, .MuiTypography-root, .MuiChip-root, .MuiDivider-root {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                }
            `}</style>
            {/* Main interview content for printing */}
            <div id="printable-content">
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
                            {/* Job Details Section */}
                            {data.post?.jobDetails && (
                                <Box sx={{ mb: 4, p: 3, background: '#f8fafc', borderRadius: 3, border: '1px solid #eee' }}>
                                    <Typography variant="h6" sx={{ color: GREEN_MAIN, fontWeight: 700, mb: 2 }}>
                                        Job Details
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{data.post.jobDetails.title}</Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>{data.post.jobDetails.description}</Typography>
                                 
                                    {/* <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Salary:</Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>{data.post.jobDetails.salary ? `${data.post.jobDetails.salary.min} - ${data.post.jobDetails.salary.max} ${data.post.jobDetails.salary.currency}` : '-'}</Typography>
                                   */}
                                </Box>
                            )}
                            {/* Skill Analysis Section */}
                            {/* {data.post?.skillAnalysis && (
                                <Box sx={{ mb: 4, p: 3, background: '#f8fafc', borderRadius: 3, border: '1px solid #eee' }}>
                                    <Typography variant="h6" sx={{ color: GREEN_MAIN, fontWeight: 700, mb: 2 }}>
                                        Skill Analysis
                                    </Typography>
                                    {data.post.skillAnalysis.skillSummary && (
                                        <>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Main Technologies:</Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                                                {data.post.skillAnalysis.skillSummary.mainTechnologies?.map((tech: string, idx: number) => (
                                                    <Chip key={idx} label={tech} color="primary" variant="outlined" />
                                                ))}
                                            </Stack>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Complementary Skills:</Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                                                {data.post.skillAnalysis.skillSummary.complementarySkills?.map((skill: string, idx: number) => (
                                                    <Chip key={idx} label={skill} color="secondary" variant="outlined" />
                                                ))}
                                            </Stack>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Learning Path:</Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                                                {data.post.skillAnalysis.skillSummary.learningPath?.map((lp: string, idx: number) => (
                                                    <Chip key={idx} label={lp} color="success" variant="outlined" />
                                                ))}
                                            </Stack>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Stack Complexity:</Typography>
                                            <Chip label={data.post.skillAnalysis.skillSummary.stackComplexity} color="default" variant="outlined" />
                                        </>
                                    )}
                                    {data.post.skillAnalysis.requiredSkills && (
                                        <>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Required Skills:</Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                                                {data.post.skillAnalysis.requiredSkills.map((skill: any) => (
                                                    <Chip key={skill._id} label={`${skill.name} (${skill.level})`} color="primary" variant="outlined" />
                                                ))}
                                            </Stack>
                                        </>
                                    )}
                                    {data.post.skillAnalysis.suggestedSkills && (
                                        <>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Suggested Skills:</Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                                                {Object.entries(data.post.skillAnalysis.suggestedSkills).map(([cat, arr]) => (
                                                    (arr as any[]).map((sugg, idx) => (
                                                        <Chip key={sugg._id || idx} label={`${sugg.name}${sugg.priority ? ` (${sugg.priority})` : ''}`} color="info" variant="outlined" />
                                                    ))
                                                ))}
                                            </Stack>
                                        </>
                                    )}
                                </Box>
                            )} */}
                            {/* LinkedIn Post Section */}
                            {/* {data.post?.linkedinPost && data.post.linkedinPost.formattedContent && (
                                <Box sx={{ mb: 4, p: 3, background: '#f3f0ff', borderRadius: 3, border: '1px solid #eee' }}>
                                    <Typography variant="h6" sx={{ color: GREEN_MAIN, fontWeight: 700, mb: 2 }}>
                                        LinkedIn Post Preview
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                        {data.post.linkedinPost.formattedContent.headline}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        {data.post.linkedinPost.formattedContent.introduction}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        {data.post.linkedinPost.formattedContent.companyPitch}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        {data.post.linkedinPost.formattedContent.roleOverview}
                                    </Typography>
                                    {data.post.linkedinPost.formattedContent.keyPoints && (
                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                            {data.post.linkedinPost.formattedContent.keyPoints.map((point: string, idx: number) => (
                                                <li key={idx} style={{ color: '#333', marginBottom: 4 }}>{point}</li>
                                            ))}
                                        </ul>
                                    )}
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        {data.post.linkedinPost.formattedContent.skillsRequired}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        {data.post.linkedinPost.formattedContent.benefitsSection}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1, color: GREEN_MAIN, fontWeight: 600 }}>
                                        {data.post.linkedinPost.formattedContent.callToAction}
                                    </Typography>
                                    {data.post.linkedinPost.hashtags && (
                                        <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
                                            {data.post.linkedinPost.hashtags.map((tag: string, idx: number) => (
                                                <Chip key={idx} label={tag} color="secondary" variant="outlined" />
                                            ))}
                                        </Stack>
                                    )}
                                </Box>
                            )} */}
                            {/* Assessment Result Section */}
                            {data.jobAssessmentResult?.analysis && (
                                <Box sx={{ mb: 4, p: 3, background: '#e6f7fa', borderRadius: 3, border: '1px solid #b2ebf2' }}>
                                    <Typography variant="h6" sx={{ color: GREEN_MAIN, fontWeight: 700, mb: 2 }}>
                                        Assessment Analysis
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                        Overall Score: <Chip label={data.jobAssessmentResult.analysis.overallScore} color="success" size="small" />
                                    </Typography>
                                    {data.jobAssessmentResult.analysis.technicalLevel && (
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Technical Level: {data.jobAssessmentResult.analysis.technicalLevel}
                                        </Typography>
                                    )}
                                    {data.jobAssessmentResult.analysis.jobMatch && (
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Job Match: {data.jobAssessmentResult.analysis.jobMatch.status} ({data.jobAssessmentResult.analysis.jobMatch.percentage}%)
                                        </Typography>
                                    )}
                                    {Array.isArray(data.jobAssessmentResult.analysis.skillAnalysis) && data.jobAssessmentResult.analysis.skillAnalysis.length > 0 && (
                                        <>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Skill Analysis:</Typography>
                                            {data.jobAssessmentResult.analysis.skillAnalysis.map((skill: any, idx: number) => (
                                                <Box key={idx} sx={{ mb: 2, pl: 2 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{skill.skillName} (Required: {skill.requiredLevel}, Demonstrated: {skill.demonstratedExperienceLevel})</Typography>
                                                    <Typography variant="body2" sx={{ color: 'green', mb: 0.5 }}>Strengths:</Typography>
                                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                        {skill.strengths?.map((str: string, i: number) => (
                                                            <li key={i} style={{ color: '#388e3c' }}>{str}</li>
                                                        ))}
                                                    </ul>
                                                    <Typography variant="body2" sx={{ color: 'red', mb: 0.5 }}>Weaknesses:</Typography>
                                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                        {skill.weaknesses?.map((w: string, i: number) => (
                                                            <li key={i} style={{ color: '#d32f2f' }}>{w}</li>
                                                        ))}
                                                    </ul>
                                                    <Typography variant="body2" sx={{ mb: 0.5 }}>Confidence Score: {skill.confidenceScore}</Typography>
                                                    <Typography variant="body2" sx={{ mb: 0.5 }}>Match: {skill.match}</Typography>
                                                </Box>
                                            ))}
                                        </>
                                    )}
                                    {Array.isArray(data.jobAssessmentResult.analysis.recommendations) && data.jobAssessmentResult.analysis.recommendations.length > 0 && (
                                        <>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Recommendations:</Typography>
                                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                {data.jobAssessmentResult.analysis.recommendations.map((rec: string, idx: number) => (
                                                    <li key={idx} style={{ color: '#1976d2' }}>{rec}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                    {Array.isArray(data.jobAssessmentResult.analysis.nextSteps) && data.jobAssessmentResult.analysis.nextSteps.length > 0 && (
                                        <>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Next Steps:</Typography>
                                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                {data.jobAssessmentResult.analysis.nextSteps.map((step: string, idx: number) => (
                                                    <li key={idx} style={{ color: '#388e3c' }}>{step}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                    {Array.isArray(data.jobAssessmentResult.analysis.jobMatch?.keyGaps) && data.jobAssessmentResult.analysis.jobMatch.keyGaps.length > 0 && (
                                        <>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Key Gaps:</Typography>
                                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                {data.jobAssessmentResult.analysis.jobMatch.keyGaps.map((gap: string, idx: number) => (
                                                    <li key={idx} style={{ color: '#d32f2f' }}>{gap}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </Box>
                            )}
                            {data.type === 'onboarding' && Array.isArray(data.recommendations) && data.recommendations.length > 0 && (
                                <Box sx={{ mb: 4, p: 3, background: '#f3f0ff', borderRadius: 3, border: '1px solid #eee' }}>
                                    <Typography variant="h6" sx={{ color: GREEN_MAIN, fontWeight: 700, mb: 2 }}>
                                        Recommendations
                                    </Typography>
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                        {data.recommendations.map((rec: string, idx: number) => {
                                            // Regex to find URLs
                                            const urlRegex = /(https?:\/\/[^\s]+)/g;
                                            const parts = rec.split(urlRegex);
                                            return (
                                                <li key={idx} style={{ color: '#1976d2', marginBottom: 4 }}>
                                                    {parts.map((part, i) =>
                                                        urlRegex.test(part) ? (
                                                            <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#1565c0', textDecoration: 'underline', wordBreak: 'break-all' }}>{part}</a>
                                                        ) : (
                                                            <span key={i}>{part}</span>
                                                        )
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
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
                                            s.questionAnswerList.map((qa: any, idx: number) => {
                                                let statusColor = '#1976d2';
                                                let StatusIcon = RemoveCircleIcon;
                                                let statusLabel = qa.status ? qa.status.replace('_', ' ') : 'unknown';
                                                if (qa.status === 'correct') {
                                                    statusColor = '#388e3c';
                                                    StatusIcon = CheckCircleIcon;
                                                    statusLabel = 'correct';
                                                } else if (qa.status === 'partial_correct') {
                                                    statusColor = '#ffa000';
                                                    StatusIcon = ErrorIcon;
                                                    statusLabel = 'partial correct';
                                                } else if (qa.status === 'incorrect') {
                                                    statusColor = '#d32f2f';
                                                    StatusIcon = RemoveCircleIcon;
                                                    statusLabel = 'incorrect';
                                                }
                                                return (
                                                    <Box key={idx} sx={{ mb: 1, pl: 2 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            Q{idx + 1}: {qa.question || '-'}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 2 }}>
                                                            A{idx + 1}: {qa.answer || '-'}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: statusColor, ml: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <StatusIcon fontSize="small" sx={{ color: statusColor, mr: 0.5 }} />
                                                            Status: {statusLabel}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: 'success.main', ml: 4, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <CheckCircleIcon fontSize="small" sx={{ color: '#388e3c', mr: 0.5 }} />
                                                            Example Correct Answer: {qa.exampleCorrectAnswer ? qa.exampleCorrectAnswer : '-'}
                                                        </Typography>
                                                    </Box>
                                                );
                                            })
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
            </div>
        </Container>
    );
} 