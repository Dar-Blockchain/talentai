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
    Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const GREEN_MAIN = '#8310FF';

// Utility function to detect and convert URLs to clickable links
const LinkifiedText = ({ text, ...props }: { text: string } & any) => {
    if (!text) return null;
    
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|co|ai|dev|tech|app)[^\s]*)/gi;
    
    const parts = text.split(urlRegex).filter(Boolean);
    
    return (
        <Typography {...props}>
            {parts.map((part: string, index: number) => {
                if (!part) return null;
                
                // Check if this part is a URL
                if (part.match(/^https?:\/\//i)) {
                    return (
                        <Link
                            key={index}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                color: '#8310FF',
                                textDecoration: 'underline',
                                '&:hover': {
                                    color: '#6B0BC7',
                                    textDecoration: 'underline',
                                }
                            }}
                        >
                            {part}
                        </Link>
                    );
                } else if (part.match(/^www\./i) || part.match(/[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|co|ai|dev|tech|app)/i)) {
                    const href = part.startsWith('www.') ? `https://${part}` : `https://${part}`;
                    return (
                        <Link
                            key={index}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                color: '#8310FF',
                                textDecoration: 'underline',
                                '&:hover': {
                                    color: '#6B0BC7',
                                    textDecoration: 'underline',
                                }
                            }}
                        >
                            {part}
                        </Link>
                    );
                }
                
                return <span key={index}>{part}</span>;
            })}
        </Typography>
    );
};

