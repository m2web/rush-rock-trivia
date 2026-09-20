// Shared meetup submission alert utility for Cloudflare Pages Functions.
// Sends email notifications via the Resend REST API (no npm dependency).
// Designed to be invoked with context.waitUntil() so it never blocks the
// HTTP response to the user, and fails gracefully if sending encounters an error.

import { Env } from './types';
import type { Meetup } from '../data/defaultMeetups';

/**
 * Send an email notification when a fan submits a new meetup/event.
 *
 * Call this inside `context.waitUntil()`:
 * ```ts
 * context.waitUntil(sendNewMeetupAlert(context.env, newMeetup));
 * ```
 *
 * Exits cleanly without throwing if RESEND_API_KEY or ALERT_EMAIL are unset.
 */
export async function sendNewMeetupAlert(
  env: Env,
  meetup: Meetup,
): Promise<void> {
  const { RESEND_API_KEY, ALERT_EMAIL } = env;

  if (!RESEND_API_KEY || !ALERT_EMAIL) {
    console.warn('⚠️ Meetup alert skipped — RESEND_API_KEY or ALERT_EMAIL not configured.');
    return;
  }

  const isApproved = meetup.status === 'approved';
  const statusLabel = isApproved ? 'Auto-Approved' : 'Pending Review';
  const statusEmoji = isApproved ? '✅' : '⏳';
  const statusColor = isApproved ? '#16a34a' : '#d97706';
  const statusBg = isApproved ? '#dcfce7' : '#fef3c7';

  const subject = `${statusEmoji} [Rush 2026 Meetup] ${statusLabel}: ${meetup.name} (${meetup.tour_city})`;

  const safeTitle = escapeHtml(meetup.name);
  const safeCity = escapeHtml(meetup.tour_city);
  const safeVenue = escapeHtml(meetup.venue_name);
  const safeAddress = meetup.address ? escapeHtml(meetup.address) : 'None provided';
  const safeDate = escapeHtml(meetup.event_date);
  const safeTime = meetup.start_time ? escapeHtml(meetup.start_time) : 'TBD';
  const safeCategory = meetup.category ? escapeHtml(meetup.category) : 'tailgate';
  const safeOrganizer = meetup.organizer_name ? escapeHtml(meetup.organizer_name) : 'Rush Fan';
  const safeDescription = meetup.description ? escapeHtml(meetup.description) : 'No description provided';
  const safeId = escapeHtml(meetup.id);
  const safeRsvp = meetup.rsvp_link ? escapeHtml(meetup.rsvp_link) : null;

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1f2937;">
  <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 20px;">
    <h1 style="font-size: 20px; margin: 0 0 8px 0; color: #111827;">🎸 New Rush Fan Meetup Submitted</h1>
    <div style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 13px; font-weight: 600; background: ${statusBg}; color: ${statusColor};">
      ${statusEmoji} ${statusLabel}
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <tr>
      <td style="padding: 10px 12px; background: #f9fafb; font-weight: 600; width: 120px; border: 1px solid #e5e7eb;">Event Title</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb;"><strong>${safeTitle}</strong></td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Tour City</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${safeCity}</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Venue</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${safeVenue}</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Address</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${safeAddress}</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Date & Time</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${safeDate} at ${safeTime}</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Category</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${safeCategory}</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Organizer</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${safeOrganizer}</td>
    </tr>
    ${safeRsvp ? `
    <tr>
      <td style="padding: 10px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">RSVP Link</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb;"><a href="${safeRsvp}" target="_blank" style="color: #2563eb; text-decoration: underline;">${safeRsvp}</a></td>
    </tr>` : ''}
    <tr>
      <td style="padding: 10px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Description</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${safeDescription}</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Event ID</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb;"><code>${safeId}</code></td>
    </tr>
  </table>

  ${!isApproved ? `
  <div style="margin-top: 20px; padding: 16px; background: #fefce8; border: 1px solid #fef08a; border-radius: 8px;">
    <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #854d0e;">⚡ Admin Action Required</h3>
    <p style="margin: 0 0 10px 0; font-size: 13px; color: #713f12;">This event is held in <strong>pending_review</strong>. To publish it live to fans, run:</p>
    <pre style="margin: 0; padding: 10px; background: #1f2937; color: #f9fafb; border-radius: 6px; font-size: 12px; overflow-x: auto;">npx wrangler d1 execute rush_fan_parties --remote --command="UPDATE meetups SET status = 'approved' WHERE id = '${safeId}';"</pre>
    <p style="margin: 10px 0 0 0; font-size: 13px; color: #713f12;">To reject / delete this submission:</p>
    <pre style="margin: 6px 0 0 0; padding: 10px; background: #1f2937; color: #f9fafb; border-radius: 6px; font-size: 12px; overflow-x: auto;">npx wrangler d1 execute rush_fan_parties --remote --command="DELETE FROM meetups WHERE id = '${safeId}';"</pre>
  </div>
  ` : ''}

  <p style="margin-top: 24px; color: #9ca3af; font-size: 12px;">
    Automated notification sent by the rush2026.fyi meetup manager.
  </p>
</div>
`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Rush 2026 Meetups <onboarding@resend.dev>',
        to: ALERT_EMAIL,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Resend API error sending meetup alert: ${response.status} — ${errorText}`);
    } else {
      console.log(`✅ Meetup alert email successfully sent to ${ALERT_EMAIL} (${meetup.id})`);
    }
  } catch (err) {
    // Non-blocking catch to ensure function reliability
    console.error('❌ Failed to send meetup alert email:', err);
  }
}

/** Escape HTML special characters to prevent injection in the email body. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
