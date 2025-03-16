import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailTemplate = 'ticket-created' | 'ticket-assigned' | 'ticket-updated' | 'ticket-resolved';

interface TicketEmailProps {
  ticketId: string;
  ticketTitle: string;
  recipientEmail: string;
  recipientName?: string | null;
  assigneeName?: string | null;
  updaterName?: string | null;
  comment?: string;
}

const templates = {
  'ticket-created': (props: TicketEmailProps) => ({
    subject: `Ticket #${props.ticketId} - Received`,
    html: `
      <h2>Ticket Received</h2>
      <p>Hello ${props.recipientName || 'there'},</p>
      <p>We have received your ticket: "${props.ticketTitle}"</p>
      <p>Our team will review it and get back to you shortly.</p>
      <p>You can view your ticket status anytime by clicking the button below:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/tickets/${props.ticketId}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Ticket</a>
    `
  }),

  'ticket-assigned': (props: TicketEmailProps) => ({
    subject: `Ticket #${props.ticketId} - Assigned`,
    html: `
      <h2>Ticket Assigned</h2>
      <p>Hello ${props.recipientName || 'there'},</p>
      <p>You have been assigned to ticket: "${props.ticketTitle}"</p>
      <p>Please review and take necessary action.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/tickets/${props.ticketId}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Ticket</a>
    `
  }),

  'ticket-updated': (props: TicketEmailProps) => ({
    subject: `Ticket #${props.ticketId} - New Update`,
    html: `
      <h2>Ticket Updated</h2>
      <p>Hello ${props.recipientName || 'there'},</p>
      <p>There has been an update to your ticket: "${props.ticketTitle}"</p>
      ${props.updaterName ? `<p>${props.updaterName} has added a comment:</p>` : ''}
      ${props.comment ? `<blockquote style="margin: 10px 0; padding: 10px; border-left: 4px solid #0070f3; background-color: #f5f5f5;">${props.comment}</blockquote>` : ''}
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/tickets/${props.ticketId}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Ticket</a>
    `
  }),

  'ticket-resolved': (props: TicketEmailProps) => ({
    subject: `Ticket #${props.ticketId} - Resolved`,
    html: `
      <h2>Ticket Resolved</h2>
      <p>Hello ${props.recipientName || 'there'},</p>
      <p>Your ticket "${props.ticketTitle}" has been resolved and closed.</p>
      <p>If you need to reference this ticket in the future, you can still access it using the link below:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/tickets/${props.ticketId}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Ticket</a>
      <p>If you feel this ticket was not fully resolved, you can create a new ticket referencing this one.</p>
    `
  })
};

export async function sendTicketEmail(
  template: EmailTemplate,
  props: TicketEmailProps
) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { subject, html } = templates[template](props);
    
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: props.recipientEmail,
      subject,
      html,
      replyTo: 'no-reply@' + process.env.NEXT_PUBLIC_APP_URL?.replace('http://', '').replace('https://', '')
    });

    if (!result.data?.id) {
      throw new Error('Failed to send email - no id returned');
    }

    return { success: true, messageId: result.data.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    // Throw the error so the API route can handle it
    throw new Error(error instanceof Error ? error.message : 'Failed to send email');
  }
} 