// Component to render list items with clickable links
const LinkifiedListItem = ({ text, style }: { text: string; style?: React.CSSProperties }) => {
    if (!text) return null;
    
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|co|ai|dev|tech|app)[^\s]*)/gi;
    const parts = text.split(urlRegex).filter(Boolean);
    
    return (
        <li style={style}>
            {parts.map((part: string, index: number) => {
                if (!part) return null;
                
                if (part.match(/^https?:\/\//i)) {
                    return (
                        <Link
                            key={index}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                color: '#8310FF',
                                textDecoration: 'underline',
                                '&:hover': {
                                    color: '#6B0BC7',
                                    textDecoration: 'underline',
                                }
                            }}
                        >
                            {part}
                        </Link>
                    );
                } else if (part.match(/^www\./i) || part.match(/[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|co|ai|dev|tech|app)/i)) {
                    const href = part.startsWith('www.') ? `https://${part}` : `https://${part}`;
                    return (
                        <Link
                            key={index}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                color: '#8310FF',
                                textDecoration: 'underline',
                                '&:hover': {
                                    color: '#6B0BC7',
                                    textDecoration: 'underline',
                                }
                            }}
                        >
                            {part}
                        </Link>
                    );
                }
                
                return <span key={index}>{part}</span>;
            })}
        </li>
    );
};

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
                const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}InterviewAssessment/${id}`;
                const res = await fetch(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error('Failed to fetch interview details');
                const json = await res.json();
                console.log('📊 Interview Details API Response:', json);
                console.log('📋 Interview Data:', json.data);
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
                    onClick={() => router.push('/dashboard/candidate')}
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
                            {(() => { 
                                console.log('🎯 Rendering data:', {
                                    hasType: !!data.type,
                                    hasOverallScore: data.overallScore !== undefined,
                                    hasSkillDetails: !!data.skillDetails,
                                    skillDetailsLength: data.skillDetails?.length,
                                    hasPost: !!data.post,
                                    hasRecommendations: !!data.recommendations
                                }); 
                                return null; 
                            })()}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ color: '#191919', fontWeight: 600 }}>
                                    Type: <Chip label={data.type || 'onboarding'} color="primary" size="small" />
                                </Typography>
                                <Typography variant="subtitle1" sx={{ color: '#191919', fontWeight: 600 }}>
                                    Overall Score: <Chip label={data.overallScore !== undefined ? `${data.overallScore}%` : '-'} color="success" size="small" />
                                </Typography>
                                {data.post?.jobDetails?.title && (
                                    <Typography variant="subtitle1" sx={{ color: '#191919', fontWeight: 600 }}>
                                        Post Name: {data.post.jobDetails.title}
                                    </Typography>
                                )}
                                <Typography variant="subtitle1" sx={{ color: '#191919', fontWeight: 600 }}>
                                    Date: {data.createdAt ? new Date(data.createdAt).toLocaleString() : data.updatedAt ? new Date(data.updatedAt).toLocaleString() : '-'}
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
                                    <LinkifiedText text={data.post.jobDetails.description} variant="body2" sx={{ mb: 1 }} />
                                 
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
                            {/* Assessment Result Section for onboarding/skill tests */}
                            {(data.type === 'onboarding' || data.type === 'skill' || !data.type) && data.overallScore !== undefined && (
                                <Box sx={{ mb: 4, p: 3, background: '#e6f7fa', borderRadius: 3, border: '1px solid #b2ebf2' }}>
                                    <Typography variant="h6" sx={{ color: GREEN_MAIN, fontWeight: 700, mb: 2 }}>
                                        {data.type === 'skill' ? 'Skill Assessment Summary' : 'Assessment Summary'}
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
                                        Overall Score: <Chip label={`${data.overallScore}%`} color="success" size="small" />
                                    </Typography>
                                    {(() => { console.log('🎓 Skill Details:', data.skillDetails); return null; })()}
                                    {Array.isArray(data.skillDetails) && data.skillDetails.length > 0 ? (
                                        <>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Skills Assessed:</Typography>
                                            {data.skillDetails.map((skill: any, idx: number) => (
                                                <Box key={idx} sx={{ mb: 3, p: 2, background: '#fff', borderRadius: 2, border: '1px solid #ddd' }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: GREEN_MAIN }}>
                                                        {skill.name}
                                                    </Typography>
                                                    <Chip label={`Type: ${skill.type}`} size="small" sx={{ mr: 1, mb: 1 }} />
                                                    <Chip label={`Proficiency: ${skill.proficiencyLevel}`} size="small" sx={{ mr: 1, mb: 1 }} />
                                                    <Chip label={`Confidence: ${skill.confidenceScore}%`} color="success" size="small" sx={{ mb: 2 }} />
                                                    
                                                    {Array.isArray(skill.questionAnswerList) && skill.questionAnswerList.length > 0 && (
                                                        <Box sx={{ mt: 2 }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Question & Answer Details:</Typography>
                                                            {skill.questionAnswerList.map((qa: any, qIdx: number) => {
                                                                const statusColor = qa.status === 'correct' ? '#388e3c' : 
                                                                                     qa.status === 'partial_correct' ? '#ffa000' : '#d32f2f';
                                                                const statusIcon = qa.status === 'correct' ? '✓' : qa.status === 'partial_correct' ? '~' : '✗';
                                                                
                                                                return (
                                                                    <Box key={qIdx} sx={{ mb: 2, p: 2, background: '#f9f9f9', borderRadius: 2 }}>
                                                                        <LinkifiedText 
                                                                            text={`Q${qIdx + 1}: ${qa.question}`}
                                                                            variant="body2" 
                                                                            sx={{ fontWeight: 600, mb: 1 }} 
                                                                        />
                                                                        <LinkifiedText 
                                                                            text={`Your Answer: ${qa.answer}`}
                                                                            variant="body2" 
                                                                            sx={{ color: 'text.secondary', mb: 1, fontStyle: 'italic' }} 
                                                                        />
                                                                        <Chip 
                                                                            label={`${statusIcon} ${qa.status.replace('_', ' ').toUpperCase()}`}
                                                                            size="small"
                                                                            sx={{ background: statusColor, color: '#fff', fontWeight: 600, mb: 1 }}
                                                                        />
                                                                        {qa.partialCorrectPercentage && (
                                                                            <Chip 
                                                                                label={`${qa.partialCorrectPercentage}% Correct`}
                                                                                size="small"
                                                                                sx={{ ml: 1, background: '#ffa000', color: '#fff' }}
                                                                            />
                                                                        )}
                                                                        {qa.partialCorrectReason && (
                                                                           <LinkifiedText 
                                                                                text={qa.partialCorrectReason}
                                                                                variant="caption" 
                                                                                sx={{ display: 'block', mt: 1, color: '#666', fontStyle: 'italic' }} 
                                                                            />
                                                                        )}
                                                                        {qa.exampleCorrectAnswer && (
                                                                            <LinkifiedText 
                                                                                text={`Example: ${qa.exampleCorrectAnswer}`}
                                                                                variant="caption" 
                                                                                sx={{ display: 'block', mt: 1, color: '#1976d2', fontStyle: 'italic' }} 
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                );
                                                            })}
                                                        </Box>
                                                    )}
                                                </Box>
                                            ))}
                                        </>
                                    ) : (
                                        <Alert severity="info" sx={{ mt: 2 }}>
                                            No skill details available for this interview.
                                        </Alert>
                                    )}
                                </Box>
                            )}
                            
                            {/* Recommendations Section */}
                            {Array.isArray(data.recommendations) && data.recommendations.length > 0 && (
                                <Box sx={{ mb: 4, p: 3, background: '#f3f0ff', borderRadius: 3, border: '1px solid #d1c4e9' }}>
                                    <Typography variant="h6" sx={{ color: GREEN_MAIN, fontWeight: 700, mb: 2 }}>
                                        📚 Learning Recommendations
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                                        Based on your assessment, here are some resources to help you improve:
                                    </Typography>
                                    {data.recommendations.map((rec: string, idx: number) => (
                                        <Box key={idx} sx={{ 
                                            mb: 2, 
                                            p: 2, 
                                            background: '#fff', 
                                            borderRadius: 2, 
                                            border: '1px solid #e0e0e0',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(131, 16, 255, 0.1)',
                                                transform: 'translateY(-2px)',
                                                transition: 'all 0.3s ease'
                                            }
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                <Box sx={{
                                                    minWidth: 24,
                                                    height: 24,
                                                    borderRadius: '50%',
                                                    background: GREEN_MAIN,
                                                    color: '#fff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 700
                                                }}>
                                                    {idx + 1}
                                                </Box>
                                                <LinkifiedText 
                                                    text={rec}
                                                    variant="body2" 
                                                    sx={{ flex: 1, lineHeight: 1.6 }} 
                                                />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Candidate Information Section */}
                            {data.candidateId && (
                                <Box sx={{ mb: 4, p: 3, background: '#fef3ff', borderRadius: 3, border: '1px solid #d8b4fe' }}>
                                    <Typography variant="h6" sx={{ color: GREEN_MAIN, fontWeight: 700, mb: 2 }}>
                                        👤 Candidate Information
                                    </Typography>

                                    {/* Basic Info */}
                                    <Box sx={{ mb: 3, p: 2, background: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Personal Details:</Typography>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Name:</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {data.candidateId.firstName} {data.candidateId.lastName}
                                                </Typography>
                                            </Box>
                                            {data.candidateId.age && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Age:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.candidateId.age}</Typography>
                                                </Box>
                                            )}
                                            {data.candidateId.gender && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Gender:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.candidateId.gender}</Typography>
                                                </Box>
                                            )}
                                            {data.candidateId.educationLevel && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Education:</Typography>
                                                    <Chip label={data.candidateId.educationLevel} size="small" color="primary" />
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Work Preferences */}
                                    {(data.candidateId.preferredContractType || data.candidateId.workModePreference || data.candidateId.expectedSalary) && (
                                        <Box sx={{ mb: 3, p: 2, background: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Work Preferences:</Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                                                {data.candidateId.preferredContractType && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Contract Type:</Typography>
                                                        <Chip label={data.candidateId.preferredContractType} size="small" color="info" />
                                                    </Box>
                                                )}
                                                {data.candidateId.workModePreference && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Work Mode:</Typography>
                                                        <Chip label={data.candidateId.workModePreference} size="small" color="info" />
                                                    </Box>
                                                )}
                                                {data.candidateId.expectedSalary && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Expected Salary:</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {data.candidateId.expectedSalary.min} - {data.candidateId.expectedSalary.max} {data.candidateId.expectedSalary.currency}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Skills */}
                                    {data.candidateId.skills && data.candidateId.skills.length > 0 && (
                                        <Box sx={{ mb: 3, p: 2, background: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Technical Skills:</Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {data.candidateId.skills.map((skill: any, idx: number) => (
                                                    <Chip
                                                        key={idx}
                                                        label={`${skill.name} (L${skill.proficiencyLevel})`}
                                                        size="small"
                                                        color={skill.ScoreTest >= 70 ? 'success' : skill.ScoreTest >= 50 ? 'warning' : 'default'}
                                                        sx={{ fontSize: '0.75rem' }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Soft Skills */}
                                    {data.candidateId.softSkills && data.candidateId.softSkills.length > 0 && (
                                        <Box sx={{ p: 2, background: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Soft Skills:</Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {data.candidateId.softSkills.map((skill: any, idx: number) => (
                                                    <Chip
                                                        key={idx}
                                                        label={`${skill.name} - ${skill.category} (Score: ${skill.ScoreTest})`}
                                                        size="small"
                                                        color="secondary"
                                                        sx={{ fontSize: '0.75rem' }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Technical Interview Assessment Section */}
                            {data.metadata && data.interviewData?.finalReport?.coverage && (
                                <Box sx={{ mb: 4, p: 3, background: '#f0f9ff', borderRadius: 3, border: '1px solid #bae6fd' }}>
                                    <Typography variant="h6" sx={{ color: GREEN_MAIN, fontWeight: 700, mb: 2 }}>
                                        🎯 Technical Interview Assessment
                                    </Typography>

                                    {/* Metadata Section */}
                                    <Box sx={{ mb: 3, p: 2, background: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Interview Metadata:</Typography>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Skill:</Typography>
                                                <Chip label={data.metadata.skill || 'N/A'} color="primary" size="small" />
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Type:</Typography>
                                                <Chip label={data.metadata.type || 'N/A'} size="small" />
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Proficiency:</Typography>
                                                <Chip label={data.metadata.proficiency || 'N/A'} color="info" size="small" />
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Exported:</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {data.metadata.exportedAt ? new Date(data.metadata.exportedAt).toLocaleString() : 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Overall Coverage */}
                                    {data.interviewData.finalReport.coverage.overall !== undefined && (
                                        <Box sx={{ mb: 3, p: 2, background: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Overall Coverage:</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: '50%',
                                                    background: GREEN_MAIN,
                                                    color: '#fff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700,
                                                    fontSize: '1.25rem'
                                                }}>
                                                    {data.interviewData.finalReport.coverage.overall}%
                                                </Box>
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    Overall assessment coverage score
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Coverage Areas */}
                                    {data.interviewData.finalReport.coverage.areas && (
                                        <>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>Coverage Areas:</Typography>
                                            {Object.entries(data.interviewData.finalReport.coverage.areas).map(([areaName, areaData]: [string, any]) => (
                                                <Box key={areaName} sx={{ mb: 3, p: 2, background: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: GREEN_MAIN, textTransform: 'capitalize' }}>
                                                            {areaName.replace(/_/g, ' ')}
                                                        </Typography>
                                                        <Chip
                                                            label={`${areaData.percentage}% Coverage`}
                                                            color={areaData.percentage >= 70 ? 'success' : areaData.percentage >= 50 ? 'warning' : 'error'}
                                                            size="small"
                                                        />
                                                    </Box>

                                                    {/* AI Analysis */}
                                                    {areaData.aiAnalysis && (
                                                        <Box sx={{ mb: 2, p: 2, background: '#f9fafb', borderRadius: 1 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>AI Analysis:</Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                                <Typography variant="body2" sx={{ color: '#666' }}>Quality Score:</Typography>
                                                                <Chip
                                                                    label={`${areaData.aiAnalysis.qualityScore}/10`}
                                                                    color={areaData.aiAnalysis.qualityScore >= 7 ? 'success' : areaData.aiAnalysis.qualityScore >= 4 ? 'warning' : 'error'}
                                                                    size="small"
                                                                />
                                                            </Box>
                                                            {areaData.aiAnalysis.reasoning && (
                                                                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', mt: 1 }}>
                                                                    {areaData.aiAnalysis.reasoning}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    )}

                                                    {/* Indicators */}
                                                    {areaData.indicators && areaData.indicators.length > 0 && (
                                                        <Box sx={{ mt: 2 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Indicators:</Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                {areaData.indicators.map((indicator: any, idx: number) => (
                                                                    <Chip
                                                                        key={idx}
                                                                        label={indicator.name || indicator}
                                                                        size="small"
                                                                        variant={indicator.covered ? 'filled' : 'outlined'}
                                                                        color={indicator.covered ? 'success' : 'default'}
                                                                        sx={{ fontSize: '0.75rem' }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666' }}>
                                                                {areaData.indicators.filter((i: any) => i.covered).length} of {areaData.indicators.length} indicators covered
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            ))}
                                        </>
                                    )}

                                    {/* Analytics Section */}
                                    {data.interviewData.analytics && (
                                        <Box sx={{ mt: 3, p: 2, background: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Interview Analytics:</Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
                                                {data.interviewData.analytics.duration !== undefined && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Duration</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {Math.floor(data.interviewData.analytics.duration / 1000 / 60)} min {Math.floor((data.interviewData.analytics.duration / 1000) % 60)} sec
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {data.interviewData.analytics.messageCount !== undefined && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Messages</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.interviewData.analytics.messageCount}</Typography>
                                                    </Box>
                                                )}
                                                {data.interviewData.analytics.coveragePercentage !== undefined && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Coverage</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.interviewData.analytics.coveragePercentage}%</Typography>
                                                    </Box>
                                                )}
                                                {data.interviewData.analytics.completedAreas !== undefined && data.interviewData.analytics.totalAreas !== undefined && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Completed Areas</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {data.interviewData.analytics.completedAreas} / {data.interviewData.analytics.totalAreas}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {data.interviewData.analytics.interactionStyle && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Style</Typography>
                                                        <Chip label={data.interviewData.analytics.interactionStyle} size="small" sx={{ textTransform: 'capitalize' }} />
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Summary Section */}
                                    {data.interviewData.finalReport?.summary && (
                                        <Box sx={{ mt: 3, p: 2, background: '#f0fdf4', borderRadius: 2, border: '1px solid #86efac' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Summary:</Typography>
                                            <Typography variant="body2" sx={{ color: '#666' }}>{data.interviewData.finalReport.summary}</Typography>
                                        </Box>
                                    )}

                                    {/* AI Analysis Section */}
                                    {data.interviewData.finalReport?.aiAnalysis && (
                                        <Box sx={{ mt: 3, p: 2, background: '#fef3c7', borderRadius: 2, border: '1px solid #fde047' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>AI Analysis:</Typography>

                                            {data.interviewData.finalReport.aiAnalysis.strongestAreas && data.interviewData.finalReport.aiAnalysis.strongestAreas.length > 0 ? (
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 1 }}>Strongest Areas:</Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {data.interviewData.finalReport.aiAnalysis.strongestAreas.map((area: string, idx: number) => (
                                                            <Chip key={idx} label={area} size="small" color="success" />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            ) : null}

                                            {data.interviewData.finalReport.aiAnalysis.weakestAreas && data.interviewData.finalReport.aiAnalysis.weakestAreas.length > 0 ? (
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 1 }}>Weakest Areas:</Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {data.interviewData.finalReport.aiAnalysis.weakestAreas.map((area: string, idx: number) => (
                                                            <Chip key={idx} label={area} size="small" color="error" />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            ) : null}

                                            {data.interviewData.finalReport.aiAnalysis.recommendedFocus && data.interviewData.finalReport.aiAnalysis.recommendedFocus.length > 0 ? (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 1 }}>Recommended Focus:</Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {data.interviewData.finalReport.aiAnalysis.recommendedFocus.map((focus: string, idx: number) => (
                                                            <Chip key={idx} label={focus} size="small" color="warning" />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            ) : null}

                                            {(!data.interviewData.finalReport.aiAnalysis.strongestAreas || data.interviewData.finalReport.aiAnalysis.strongestAreas.length === 0) &&
                                             (!data.interviewData.finalReport.aiAnalysis.weakestAreas || data.interviewData.finalReport.aiAnalysis.weakestAreas.length === 0) &&
                                             (!data.interviewData.finalReport.aiAnalysis.recommendedFocus || data.interviewData.finalReport.aiAnalysis.recommendedFocus.length === 0) && (
                                                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                                                    No detailed analysis available yet. The interview may still be in progress or incomplete.
                                                </Typography>
                                            )}
                                        </Box>
                                    )}

                                    {/* Recommendations Section */}
                                    {data.interviewData.finalReport?.recommendations && data.interviewData.finalReport.recommendations.length > 0 && (
                                        <Box sx={{ mt: 3, p: 2, background: '#fce7f3', borderRadius: 2, border: '1px solid #f9a8d4' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Recommendations:</Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {data.interviewData.finalReport.recommendations.map((rec: string, idx: number) => (
                                                    <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                                        <Box sx={{
                                                            minWidth: 20,
                                                            height: 20,
                                                            borderRadius: '50%',
                                                            background: GREEN_MAIN,
                                                            color: '#fff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700
                                                        }}>
                                                            {idx + 1}
                                                        </Box>
                                                        <Typography variant="body2" sx={{ flex: 1 }}>{rec}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Session Information */}
                                    {(data.interviewData.sessionId || data.interviewData.interviewType) && (
                                        <Box sx={{ mt: 3, p: 2, background: '#f3f4f6', borderRadius: 2, border: '1px solid #d1d5db' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Session Information:</Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {data.interviewData.sessionId && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#666' }}>Session ID: </Typography>
                                                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{data.interviewData.sessionId}</Typography>
                                                    </Box>
                                                )}
                                                {data.interviewData.interviewType && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#666' }}>Type: </Typography>
                                                        <Chip label={data.interviewData.interviewType} size="small" sx={{ ml: 0.5 }} />
                                                    </Box>
                                                )}
                                                {data.status && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#666' }}>Status: </Typography>
                                                        <Chip
                                                            label={data.status}
                                                            size="small"
                                                            color={data.status === 'completed' ? 'success' : 'default'}
                                                            sx={{ ml: 0.5, textTransform: 'capitalize' }}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}

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
                                                            <LinkifiedListItem key={i} text={str} style={{ color: '#388e3c' }} />
                                                        ))}
                                                    </ul>
                                                    <Typography variant="body2" sx={{ color: 'red', mb: 0.5 }}>Weaknesses:</Typography>
                                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                        {skill.weaknesses?.map((w: string, i: number) => (
                                                            <LinkifiedListItem key={i} text={w} style={{ color: '#d32f2f' }} />
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
                                                    <LinkifiedListItem key={idx} text={rec} style={{ color: '#1976d2' }} />
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                    {Array.isArray(data.jobAssessmentResult.analysis.nextSteps) && data.jobAssessmentResult.analysis.nextSteps.length > 0 && (
                                        <>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Next Steps:</Typography>
                                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                {data.jobAssessmentResult.analysis.nextSteps.map((step: string, idx: number) => (
                                                    <LinkifiedListItem key={idx} text={step} style={{ color: '#388e3c' }} />
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                    {Array.isArray(data.jobAssessmentResult.analysis.jobMatch?.keyGaps) && data.jobAssessmentResult.analysis.jobMatch.keyGaps.length > 0 && (
                                        <>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Key Gaps:</Typography>
                                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                {data.jobAssessmentResult.analysis.jobMatch.keyGaps.map((gap: string, idx: number) => (
                                                    <LinkifiedListItem key={idx} text={gap} style={{ color: '#d32f2f' }} />
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </Box>
                            )}
                        
                        </>
                    )}
                </StyledPaper>
            </div>
        </Container>
    );
} 