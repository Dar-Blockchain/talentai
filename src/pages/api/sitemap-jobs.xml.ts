import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch job posts from your API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}posts/getAllPosts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job posts');
    }

    const data = await response.json();
    const jobs = data.posts || [];

    // Generate XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${jobs.map((job: any) => `
  <url>
    <loc>https://app.talentai.bid/testjob/${job._id}</loc>
    <lastmod>${new Date(job.createdAt || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating job sitemap:', error);
    
    // Return empty sitemap on error
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    
    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(emptyXml);
  }
} 