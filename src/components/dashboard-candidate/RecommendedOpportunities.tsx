import React from "react";
import { useRouter } from "next/router";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import Link from "next/link";

export type RecommendedOpportunity = {
  _id?: string;
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  createdAt?: string | number | Date;
  type?: string; // e.g., Full-time
  firstStepId?: string;
};

type RecommendedOpportunitiesProps = {
  data: RecommendedOpportunity[];
  total?: number;
  emptyText?: string;
};

export default function RecommendedOpportunities({ data, total, emptyText = "No recommendations available yet" }: RecommendedOpportunitiesProps) {
  const router = useRouter();

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {data.length === 0 ? (
          <Paper elevation={2} sx={{ p: 2, borderRadius: 3, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, background: '#fff' }}>
            <Typography variant="body1" sx={{ color: '#666', fontStyle: 'italic' }}>{emptyText}</Typography>
          </Paper>
        ) : (
          data.map((row) => {
            const id = row._id || row.id;
            return (
              <Box key={id} sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: 3, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fff' }}>
                  <Typography variant="h6" sx={{ color: '#8310FF', fontWeight: 700, mb: 1, minHeight: 48 }}>
                    {row.title || 'Untitled Post'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333', mb: 2, minHeight: 60 }}>
                    {row.description ? row.description.slice(0, 90) + (row.description.length > 90 ? '...' : '') : 'No description.'}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Link href={`/posts/${id}/interview${row.firstStepId ? `?stepId=${row.firstStepId}` : ''}`} passHref legacyBehavior>
                      <Button variant="contained" sx={{ background: '#8310FF', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, width: '100%' }}>
                        Learn More
                      </Button>
                    </Link>
                  </Box>
                </Paper>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}


