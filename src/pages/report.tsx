// pages/report.tsx
import { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Button } from '@mui/material';
import { useRouter } from 'next/router';

type ReportItem = {
  question: string;
  responseUrl: string;
};

export default function Report() {
  const [report, setReport] = useState<ReportItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('test_report') || '[]');
    setReport(data);
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test Report
      </Typography>

      {report.map((item, idx) => (
        <Card key={idx} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {item.question}
            </Typography>
            {item.responseUrl ? (
              <video
                src={item.responseUrl}
                controls
                style={{ width: '100%', borderRadius: 8 }}
              />
            ) : (
              <Typography color="text.secondary">
                No response recorded.
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}

      <Button variant="contained" onClick={() => router.push('/')}>
        Back Home
      </Button>
    </Container>
  );
}
