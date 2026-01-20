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

const PRIMARY_COLOR = '#667eea';
const SECONDARY_COLOR = '#764ba2';

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
                                color: PRIMARY_COLOR,
                                textDecoration: 'underline',
                                '&:hover': {
                                    color: SECONDARY_COLOR,
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
                                color: PRIMARY_COLOR,
                                textDecoration: 'underline',
                                '&:hover': {
                                    color: SECONDARY_COLOR,
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
                                color: PRIMARY_COLOR,
                                textDecoration: 'underline',
                                '&:hover': {
                                    color: SECONDARY_COLOR,
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
                                color: PRIMARY_COLOR,
                                textDecoration: 'underline',
                                '&:hover': {
                                    color: SECONDARY_COLOR,
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
    borderRadius: '16px',
    border: '2px solid #f0f0f0',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
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
                const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}SkillInterviewAssessment/${id}`;
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
        <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4 }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 4,
                p: 3,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.04) 100%)',
                borderRadius: 4,
                border: '2px solid #f0f0f0'
            }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/dashboard/candidate')}
                    sx={{
                        color: PRIMARY_COLOR,
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                            background: 'rgba(102, 126, 234, 0.08)'
                        }
                    }}
                >
                    Back to Dashboard
                </Button>
                {/* Download PDF Button */}
                {(!loading && !error && data) && (
                    <Button
                        variant="contained"
                        sx={{
                            background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)`,
                            color: '#fff',
                            fontWeight: 700,
                            borderRadius: 3,
                            textTransform: 'none',
                            px: 3,
                            py: 1.5,
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            '&:hover': {
                                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => window.print()}
                    >
                        Download PDF
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
                    <Box sx={{
                        mb: 4,
                        pb: 3,
                        borderBottom: '2px solid #f0f0f0'
                    }}>
                        <Typography variant="h3" sx={{
                            fontWeight: 900,
                            background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                        }}>
                            Interview Report
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
                            Detailed analysis and assessment results
                        </Typography>
                    </Box>
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
                     
                            {/* Job Details Section */}
                            {data.post?.jobDetails && (
                                <Box sx={{ mb: 4, p: 3, background: '#ffffff', borderRadius: 4, border: '2px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <Typography variant="h6" sx={{ color: PRIMARY_COLOR, fontWeight: 800, mb: 2 }}>
                                        Job Details
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{data.post.jobDetails.title}</Typography>
                                    <LinkifiedText text={data.post.jobDetails.description} variant="body2" sx={{ mb: 1 }} />
                                 
                                    {/* <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Salary:</Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>{data.post.jobDetails.salary ? `${data.post.jobDetails.salary.min} - ${data.post.jobDetails.salary.max} ${data.post.jobDetails.salary.currency}` : '-'}</Typography>
                                   */}
                                </Box>
                            )}
                   
                            {/* Assessment Result Section for onboarding/skill tests */}
                            {(data.type === 'onboarding' || data.type === 'skill' || !data.type) && data.overallScore !== undefined && (
                                <Box sx={{ mb: 4, p: 3, background: '#ffffff', borderRadius: 4, border: '2px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <Typography variant="h6" sx={{ color: PRIMARY_COLOR, fontWeight: 800, mb: 2 }}>
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
                                                <Box key={idx} sx={{ mb: 3, p: 2, background: '#ffffff', borderRadius: 3, border: '2px solid #f0f0f0' }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: PRIMARY_COLOR }}>
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
                                <Box sx={{ mb: 4, p: 3, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.06) 0%, rgba(118, 75, 162, 0.06) 100%)', borderRadius: 4, border: '2px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <Typography variant="h6" sx={{ color: PRIMARY_COLOR, fontWeight: 800, mb: 2 }}>
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
                                                    background: PRIMARY_COLOR,
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

                      

                            {/* Technical Interview Assessment Section */}
                            {data.metadata && data.interviewData?.finalReport?.coverage && (
                                <Box sx={{ mb: 4, p: 3, background: '#ffffff', borderRadius: 4, border: '2px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <Typography variant="h6" sx={{ color: PRIMARY_COLOR, fontWeight: 800, mb: 2 }}>
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
                                                    background: PRIMARY_COLOR,
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
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY_COLOR, textTransform: 'capitalize' }}>
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
                                                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#1a1a1a' }}>Assessment Indicators:</Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                                                {(() => {
                                                                    // Remove duplicates based on indicator name
                                                                    const uniqueIndicators = areaData.indicators.reduce((acc: any[], indicator: any) => {
                                                                        const name = indicator.name || indicator;
                                                                        const exists = acc.find(i => (i.name || i) === name);
                                                                        if (!exists) {
                                                                            acc.push(indicator);
                                                                        }
                                                                        return acc;
                                                                    }, []);

                                                                    return uniqueIndicators.map((indicator: any, idx: number) => {
                                                                        const indicatorName = indicator.name || indicator;
                                                                        const formattedName = indicatorName
                                                                            .replace(/^AI-detected:\s*/i, '')
                                                                            .split('_')
                                                                            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                                                            .join(' ');

                                                                        return (
                                                                            <Chip
                                                                                key={idx}
                                                                                label={formattedName}
                                                                                size="medium"
                                                                                icon={indicator.covered ? <CheckCircleIcon /> : undefined}
                                                                                sx={{
                                                                                    fontSize: '0.875rem',
                                                                                    fontWeight: 600,
                                                                                    background: indicator.covered
                                                                                        ? 'linear-gradient(135deg, #4caf5015 0%, #43e97b15 100%)'
                                                                                        : '#f5f5f5',
                                                                                    color: indicator.covered ? '#4caf50' : '#6b7280',
                                                                                    border: indicator.covered
                                                                                        ? '2px solid #4caf50'
                                                                                        : '2px solid #e0e0e0',
                                                                                    px: 2,
                                                                                    py: 2.5,
                                                                                    '& .MuiChip-icon': {
                                                                                        color: '#4caf50',
                                                                                        fontSize: '1.1rem'
                                                                                    }
                                                                                }}
                                                                            />
                                                                        );
                                                                    });
                                                                })()}
                                                            </Box>
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
                                                            background: PRIMARY_COLOR,
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
                                </Box>
                            )}

                            {/* Assessment Result Section */}
                            {data.jobAssessmentResult?.analysis && (
                                <Box sx={{ mb: 4, p: 3, background: '#ffffff', borderRadius: 4, border: '2px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <Typography variant="h6" sx={{ color: PRIMARY_COLOR, fontWeight: 800, mb: 2 }}>
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