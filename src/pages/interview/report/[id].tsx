import { useRouter } from 'next/router';
import { useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Chip,
    Link,
    LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PageContainer from '@/components/layout/PageContainer';
import Header from '@/components/layout/Header';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
    fetchInterviewReport,
    selectInterviewReport,
    selectInterviewReportLoading,
    selectInterviewReportError,
    clearReport,
} from '@/store/slices/interviewSlice';

const PRIMARY_COLOR = 'rgba(163, 98, 239, 1)';
const SECONDARY_COLOR = 'rgba(11, 82, 198, 1)';
const SUCCESS_COLOR = 'rgba(62, 180, 137, 1)';
const WARNING_COLOR = 'rgba(250, 180, 70, 1)';

// Utility function to detect and convert URLs to clickable links
const LinkifiedText = ({ text, ...props }: { text: string } & any) => {
    if (!text) return null;

    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|co|ai|dev|tech|app)[^\s]*)/gi;
    const parts = text.split(urlRegex).filter(Boolean);

    return (
        <Typography {...props}>
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
                                color: SECONDARY_COLOR,
                                textDecoration: 'underline',
                                '&:hover': { color: PRIMARY_COLOR }
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
                                color: SECONDARY_COLOR,
                                textDecoration: 'underline',
                                '&:hover': { color: PRIMARY_COLOR }
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
                                color: SECONDARY_COLOR,
                                textDecoration: 'underline',
                                '&:hover': { color: PRIMARY_COLOR }
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
                                color: SECONDARY_COLOR,
                                textDecoration: 'underline',
                                '&:hover': { color: PRIMARY_COLOR }
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

// Card wrapper component matching dashboard style
const ReportCard = ({ children, title, titleColor = '#000000' }: { children: React.ReactNode; title?: string; titleColor?: string }) => (
    <Box
        sx={{
            background: '#ffffff',
            px: 5,
            py: 3,
            mb: 2,
            borderRadius: '12px',
            border: '1px solid rgba(84,98,116,0.1)',
        }}
    >
        {title && (
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 600,
                    color: titleColor,
                    fontSize: '20px',
                    mb: 3,
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-8px',
                        left: 0,
                        width: '38px',
                        height: '5px',
                        background: PRIMARY_COLOR,
                        borderRadius: '2px',
                    },
                }}
            >
                {title}
            </Typography>
        )}
        {children}
    </Box>
);

// Stats card matching dashboard design with icon support
const StatsCard = ({
    label,
    value,
    color = 'rgba(56, 68, 85, 1)',
    borderColor = 'rgba(157, 61, 255, 0.18)',
    bgColor = 'rgba(157, 61, 255, 0.06)',
    icon
}: {
    label: string;
    value: string | number;
    color?: string;
    borderColor?: string;
    bgColor?: string;
    icon?: React.ReactNode;
}) => (
    <Box
        sx={{
            padding: 2.5,
            borderRadius: '12px',
            background: '#ffffff',
            boxShadow: '0px 2px 12px 0px rgba(0, 0, 0, 0.04)',
            minWidth: '180px',
            flex: 1,
            border: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
                boxShadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-2px)',
            }
        }}
    >
        {icon && (
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '10px',
                    background: bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
        )}
        <Box>
            <Typography
                variant="body2"
                sx={{
                    color: 'rgba(100, 113, 131, 1)',
                    fontSize: '13px',
                    lineHeight: '16px',
                    fontWeight: 500,
                    mb: 0.5,
                }}
            >
                {label}
            </Typography>
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 700,
                    color: color,
                    fontSize: '20px',
                    lineHeight: '24px',
                }}
            >
                {value}
            </Typography>
        </Box>
    </Box>
);

function CandidateInterviewDetailPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { id } = router.query;

    const data = useSelector(selectInterviewReport);
    const loading = useSelector(selectInterviewReportLoading);
    const error = useSelector(selectInterviewReportError);

    useEffect(() => {
        if (!id) return;
        dispatch(fetchInterviewReport(id as string));

        return () => {
            dispatch(clearReport());
        };
    }, [id, dispatch]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return SUCCESS_COLOR;
        if (score >= 60) return SECONDARY_COLOR;
        if (score >= 40) return WARNING_COLOR;
        return 'rgba(251, 146, 60, 1)';
    };

    return (
        <PageContainer>
            <Header />

            {/* Print-only CSS */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #printable-content, #printable-content * { visibility: visible !important; }
                    #printable-content { position: absolute !important; left: 0; top: 0; width: 100vw; background: #fff !important; }
                    .MuiPaper-root, .MuiBox-root, .MuiTypography-root, .MuiChip-root {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* Header Card with Back Button */}
            <ReportCard>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => router.push('/dashboard/candidate')}
                            sx={{
                                color: PRIMARY_COLOR,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                mb: 2,
                                '&:hover': { background: 'rgba(163, 98, 239, 0.08)' }
                            }}
                        >
                            Back to Dashboard
                        </Button>
                        <Typography
                            variant="h4"
                            sx={{
                                color: '#000000',
                                fontSize: { xs: '1.5rem', md: '2rem' },
                                fontWeight: 600,
                                fontFamily: 'Poppins',
                            }}
                        >
                            Interview Report
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(100, 113, 131, 1)',
                                fontSize: '13px',
                                fontWeight: 400,
                            }}
                        >
                            Detailed analysis and assessment results
                        </Typography>
                    </Box>
                    {(!loading && !error && data) && (
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={() => window.print()}
                            sx={{
                                background: PRIMARY_COLOR,
                                color: '#ffffff',
                                fontWeight: 600,
                                borderRadius: '38px',
                                px: 3,
                                py: 1,
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                '&:hover': {
                                    background: 'rgba(163, 98, 239, 0.8)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(163, 98, 239, 0.3)',
                                },
                            }}
                        >
                            Download PDF
                        </Button>
                    )}
                </Box>
            </ReportCard>

            <div id="printable-content">
                {loading ? (
                    <ReportCard>
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress sx={{ color: PRIMARY_COLOR }} />
                        </Box>
                    </ReportCard>
                ) : error ? (
                    <ReportCard>
                        <Alert severity="error">{error}</Alert>
                    </ReportCard>
                ) : !data ? (
                    <ReportCard>
                        <Alert severity="info">No data found for this interview.</Alert>
                    </ReportCard>
                ) : (
                    <>
                        {/* Job Details Section */}
                        {data.post?.jobDetails && (
                            <ReportCard title="Job Details">
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#000000' }}>
                                    {data.post.jobDetails.title}
                                </Typography>
                                <LinkifiedText text={data.post.jobDetails.description} variant="body2" sx={{ color: 'rgba(100, 113, 131, 1)' }} />
                            </ReportCard>
                        )}

                        {/* Assessment Summary Section for onboarding/skill tests */}
                        {(data.type === 'onboarding' || data.type === 'skill' || !data.type) && data.overallScore !== undefined && (
                            <ReportCard title={data.type === 'skill' ? 'Skill Assessment Summary' : 'Assessment Summary'}>
                                <Box sx={{ display: 'flex', gap: 2.5, mb: 3, flexWrap: 'wrap' }}>
                                    <StatsCard
                                        label="Overall Score"
                                        value={`${data.overallScore}%`}
                                        color={getScoreColor(data.overallScore)}
                                        borderColor="rgba(62, 180, 137, 0.18)"
                                        bgColor="rgba(62, 180, 137, 0.08)"
                                        icon={<TrendingUpIcon sx={{ fontSize: 24, color: getScoreColor(data.overallScore) }} />}
                                    />
                                </Box>

                                {Array.isArray(data.skillDetails) && data.skillDetails.length > 0 && (
                                    <>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 3, mb: 2, color: '#000000' }}>
                                            Skills Assessed
                                        </Typography>
                                        {data.skillDetails.map((skill: any, idx: number) => (
                                            <Box key={idx} sx={{ mb: 3, p: 2, background: 'rgba(251, 254, 255, 1)', borderRadius: '8px', border: '1px solid rgba(84,98,116,0.1)' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: SECONDARY_COLOR }}>
                                                        {skill.name}
                                                    </Typography>
                                                    <Chip label={`${skill.confidenceScore}%`} size="small" sx={{ background: SUCCESS_COLOR, color: '#fff', fontWeight: 600 }} />
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                                    <Chip label={`Type: ${skill.type}`} size="small" variant="outlined" />
                                                    <Chip label={`Proficiency: ${skill.proficiencyLevel}`} size="small" variant="outlined" />
                                                </Box>

                                                {Array.isArray(skill.questionAnswerList) && skill.questionAnswerList.length > 0 && (
                                                    <Box sx={{ mt: 2 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'rgba(100, 113, 131, 1)' }}>
                                                            Question & Answer Details:
                                                        </Typography>
                                                        {skill.questionAnswerList.map((qa: any, qIdx: number) => {
                                                            const statusColor = qa.status === 'correct' ? SUCCESS_COLOR :
                                                                                 qa.status === 'partial_correct' ? WARNING_COLOR : '#d32f2f';
                                                            return (
                                                                <Box key={qIdx} sx={{ mb: 2, p: 2, background: '#fff', borderRadius: '8px', border: '1px solid rgba(84,98,116,0.1)' }}>
                                                                    <LinkifiedText
                                                                        text={`Q${qIdx + 1}: ${qa.question}`}
                                                                        variant="body2"
                                                                        sx={{ fontWeight: 600, mb: 1, color: '#000000' }}
                                                                    />
                                                                    <LinkifiedText
                                                                        text={`Your Answer: ${qa.answer}`}
                                                                        variant="body2"
                                                                        sx={{ color: 'rgba(100, 113, 131, 1)', mb: 1, fontStyle: 'italic' }}
                                                                    />
                                                                    <Chip
                                                                        label={qa.status.replace('_', ' ').toUpperCase()}
                                                                        size="small"
                                                                        sx={{ background: statusColor, color: '#fff', fontWeight: 600 }}
                                                                    />
                                                                    {qa.exampleCorrectAnswer && (
                                                                        <LinkifiedText
                                                                            text={`Example: ${qa.exampleCorrectAnswer}`}
                                                                            variant="caption"
                                                                            sx={{ display: 'block', mt: 1, color: SECONDARY_COLOR, fontStyle: 'italic' }}
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
                                )}
                            </ReportCard>
                        )}

                        {/* Learning Recommendations */}
                        {Array.isArray(data.recommendations) && data.recommendations.length > 0 && (
                            <ReportCard title="Learning Recommendations">
                                <Typography variant="body2" sx={{ mb: 3, color: 'rgba(100, 113, 131, 1)' }}>
                                    Based on your assessment, here are some resources to help you improve:
                                </Typography>
                                {data.recommendations.map((rec: string, idx: number) => (
                                    <Box key={idx} sx={{
                                        mb: 2,
                                        p: 2,
                                        background: 'rgba(251, 254, 255, 1)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(84,98,116,0.1)',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 2,
                                    }}>
                                        <Box sx={{
                                            minWidth: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            background: PRIMARY_COLOR,
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.875rem',
                                            fontWeight: 600
                                        }}>
                                            {idx + 1}
                                        </Box>
                                        <LinkifiedText text={rec} variant="body2" sx={{ flex: 1, lineHeight: 1.6, color: '#000000' }} />
                                    </Box>
                                ))}
                            </ReportCard>
                        )}

                        {/* Technical/Soft Skills Interview Assessment Section */}
                        {data.interviewData?.finalReport?.coverage && (
                            <ReportCard title={`${data.skillType === 'soft' ? 'Soft Skills' : 'Technical'} Interview Assessment`}>
                                {/* Interview Details */}
                                <Box sx={{ display: 'flex', gap: 2.5, mb: 4, flexWrap: 'wrap' }}>
                                    <StatsCard
                                        label="Skill Assessed"
                                        value={data.skill || 'N/A'}
                                        color={SECONDARY_COLOR}
                                        borderColor="rgba(11, 82, 198, 0.18)"
                                        bgColor="rgba(11, 82, 198, 0.08)"
                                        icon={data.skillType === 'soft'
                                            ? <PsychologyIcon sx={{ fontSize: 24, color: SECONDARY_COLOR }} />
                                            : <CodeIcon sx={{ fontSize: 24, color: SECONDARY_COLOR }} />
                                        }
                                    />
                                    <StatsCard
                                        label="Proficiency Level"
                                        value={data.proficiency || 'N/A'}
                                        color={WARNING_COLOR}
                                        borderColor="rgba(250, 180, 70, 0.18)"
                                        bgColor="rgba(250, 180, 70, 0.08)"
                                        icon={<WorkspacePremiumIcon sx={{ fontSize: 24, color: WARNING_COLOR }} />}
                                    />
                                    {data.interviewData.finalReport.coverage.overall !== undefined && (
                                        <StatsCard
                                            label="Overall Coverage"
                                            value={`${data.interviewData.finalReport.coverage.overall}%`}
                                            color={getScoreColor(data.interviewData.finalReport.coverage.overall)}
                                            borderColor="rgba(62, 180, 137, 0.18)"
                                            bgColor="rgba(62, 180, 137, 0.08)"
                                            icon={<AssessmentIcon sx={{ fontSize: 24, color: getScoreColor(data.interviewData.finalReport.coverage.overall) }} />}
                                        />
                                    )}
                                </Box>

                                {/* Coverage Areas */}
                                {data.interviewData.finalReport.coverage.areas && (
                                    <>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#000000', fontSize: '16px' }}>
                                            Coverage Areas
                                        </Typography>
                                        {Object.entries(data.interviewData.finalReport.coverage.areas).map(([areaName, areaData]: [string, any]) => (
                                            <Box key={areaName} sx={{ mb: 3, p: 3, background: 'rgba(251, 254, 255, 1)', borderRadius: '8px', border: '1px solid rgba(84,98,116,0.1)' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#000000', textTransform: 'capitalize' }}>
                                                        {areaName.replace(/_/g, ' ')}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Typography variant="body2" sx={{ color: getScoreColor(areaData.percentage), fontWeight: 600 }}>
                                                            {areaData.percentage}%
                                                        </Typography>
                                                        <Box sx={{ width: 100 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={areaData.percentage}
                                                                sx={{
                                                                    height: 7,
                                                                    borderRadius: 3,
                                                                    backgroundColor: 'rgba(243, 245, 247, 1)',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        borderRadius: 3,
                                                                        backgroundColor: getScoreColor(areaData.percentage),
                                                                    },
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                </Box>

                                                {/* AI Analysis */}


                                                {/* Indicators */}
                                                {areaData.indicators && areaData.indicators.length > 0 && (
                                                    <Box sx={{ mt: 2 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: 'rgba(100, 113, 131, 1)' }}>
                                                            Assessment Indicators:
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                            {(() => {
                                                                const uniqueIndicators = areaData.indicators.reduce((acc: any[], indicator: any) => {
                                                                    const name = indicator.name || indicator;
                                                                    const exists = acc.find(i => (i.name || i) === name);
                                                                    if (!exists) acc.push(indicator);
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
                                                                            size="small"
                                                                            icon={indicator.covered ? <CheckCircleIcon sx={{ fontSize: '16px !important' }} /> : undefined}
                                                                            sx={{
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: 500,
                                                                                background: indicator.covered ? 'rgba(62, 180, 137, 0.1)' : 'rgba(243, 245, 247, 1)',
                                                                                color: indicator.covered ? SUCCESS_COLOR : 'rgba(100, 113, 131, 1)',
                                                                                border: indicator.covered ? `1px solid ${SUCCESS_COLOR}` : '1px solid rgba(84,98,116,0.1)',
                                                                                '& .MuiChip-icon': { color: SUCCESS_COLOR }
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
                                    <Box sx={{ mt: 3, p: 3, background: 'rgba(251, 254, 255, 1)', borderRadius: '8px', border: '1px solid rgba(84,98,116,0.1)' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>Interview Analytics</Typography>
                                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                            {data.interviewData.analytics.duration !== undefined && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'rgba(100, 113, 131, 1)', display: 'block', mb: 0.5 }}>Duration</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>
                                                        {Math.floor(data.interviewData.analytics.duration / 1000 / 60)} min {Math.floor((data.interviewData.analytics.duration / 1000) % 60)} sec
                                                    </Typography>
                                                </Box>
                                            )}
                                            {data.interviewData.analytics.messageCount !== undefined && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'rgba(100, 113, 131, 1)', display: 'block', mb: 0.5 }}>Messages</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>{data.interviewData.analytics.messageCount}</Typography>
                                                </Box>
                                            )}
                                            {data.interviewData.analytics.coveragePercentage !== undefined && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'rgba(100, 113, 131, 1)', display: 'block', mb: 0.5 }}>Coverage</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>{data.interviewData.analytics.coveragePercentage}%</Typography>
                                                </Box>
                                            )}
                                            {data.interviewData.analytics.interactionStyle && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'rgba(100, 113, 131, 1)', display: 'block', mb: 0.5 }}>Style</Typography>
                                                    <Chip label={data.interviewData.analytics.interactionStyle} size="small" sx={{ textTransform: 'capitalize' }} />
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                )}

                                {/* Summary Section */}
                                {data.interviewData.finalReport?.summary && (
                                    <Box sx={{ mt: 3, p: 3, background: 'rgba(62, 180, 137, 0.08)', borderRadius: '8px', border: `1px solid ${SUCCESS_COLOR}` }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#000000' }}>Summary</Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(100, 113, 131, 1)' }}>{data.interviewData.finalReport.summary}</Typography>
                                    </Box>
                                )}

                                {/* Recommendations Section */}
                                {data.interviewData.finalReport?.recommendations && data.interviewData.finalReport.recommendations.length > 0 && (
                                    <Box sx={{ mt: 3, p: 3, background: 'rgba(250, 180, 70, 0.08)', borderRadius: '8px', border: `1px solid ${WARNING_COLOR}` }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>Recommendations</Typography>
                                        {data.interviewData.finalReport.recommendations.map((rec: string, idx: number) => (
                                            <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 1 }}>
                                                <Box sx={{
                                                    minWidth: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    background: WARNING_COLOR,
                                                    color: '#fff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    {idx + 1}
                                                </Box>
                                                <Typography variant="body2" sx={{ flex: 1, color: '#000000' }}>{rec}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </ReportCard>
                        )}

                        {/* Assessment Result Section */}
                        {data.jobAssessmentResult?.analysis && (
                            <ReportCard title="Assessment Analysis">
                                <Box sx={{ display: 'flex', gap: 2.5, mb: 3, flexWrap: 'wrap' }}>
                                    <StatsCard
                                        label="Overall Score"
                                        value={data.jobAssessmentResult.analysis.overallScore}
                                        color={SUCCESS_COLOR}
                                        borderColor="rgba(62, 180, 137, 0.18)"
                                        bgColor="rgba(62, 180, 137, 0.08)"
                                        icon={<TrendingUpIcon sx={{ fontSize: 24, color: SUCCESS_COLOR }} />}
                                    />
                                    {data.jobAssessmentResult.analysis.technicalLevel && (
                                        <StatsCard
                                            label="Technical Level"
                                            value={data.jobAssessmentResult.analysis.technicalLevel}
                                            color={SECONDARY_COLOR}
                                            borderColor="rgba(11, 82, 198, 0.18)"
                                            bgColor="rgba(11, 82, 198, 0.08)"
                                            icon={<CodeIcon sx={{ fontSize: 24, color: SECONDARY_COLOR }} />}
                                        />
                                    )}
                                    {data.jobAssessmentResult.analysis.jobMatch && (
                                        <StatsCard
                                            label="Job Match"
                                            value={`${data.jobAssessmentResult.analysis.jobMatch.percentage}%`}
                                            color={getScoreColor(data.jobAssessmentResult.analysis.jobMatch.percentage)}
                                            borderColor="rgba(157, 61, 255, 0.18)"
                                            bgColor="rgba(157, 61, 255, 0.08)"
                                            icon={<AssessmentIcon sx={{ fontSize: 24, color: getScoreColor(data.jobAssessmentResult.analysis.jobMatch.percentage) }} />}
                                        />
                                    )}
                                </Box>

                                {Array.isArray(data.jobAssessmentResult.analysis.skillAnalysis) && data.jobAssessmentResult.analysis.skillAnalysis.length > 0 && (
                                    <>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 3, mb: 2, color: '#000000' }}>Skill Analysis</Typography>
                                        {data.jobAssessmentResult.analysis.skillAnalysis.map((skill: any, idx: number) => (
                                            <Box key={idx} sx={{ mb: 2, p: 3, background: 'rgba(251, 254, 255, 1)', borderRadius: '8px', border: '1px solid rgba(84,98,116,0.1)' }}>
                                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: '#000000' }}>
                                                    {skill.skillName}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                    <Chip label={`Required: ${skill.requiredLevel}`} size="small" variant="outlined" />
                                                    <Chip label={`Demonstrated: ${skill.demonstratedExperienceLevel}`} size="small" variant="outlined" />
                                                </Box>
                                                {skill.strengths?.length > 0 && (
                                                    <Box sx={{ mb: 1 }}>
                                                        <Typography variant="body2" sx={{ color: SUCCESS_COLOR, fontWeight: 500, mb: 0.5 }}>Strengths:</Typography>
                                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                            {skill.strengths.map((str: string, i: number) => (
                                                                <LinkifiedListItem key={i} text={str} style={{ color: 'rgba(100, 113, 131, 1)' }} />
                                                            ))}
                                                        </ul>
                                                    </Box>
                                                )}
                                                {skill.weaknesses?.length > 0 && (
                                                    <Box>
                                                        <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 500, mb: 0.5 }}>Weaknesses:</Typography>
                                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                            {skill.weaknesses.map((w: string, i: number) => (
                                                                <LinkifiedListItem key={i} text={w} style={{ color: 'rgba(100, 113, 131, 1)' }} />
                                                            ))}
                                                        </ul>
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </>
                                )}

                                {Array.isArray(data.jobAssessmentResult.analysis.recommendations) && data.jobAssessmentResult.analysis.recommendations.length > 0 && (
                                    <Box sx={{ mt: 3, p: 3, background: 'rgba(11, 82, 198, 0.08)', borderRadius: '8px', border: `1px solid ${SECONDARY_COLOR}` }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>Recommendations</Typography>
                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                            {data.jobAssessmentResult.analysis.recommendations.map((rec: string, idx: number) => (
                                                <LinkifiedListItem key={idx} text={rec} style={{ color: 'rgba(100, 113, 131, 1)', marginBottom: 4 }} />
                                            ))}
                                        </ul>
                                    </Box>
                                )}

                                {Array.isArray(data.jobAssessmentResult.analysis.nextSteps) && data.jobAssessmentResult.analysis.nextSteps.length > 0 && (
                                    <Box sx={{ mt: 3, p: 3, background: 'rgba(62, 180, 137, 0.08)', borderRadius: '8px', border: `1px solid ${SUCCESS_COLOR}` }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>Next Steps</Typography>
                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                            {data.jobAssessmentResult.analysis.nextSteps.map((step: string, idx: number) => (
                                                <LinkifiedListItem key={idx} text={step} style={{ color: 'rgba(100, 113, 131, 1)', marginBottom: 4 }} />
                                            ))}
                                        </ul>
                                    </Box>
                                )}

                                {Array.isArray(data.jobAssessmentResult.analysis.jobMatch?.keyGaps) && data.jobAssessmentResult.analysis.jobMatch.keyGaps.length > 0 && (
                                    <Box sx={{ mt: 3, p: 3, background: 'rgba(211, 47, 47, 0.08)', borderRadius: '8px', border: '1px solid #d32f2f' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>Key Gaps</Typography>
                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                            {data.jobAssessmentResult.analysis.jobMatch.keyGaps.map((gap: string, idx: number) => (
                                                <LinkifiedListItem key={idx} text={gap} style={{ color: 'rgba(100, 113, 131, 1)', marginBottom: 4 }} />
                                            ))}
                                        </ul>
                                    </Box>
                                )}
                            </ReportCard>
                        )}
                    </>
                )}
            </div>
        </PageContainer>
    );
}

export default dynamic(() => Promise.resolve(CandidateInterviewDetailPage), {
    ssr: false
});
