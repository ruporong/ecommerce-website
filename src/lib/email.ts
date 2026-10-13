import nodemailer from 'nodemailer';
import connectToDatabase from './mongodb';
import Setting from '@/models/Setting';

export async function sendMail({ to, subject, html }: { to: string, subject: string, html: string }) {
  await connectToDatabase();
  
  // Try to get SMTP settings from Database first, fallback to process.env
  const settings = await Setting.find({
    key: { $in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from'] }
  }).lean();

  const config = settings.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  const host = config.smtp_host || process.env.SMTP_HOST;
  const port = parseInt(config.smtp_port || process.env.SMTP_PORT || '465');
  const user = config.smtp_user || process.env.SMTP_USER;
  const pass = config.smtp_pass || process.env.SMTP_PASS;
  const from = config.smtp_from || process.env.SMTP_FROM || `"${process.env.STORE_NAME || 'Store'}" <${user}>`;

  if (!host || !user || !pass) {
    console.warn('SMTP settings are missing. Email not sent.');
    return { success: false, error: 'SMTP settings missing' };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}
