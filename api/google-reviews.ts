import type { VercelRequest, VercelResponse } from '@vercel/node';

const PLACE_ID = 'ChIJk_J9J7KFXjkRxyd9_kxmrz8';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  console.log('[google-reviews] env keys:', Object.keys(process.env).filter(k => k.includes('GOOGLE')));
  console.log('[google-reviews] apiKey present:', !!apiKey, 'length:', apiKey?.length ?? 0);
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_PLACES_API_KEY not configured' });
  }

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews,googleMapsUri',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[google-reviews] Places API error:', err);
      return res.status(502).json({ error: 'Failed to fetch reviews' });
    }

    const data = await response.json() as {
      rating: number;
      userRatingCount: number;
      googleMapsUri: string;
      reviews?: Array<{
        rating: number;
        text?: { text: string };
        relativePublishTimeDescription: string;
        googleMapsUri: string;
        authorAttribution: {
          displayName: string;
          uri: string;
          photoUri: string;
        };
      }>;
    };

    // Cache for 1 hour — reduces API calls, reviews don't change that often
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    return res.status(200).json({
      rating: data.rating,
      userRatingCount: data.userRatingCount,
      googleMapsUri: data.googleMapsUri,
      reviews: (data.reviews ?? []).map(r => ({
        rating: r.rating,
        text: r.text?.text ?? '',
        relativeTime: r.relativePublishTimeDescription,
        googleMapsUri: r.googleMapsUri,
        author: {
          name: r.authorAttribution.displayName,
          photoUri: r.authorAttribution.photoUri,
          uri: r.authorAttribution.uri,
        },
      })),
    });
  } catch (err: any) {
    console.error('[google-reviews] Unexpected error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
