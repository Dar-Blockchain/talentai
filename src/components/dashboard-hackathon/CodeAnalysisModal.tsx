import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Chip, Card, CardContent, Stack, Avatar, Divider } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';
import BarChartIcon from '@mui/icons-material/BarChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import DescriptionIcon from '@mui/icons-material/Description';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import VerifiedIcon from '@mui/icons-material/Verified'; // Use any relevant icon
import GroupsIcon from '@mui/icons-material/Groups'
import CommitIcon from '@mui/icons-material/Commit'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import EmailIcon from '@mui/icons-material/Email'

export const renderStringList = (arr: string[] | undefined) =>
  Array.isArray(arr) && arr.length > 0 ? (
    <Box component="ul" sx={{ pl: 3, mb: 1 }}>
      {arr.map((item, idx) => (
        <li key={idx}>
          <Typography variant="body2">{item}</Typography>
        </li>
      ))}
    </Box>
  ) : null;

const renderProjectPurpose = (purpose: any) => {
  if (!purpose) return null;
  return (
    <Box sx={{
      mb: 3,
      p: 3,
      bgcolor: '#F3F6FD',
      borderRadius: 3,
      boxShadow: '0 2px 8px #7C4DFF11',
      border: '1.5px solid #E3EAFD'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <WebAssetIcon sx={{ color: '#7C4DFF', mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#7C4DFF' }}>
          Project Purpose
        </Typography>
      </Box>
      {purpose.description && (
        <Box sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2.2,
          bgcolor: '#F7F8FA',
          borderLeft: '5px solid #7C4DFF',
          borderRadius: 2,
          boxShadow: '0 1px 4px #7C4DFF11',
        }}>
          <DescriptionIcon sx={{ color: '#7C4DFF', mt: 0.5, fontSize: 28 }} />
          <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.08rem', lineHeight: 1.7, color: '#2E3A59', wordBreak: 'break-word' }}>
            {purpose.description}
          </Typography>
        </Box>
      )}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7C4DFF', mb: 1 }}>
          Features
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Array.isArray(purpose.features) && purpose.features.length > 0 ? (
            purpose.features.map((feature: string, idx: number) => (
              <Chip key={idx} icon={<DoneAllIcon sx={{ color: '#7C4DFF' }} />} label={feature} sx={{ bgcolor: '#F3E5F5', color: '#7C4DFF', fontWeight: 700 }} />
            ))
          ) : (
            <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
          )}
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00B8D4', mb: 1 }}>
          Technologies
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Array.isArray(purpose.technologies) && purpose.technologies.length > 0 ? (
            purpose.technologies.map((tech: string, idx: number) => (
              <Chip key={idx} icon={<CodeIcon sx={{ color: '#00B8D4' }} />} label={tech} sx={{ bgcolor: '#E0F7FA', color: '#00B8D4', fontWeight: 700 }} />
            ))
          ) : (
            <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
          )}
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#4527A0', mb: 1 }}>
          Key Files
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Array.isArray(purpose.keyFiles) && purpose.keyFiles.length > 0 ? (
            purpose.keyFiles.map((file: string, idx: number) => (
              <Chip key={idx} icon={<DescriptionIcon sx={{ color: '#4527A0' }} />} label={file} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700 }} />
            ))
          ) : (
            <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
          )}
        </Box>
      </Box>
      <Box sx={{ mt: 2, p: 2, bgcolor: '#E8F5E9', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#388E3C', mb: 1 }}>
          Conclusion
        </Typography>
        <Typography variant="body2" sx={{ color: '#388E3C', fontWeight: 600 }}>
          {purpose.conclusion || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );
};

const renderArchitecture = (architecture: any) => {
  if (!architecture) return null;
  return (
    <Box sx={{ mb: 3, p: 3, bgcolor: '#F3F6FD', borderRadius: 3, boxShadow: '0 2px 8px #7C4DFF11', border: '1.5px solid #E3EAFD' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CategoryIcon sx={{ color: '#7C4DFF', mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#7C4DFF' }}>Architecture</Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Pattern: </Typography>
        <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{architecture.pattern || 'N/A'}</Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Quality: </Typography>
        <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{architecture.quality !== undefined ? architecture.quality : 'N/A'}</Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7C4DFF', mb: 1 }}>Layers</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Array.isArray(architecture.layers) && architecture.layers.length > 0 ? (
            architecture.layers.map((layer: string, idx: number) => (
              <Chip key={idx} label={layer} sx={{ bgcolor: '#E1F5FE', color: '#7C4DFF', fontWeight: 700 }} />
            ))
          ) : (
            <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
          )}
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00B8D4', mb: 1 }}>Patterns</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Array.isArray(architecture.patterns) && architecture.patterns.length > 0 ? (
            architecture.patterns.map((pattern: string, idx: number) => (
              <Chip key={idx} label={pattern} sx={{ bgcolor: '#E0F7FA', color: '#00B8D4', fontWeight: 700 }} />
            ))
          ) : (
            <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
          )}
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#388E3C', mb: 1 }}>Strengths</Typography>
        <Box component="ul" sx={{ pl: 3, mb: 1 }}>
          {Array.isArray(architecture.strengths) && architecture.strengths.length > 0 ? (
            architecture.strengths.map((s: string, idx: number) => (
              <li key={idx}><Typography variant="body2" sx={{ color: '#388E3C' }}>{s}</Typography></li>
            ))
          ) : (
            <li><Typography variant="body2">N/A</Typography></li>
          )}
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100', mb: 1 }}>Weaknesses</Typography>
        <Box component="ul" sx={{ pl: 3, mb: 1 }}>
          {Array.isArray(architecture.weaknesses) && architecture.weaknesses.length > 0 ? (
            architecture.weaknesses.map((w: string, idx: number) => (
              <li key={idx}><Typography variant="body2" sx={{ color: '#E65100' }}>{w}</Typography></li>
            ))
          ) : (
            <li><Typography variant="body2">N/A</Typography></li>
          )}
        </Box>
      </Box>
      {/* Structure */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#4527A0', mb: 1 }}>Structure</Typography>
        {architecture.structure && (
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', mt: 1 }}>Root Files:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {Array.isArray(architecture.structure.rootFiles) && architecture.structure.rootFiles.length > 0 ? (
                architecture.structure.rootFiles.map((file: string, idx: number) => (
                  <Chip key={idx} label={file} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700 }} />
                ))
              ) : (
                <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
              )}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', mt: 1 }}>Config Files:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {Array.isArray(architecture.structure.configFiles) && architecture.structure.configFiles.length > 0 ? (
                architecture.structure.configFiles.map((file: string, idx: number) => (
                  <Chip key={idx} label={file} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700 }} />
                ))
              ) : (
                <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
              )}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', mt: 1 }}>Documentation:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {Array.isArray(architecture.structure.documentation) && architecture.structure.documentation.length > 0 ? (
                architecture.structure.documentation.map((file: string, idx: number) => (
                  <Chip key={idx} label={file} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700 }} />
                ))
              ) : (
                <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
              )}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', mt: 1 }}>Testing:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {Array.isArray(architecture.structure.testing) && architecture.structure.testing.length > 0 ? (
                architecture.structure.testing.map((file: string, idx: number) => (
                  <Chip key={idx} label={file} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700 }} />
                ))
              ) : (
                <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
              )}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', mt: 1 }}>Deployment:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {Array.isArray(architecture.structure.deployment) && architecture.structure.deployment.length > 0 ? (
                architecture.structure.deployment.map((file: string, idx: number) => (
                  <Chip key={idx} label={file} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700 }} />
                ))
              ) : (
                <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
              )}
            </Box>
            {/* srcStructure */}
            {architecture.structure.srcStructure && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', mt: 1 }}>srcStructure:</Typography>
                {Object.entries(architecture.structure.srcStructure).map(([k, v]) => (
                  <Box key={k} sx={{ mb: 1, ml: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>{k}: </Typography>
                    {Array.isArray(v) && v.length > 0 ? (
                      v.map((item: string, idx: number) => (
                        <Chip key={idx} label={item} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700, ml: 1 }} />
                      ))
                    ) : (
                      <Chip label="None" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700, ml: 1 }} />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const renderCoherence = (coherence: any) => {
  if (!coherence) return null;
  return (
    <Box sx={{ mb: 3, p: 3, bgcolor: '#F3F6FD', borderRadius: 3, boxShadow: '0 2px 8px #7C4DFF11', border: '1.5px solid #E3EAFD' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <BarChartIcon sx={{ color: '#7C4DFF', mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#7C4DFF' }}>Coherence</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Consistency: </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{coherence.consistency !== undefined ? coherence.consistency : 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Naming: </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{coherence.naming !== undefined ? coherence.naming : 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Structure: </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{coherence.structure !== undefined ? coherence.structure : 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Patterns: </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{coherence.patterns !== undefined ? coherence.patterns : 'N/A'}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const renderQuality = (quality: any) => {
  if (!quality) return null;
  return (
    <Box sx={{ mb: 3, p: 3, bgcolor: '#F3F6FD', borderRadius: 3, boxShadow: '0 2px 8px #7C4DFF11', border: '1.5px solid #E3EAFD' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <StarIcon sx={{ color: '#7C4DFF', mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#7C4DFF' }}>Quality</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Overall: </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{quality.overall !== undefined ? quality.overall : 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Maintainability: </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{quality.maintainability !== undefined ? quality.maintainability : 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Readability: </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{quality.readability !== undefined ? quality.readability : 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Performance: </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{quality.performance !== undefined ? quality.performance : 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Security: </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{quality.security !== undefined ? quality.security : 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Testability: </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{quality.testability !== undefined ? quality.testability : 'N/A'}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const renderSecurity = (security: any) => {
  if (!security) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Security</Typography>
      {renderStringList(security.issues)}
      {renderStringList(security.recommendations)}
      {typeof security.score === 'number' && <Typography variant="body2"><strong>Score:</strong> {security.score}</Typography>}
    </Box>
  );
};

const renderTesting = (testing: any) => {
  if (!testing) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Testing</Typography>
      {renderStringList(testing.coverage)}
      {renderStringList(testing.issues)}
      {renderStringList(testing.recommendations)}
      {typeof testing.score === 'number' && <Typography variant="body2"><strong>Score:</strong> {testing.score}</Typography>}
    </Box>
  );
};

const renderDocumentation = (documentation: any) => {
  if (!documentation) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Documentation</Typography>
      {renderStringList(documentation.files)}
      {renderStringList(documentation.issues)}
      {renderStringList(documentation.recommendations)}
      {typeof documentation.score === 'number' && <Typography variant="body2"><strong>Score:</strong> {documentation.score}</Typography>}
    </Box>
  );
};

const renderMaintainability = (maintainability: any) => {
  if (!maintainability) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Maintainability</Typography>
      {renderStringList(maintainability.issues)}
      {renderStringList(maintainability.recommendations)}
      {typeof maintainability.score === 'number' && <Typography variant="body2"><strong>Score:</strong> {maintainability.score}</Typography>}
    </Box>
  );
};

const renderDependencies = (dependencies: any) => {
  if (!dependencies) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Dependencies</Typography>
      {renderStringList(dependencies.list)}
      {renderStringList(dependencies.issues)}
      {renderStringList(dependencies.recommendations)}
      {typeof dependencies.score === 'number' && <Typography variant="body2"><strong>Score:</strong> {dependencies.score}</Typography>}
    </Box>
  );
};

const renderPerformance = (performance: any) => {
  if (!performance) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Performance</Typography>
      {renderStringList(performance.issues)}
      {renderStringList(performance.recommendations)}
      {typeof performance.score === 'number' && <Typography variant="body2"><strong>Score:</strong> {performance.score}</Typography>}
    </Box>
  );
};

const renderGithubData = (data: any) => {
  if (!data) return null

  const { contributors, totalCommits, firstCommit, lastCommit, creationDate } = data

  return (
    <Card elevation={3} sx={{ bgcolor: '#F3F6FD', borderRadius: 3, border: '1.5px solid #E3EAFD', boxShadow: '0 2px 8px #7C4DFF11', p: 2, mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GroupsIcon sx={{ color: '#7C4DFF', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#7C4DFF' }}>Contributors</Typography>
        </Box>

        <Stack spacing={2}>
          {contributors.map((contributor: any, index: number) => (
            <Box key={index} sx={{ p: 2, borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #E3EAFD' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar>{contributor.login.charAt(0).toUpperCase()}</Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{contributor.login}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CommitIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">{contributor.contributions} contributions</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">{contributor.email}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CommitIcon fontSize="small" sx={{ color: 'primary.main' }} />
            <Typography variant="body2"><strong>Total Commits:</strong> {totalCommits}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon fontSize="small" sx={{ color: 'primary.main' }} />
            <Typography variant="body2"><strong>First Commit:</strong> {new Date(firstCommit).toLocaleString()}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon fontSize="small" sx={{ color: 'primary.main' }} />
            <Typography variant="body2"><strong>Last Commit:</strong> {new Date(lastCommit).toLocaleString()}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon fontSize="small" sx={{ color: 'primary.main' }} />
            <Typography variant="body2"><strong>Repo Created:</strong> {new Date(creationDate).toLocaleString()}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

const renderEligibility = (data: any) => {
  if (!data) return null;

  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        bgcolor: '#F3F6FD',
        borderRadius: 3,
        boxShadow: '0 2px 8px #7C4DFF11',
        border: '1.5px solid #E3EAFD',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <VerifiedIcon sx={{ color: '#7C4DFF', mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#7C4DFF' }}>
          Eligibility
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>
            Start Date:
          </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>
            {data.startDate || 'N/A'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>
            Deadline:
          </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>
            {data.deadline || 'N/A'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>
            Max Team Size:
          </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>
            {data.maxTeamSize || 'N/A'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>
            Must Be Original:
          </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>
            {data.mustBeOriginal || 'N/A'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>
            Demo Required:
          </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>
            {data.demoRequired || 'N/A'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>
            Eligible:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              display: 'inline',
              ml: 0.5,
              color: data.eligible ? 'success.main' : 'error.main',
              fontWeight: 700,
            }}
          >
            {data.eligible ? 'Yes' : 'No'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const renderOtherSections = (codeAnalysis: any) => {
  const knownKeys = [
    'summary', 'overallScore', 'metrics', 'issues', 'recommendations', 'createdAt',
    'projectPurpose', 'architecture', 'coherence', 'security', 'testing', 'documentation',
    'maintainability', 'dependencies', 'performance'
  ];
  return Object.entries(codeAnalysis)
    .filter(([key]) => !knownKeys.includes(key))
    .map(([key, value]) => (
      <Box key={key} sx={{ mb: 2, p: 2, bgcolor: '#F7F8FA', borderRadius: 2, border: '1.5px solid #E3EAFD' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#7C4DFF' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</Typography>
        {Array.isArray(value) ? (
          <Box component="ul" sx={{ pl: 3, mb: 1 }}>
            {value.map((item, idx) => (
              <li key={idx}>
                <Typography variant="body2">{typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}</Typography>
              </li>
            ))}
          </Box>
        ) : value && typeof value === 'object' ? (
          <Box component="ul" sx={{ pl: 3, mb: 1 }}>
            {Object.entries(value).map(([k, v]) => (
              <li key={k}>
                <Typography variant="body2"><strong>{k}:</strong> {typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</Typography>
              </li>
            ))}
          </Box>
        ) : (
          <Typography variant="body2">{String(value)}</Typography>
        )}
      </Box>
    ));
};

const renderCodeAnalysisModalContent = (analysis: any, eligibility: any, githubData: any) => {
  if (!analysis) {
    return <Typography>No code analysis available.</Typography>;
  }
  const hasAnySection = !!(
    analysis.summary ||
    analysis.metrics ||
    (Array.isArray(analysis.issues) && analysis.issues.length > 0) ||
    (Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0) ||
    analysis.projectPurpose ||
    analysis.architecture ||
    analysis.coherence ||
    analysis.quality ||
    analysis.security ||
    analysis.testing ||
    analysis.documentation ||
    analysis.maintainability ||
    analysis.dependencies ||
    analysis.performance
  );
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 900, color: '#7C4DFF', display: 'flex', alignItems: 'center', gap: 1 }}>
        <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Code Analysis Report
      </Typography>
      {analysis.summary && (
        <Box sx={{ mb: 3, p: 2.5, bgcolor: '#F3F6FD', borderRadius: 2, border: '1.5px solid #E3EAFD' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#7C4DFF', display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon sx={{ color: '#7C4DFF' }} /> Summary
          </Typography>
          <Typography>{analysis.summary}</Typography>
        </Box>
      )}
      {analysis.metrics && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#F7F8FA', borderRadius: 2, border: '1.5px solid #E3EAFD' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#4527A0', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChartIcon sx={{ color: '#4527A0' }} /> Metrics
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            {Object.entries(analysis.metrics).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{key}:</Typography>
                <Typography variant="body2">{typeof value === 'number' ? value.toFixed(2) : String(value)}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {Array.isArray(analysis.issues) && analysis.issues.length > 0 && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#FFF3E0', borderRadius: 2, border: '1.5px solid #FFB300' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#E65100', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon sx={{ color: '#E65100' }} /> Detected Issues
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            {analysis.issues.map((issue: any, idx: number) => (
              <li key={idx}>
                <Typography variant="body2" color="error">
                  {issue.description || issue}
                </Typography>
              </li>
            ))}
          </Box>
        </Box>
      )}
      {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#E3F2FD', borderRadius: 2, border: '1.5px solid #64B5F6' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#0277BD', display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon sx={{ color: '#0277BD' }} /> Recommendations
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            {analysis.recommendations.map((rec: any, idx: number) => (
              <li key={idx}>
                <Typography variant="body2" color="primary">
                  {rec}
                </Typography>
              </li>
            ))}
          </Box>
        </Box>
      )}
      {renderProjectPurpose(analysis.projectPurpose)}
      {renderArchitecture(analysis.architecture)}
      {renderCoherence(analysis.coherence)}
      {renderQuality(analysis.quality)}
      {renderSecurity(analysis.security)}
      {renderTesting(analysis.testing)}
      {renderDocumentation(analysis.documentation)}
      {renderMaintainability(analysis.maintainability)}
      {renderDependencies(analysis.dependencies)}
      {renderPerformance(analysis.performance)}
      {renderGithubData(githubData)}
      {renderEligibility(eligibility)}
      {/* {renderOtherSections(analysis)} */}
      {!hasAnySection && (
        <Typography sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 2 }}>
          No code analysis data available.
        </Typography>
      )}
      {analysis.createdAt && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2, display: 'block', textAlign: 'right' }}>
          Created: {new Date(analysis.createdAt).toLocaleString()}
        </Typography>
      )}
    </Box>
  );
};

interface CodeAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  analysis: any;
  eligibility: any
  githubData: any
}

const CodeAnalysisModal: React.FC<CodeAnalysisModalProps> = ({ open, onClose, analysis, eligibility, githubData }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Code Analysis Details</DialogTitle>
      <DialogContent dividers>
        {renderCodeAnalysisModalContent(analysis, eligibility, githubData)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CodeAnalysisModal; 