import * as nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface IEmailer {
  sendMail(payload: EmailPayload): Promise<void>;
}

export class RealEmailer implements IEmailer {
  private transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  async sendMail(payload: EmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
  }
}

export class MockEmailer implements IEmailer {
  async sendMail(payload: EmailPayload): Promise<void> {
    // For testing: just log the email
    console.log(`[MockEmail] To: ${payload.to}\nSubject: ${payload.subject}\n${payload.text}`);
  }
}

// Default export for production (swap to MockEmailer in tests)
export const emailer: IEmailer = new RealEmailer();
