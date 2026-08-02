// Shared error-alert utility for Cloudflare Pages Functions.
// Sends email notifications via the Resend REST API (no npm dependency).
// Designed to be called inside context.waitUntil() so it never blocks the
// response to the client, and fails silently if the email send itself fails.

import { Env } from './types';

export interface ErrorAlertContext {
  /** The API route that failed, e.g. '/api/trivia' */
  endpoint: string;
  /** Human-readable provider label, e.g. 'OpenAI (gpt-5.4-nano)' */
  provider: string;
  /** The actual error message captured from the exception */
  errorMessage: string;
  /** ISO-8601 timestamp of the failure */
  timestamp: string;
}

/**
 * Send an error-alert email via the Resend REST API.
 *
 * Call this inside `context.waitUntil()` so the email is sent after the
 * HTTP response has already been returned to the user:
 *
 * ```ts
 * context.waitUntil(
 *   sendErrorAlert(context.env, { endpoint, provider, errorMessage, timestamp })
 * );
 * ```
 *
 * If `RESEND_API_KEY` or `ALERT_EMAIL` are not configured the function
 * exits immediately without throwing.
 */
export async function sendErrorAlert(
  env: Env,
  ctx: ErrorAlertContext,
): Promise<void> {
  const { RESEND_API_KEY, ALERT_EMAIL } = env;

  // Silently skip if alerting is not configured
  if (!RESEND_API_KEY || !ALERT_EMAIL) {
    console.warn('⚠️ Error alerting skipped — RESEND_API_KEY or ALERT_EMAIL not set.');
    return;
  }

  const subject = `🚨 rush2026.fyi Error — ${ctx.endpoint}`;

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #dc2626; margin-top: 0;">🚨 rush2026.fyi API Error</h2>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr>
      <td style="padding: 8px 12px; background: #f3f4f6; font-weight: bold; width: 120px; border: 1px solid #e5e7eb;">Endpoint</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;"><code>${ctx.endpoint}</code></td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; background: #f3f4f6; font-weight: bold; border: 1px solid #e5e7eb;">Provider</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${ctx.provider}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; background: #f3f4f6; font-weight: bold; border: 1px solid #e5e7eb;">Timestamp</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${ctx.timestamp}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; background: #f3f4f6; font-weight: bold; border: 1px solid #e5e7eb;">Error</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #dc2626;">
        <pre style="margin: 0; white-space: pre-wrap; word-break: break-word; font-size: 13px;">${escapeHtml(ctx.errorMessage)}</pre>
      </td>
    </tr>
  </table>
  <p style="color: #6b7280; font-size: 13px; margin-bottom: 0;">
    This alert was sent automatically by the rush2026.fyi error notifier.
  </p>
</div>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Rush 2026 Alerts <onboarding@resend.dev>',
        to: ALERT_EMAIL,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`❌ Resend API error: ${response.status} — ${body}`);
    } else {
      console.log(`✅ Error alert email sent to ${ALERT_EMAIL}`);
    }
  } catch (err) {
    // Never let alerting failures propagate — just log them
    console.error('❌ Failed to send error alert email:', err);
  }
}

/** Escape HTML special characters to prevent injection in the email body. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
