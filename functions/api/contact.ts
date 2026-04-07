interface Env {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
}

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
}

interface FormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  'cf-turnstile-response': string;
}

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  const formData = new URLSearchParams();
  formData.append('secret', secret);
  formData.append('response', token);
  if (ip) formData.append('remoteip', ip);

  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });

  const outcome: TurnstileResponse = await result.json();
  return outcome.success;
}

async function sendEmail(env: Env, form: FormData): Promise<Response> {
  const phoneLine = form.phone ? `\nPhone: ${form.phone}` : '';

  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Revive Studios <noreply@revivestudiosut.com>',
      to: [env.CONTACT_TO_EMAIL],
      subject: `New inquiry from ${form.name}`,
      reply_to: form.email,
      text: [
        `Name: ${form.name}`,
        `Email: ${form.email}`,
        phoneLine,
        '',
        'Message:',
        form.message,
      ].filter(Boolean).join('\n'),
    }),
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: FormData;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  if (!body.name || !body.email || !body.message) {
    return json({ error: 'Name, email, and message are required' }, 400);
  }

  const turnstileToken = body['cf-turnstile-response'];
  if (!turnstileToken) {
    return json({ error: 'Please complete the human verification' }, 400);
  }

  const clientIp = request.headers.get('CF-Connecting-IP');
  const turnstileValid = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, clientIp);
  if (!turnstileValid) {
    return json({ error: 'Human verification failed. Please try again.' }, 403);
  }

  const emailResponse = await sendEmail(env, body);
  if (!emailResponse.ok) {
    const detail = await emailResponse.text();
    console.error('Resend API error:', detail);
    return json({ error: 'Failed to send message. Please try again later.' }, 500);
  }

  return json({ success: true, message: 'Thank you! We\'ll be in touch soon.' });
};
