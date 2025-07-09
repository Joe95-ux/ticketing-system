import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailTemplate = 'ticket-created' | 'ticket-assigned' | 'ticket-updated' | 'ticket-resolved' | 'welcome-user';

interface TicketEmailProps {
  ticketId: string;
  ticketTitle: string;
  recipientEmail: string;
  recipientName: string | null;
  updaterName?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  assigneeName?: string | null;
  comment?: string;
  name?: string;
  email?: string;
  password?: string;
}

interface WelcomeEmailProps {
  name: string,
  email: string;
  password: string;
}

const templates: {
  [K in EmailTemplate]: (props: EmailProps[K]) => { subject: string; html: string }
} = {
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
  }),

  'welcome-user': (props: WelcomeEmailProps) => ({
    subject: "Welcome to TixHub - Your Account Details",
    html: `
      <h1>Welcome to TixHub</h1>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <p><strong>Email:</strong> ${props.email}</p>
      <p><strong>Password:</strong> ${props.password}</p>
      <p>Please change your password after your first login.</p>
      <p>Best regards,<br>TixHub Team</p>
    `
  })
};

type EmailProps = {
  'ticket-created': TicketEmailProps;
  'ticket-assigned': TicketEmailProps;
  'ticket-updated': TicketEmailProps;
  'ticket-resolved': TicketEmailProps;
  'welcome-user': WelcomeEmailProps;
}

export async function sendTicketEmail<T extends EmailTemplate>(
  template: T,
  props: EmailProps[T]
) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const emailTemplate = templates[template] as (props: EmailProps[T]) => { subject: string; html: string };
    const { subject, html } = emailTemplate(props);
    
    // Fire and forget - don't await or throw errors
    Promise.resolve().then(async () => {
      try {
        const toEmail = template === 'welcome-user' 
          ? (props as WelcomeEmailProps).email 
          : (props as TicketEmailProps).recipientEmail || '';

        if (!toEmail) {
          throw new Error('No recipient email provided');
        }

        const result = await resend.emails.send({
          from: "TixHub <onboarding@resend.dev>",
          to: toEmail,
          subject,
          html
        });
        console.log('Email send result:', result);
      } catch (error) {
        console.error('Failed to send email:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
      }
    });

    // Return success immediately without waiting for email
    return { success: true };
  } catch (error) {
    // If template generation fails, log it but don't block the process
    console.error('Error preparing email:', error);
    return { success: false, error: 'Failed to prepare email' };
  }
} 