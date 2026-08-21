import { NextResponse } from 'next/server';

// Simple in-memory rate limiter for serverless environment
// Maps IP address -> array of timestamps
const rateLimitMap = new Map<string, number[]>();

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 requests per 10 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Filter out timestamps outside the time window
  const validTimestamps = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

export async function POST(req: Request) {
  try {
    // 1. IP Rate Limiting Check
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many submissions from your IP address. Please wait 10 minutes before trying again.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, subject, message, website_hp, recaptchaToken } = body;

    // 2. Honeypot Check (Bots fill out hidden fields, humans do not)
    if (website_hp && website_hp.trim().length > 0) {
      console.warn(`[Contact API] Honeypot triggered by IP ${clientIp}. Dropping spam request.`);
      return NextResponse.json({
        success: true,
        message: 'Your message has been sent successfully.',
      });
    }

    // 3. Server-side validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ success: false, error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message content is required.' }, { status: 400 });
    }

    // 4. Google reCAPTCHA v3 Verification (if RECAPTCHA_SECRET_KEY is configured)
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      if (!recaptchaToken) {
        return NextResponse.json(
          { success: false, error: 'reCAPTCHA verification token missing.' },
          { status: 400 }
        );
      }

      try {
        const recaptchaRes = await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`,
          { method: 'POST' }
        );
        const recaptchaData = await recaptchaRes.json();

        if (!recaptchaData.success || (recaptchaData.score !== undefined && recaptchaData.score < 0.5)) {
          console.warn(`[Contact API] reCAPTCHA verification failed for IP ${clientIp}`);
          return NextResponse.json(
            { success: false, error: 'Spam/bot behavior detected by Google reCAPTCHA. Request rejected.' },
            { status: 403 }
          );
        }
      } catch (err) {
        console.error('[Contact API] Error verifying reCAPTCHA token:', err);
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const web3formsKey = process.env.WEB3FORMS_ACCESS_KEY;
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    let dispatched = false;

    // 5. Dual-Save to Supabase Database (`contact_messages` table)
    if (supabaseUrl && supabaseKey) {
      try {
        const dbRes = await fetch(`${supabaseUrl}/rest/v1/contact_messages`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            id: `msg-${Date.now()}`,
            name: name.trim(),
            email: email.trim(),
            subject: subject?.trim() || 'General Inquiry',
            message: message.trim(),
          }),
        });

        if (dbRes.ok) {
          dispatched = true;
          console.log('[Contact API] Message successfully saved to Supabase DB!');
        } else {
          const errText = await dbRes.text();
          console.error('[Contact API] Supabase DB insert error:', dbRes.status, errText);
        }
      } catch (err) {
        console.error('[Contact API] Error saving to Supabase DB:', err);
      }
    }

    // 6. Dispatch via Discord Webhook
    if (discordWebhookUrl) {
      try {
        const discordRes = await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'C³ MindLoop Contact Bot',
            avatar_url: 'https://www.c3mindloop.com/favicon.ico',
            embeds: [
              {
                title: `💬 New Contact Inquiry`,
                description: `**Subject:** ${subject?.trim() || 'General Inquiry'}`,
                color: 0x1d9bf0, // C3 MindLoop Brand Blue
                fields: [
                  { name: '👤 Name', value: name.trim(), inline: true },
                  { name: '✉️ Email', value: `[${email.trim()}](mailto:${email.trim()})`, inline: true },
                  { name: '📝 Message', value: message.trim() },
                ],
                footer: {
                  text: `C³ MindLoop Database & Discord • Client IP: ${clientIp}`,
                },
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });

        if (discordRes.ok) dispatched = true;
      } catch (err) {
        console.error('[Contact API] Discord Webhook dispatch error:', err);
      }
    }

    // 7. Dispatch via Web3Forms (Optional fallback if configured)
    if (web3formsKey) {
      try {
        const w3Res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: web3formsKey,
            name: name.trim(),
            email: email.trim(),
            subject: subject?.trim() || 'Contact Form Submission | C³ MindLoop',
            message: message.trim(),
            from_name: 'C³ MindLoop Contact Form',
          }),
        });

        if (w3Res.ok) dispatched = true;
      } catch (err) {
        console.error('[Contact API] Web3Forms dispatch error:', err);
      }
    }

    // Fallback for local development
    if (!supabaseUrl && !discordWebhookUrl && !web3formsKey) {
      console.warn('[Contact API] Neither Supabase, Discord, nor Web3Forms configured. Simulating dev success.');
      dispatched = true;
    }

    if (dispatched) {
      return NextResponse.json({
        success: true,
        message: 'Your message has been sent successfully.',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to deliver message. Please try again later or email us directly.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Contact API] Handler error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while processing your message.' },
      { status: 500 }
    );
  }
}
