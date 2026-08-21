import { NextResponse } from 'next/server';
import initialReviews from '@/app/data/reviews.json';

// In-memory rate limiter for reviews API (Max 3 reviews per 10 minutes per IP)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/reviews?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const dbReviews = await res.json();
        return NextResponse.json({
          success: true,
          reviews: Array.isArray(dbReviews) ? dbReviews : [],
        });
      } else {
        const errText = await res.text();
        console.error('[Reviews API GET] Supabase fetch error:', res.status, errText);
      }
    } catch (err) {
      console.error('[Reviews API GET] Error connecting to Supabase:', err);
    }
  }

  return NextResponse.json({
    success: true,
    reviews: [],
  });
}

export async function POST(req: Request) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many review submissions. Please wait 10 minutes before submitting another review.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, designation, country, rating, comment, website_hp, recaptchaToken } = body;

    // Honeypot check for bots
    if (website_hp && website_hp.trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Thank you for your review!',
      });
    }

    // Google reCAPTCHA v3 Server Verification (If secret key configured)
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      if (!recaptchaToken) {
        return NextResponse.json(
          { success: false, error: 'reCAPTCHA verification failed. Token missing.' },
          { status: 400 }
        );
      }

      const recaptchaRes = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`,
        { method: 'POST' }
      );
      const recaptchaData = await recaptchaRes.json();

      if (!recaptchaData.success || (recaptchaData.score !== undefined && recaptchaData.score < 0.5)) {
        return NextResponse.json(
          { success: false, error: 'reCAPTCHA verification failed. Automated request detected.' },
          { status: 400 }
        );
      }
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5 stars.' }, { status: 400 });
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return NextResponse.json({ success: false, error: 'Review comment is required.' }, { status: 400 });
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      name: name.trim(),
      designation: designation?.trim() || 'Software Engineer',
      country: country?.trim() || '🇺🇸 United States',
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      verified: true,
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let dbSaved = false;

    // 1. Insert review into Supabase Postgres Database
    if (supabaseUrl && supabaseKey) {
      try {
        const dbRes = await fetch(`${supabaseUrl}/rest/v1/reviews`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(newReview),
        });

        if (dbRes.ok) {
          dbSaved = true;
          console.log('[Reviews API POST] Review successfully saved to Supabase DB!');
        } else {
          const errText = await dbRes.text();
          console.error('[Reviews API POST] Supabase DB insert error:', dbRes.status, errText);
        }
      } catch (err) {
        console.error('[Reviews API POST] Error connecting to Supabase:', err);
      }
    }

    // 2. Dispatch 5-star alert to Discord Webhook
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      const starsEmoji = '⭐'.repeat(rating);
      try {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'C³ MindLoop Review Bot',
            avatar_url: 'https://www.c3mindloop.com/favicon.ico',
            embeds: [
              {
                title: `🌟 New ${rating}-Star User Review!`,
                description: `**"${comment.trim()}"**`,
                color: 0xf59e0b, // Amber / Gold rating color
                fields: [
                  { name: 'Rating', value: `${starsEmoji} (${rating}/5)`, inline: true },
                  { name: 'Reviewer Name', value: name.trim(), inline: true },
                  { name: 'Designation', value: designation?.trim() || 'Software Engineer', inline: true },
                  { name: 'Country', value: country?.trim() || '🌐 Global', inline: true },
                ],
                footer: {
                  text: `C³ MindLoop Database • IP: ${clientIp}`,
                },
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });
      } catch (err) {
        console.error('[Reviews API POST] Discord dispatch error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your review! It is now published live.',
      review: newReview,
      dbSaved,
    });
  } catch (error) {
    console.error('[Reviews API POST] Handler error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while submitting your review.' },
      { status: 500 }
    );
  }
}
