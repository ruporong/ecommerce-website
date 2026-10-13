import nodemailer from 'nodemailer';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export async function sendEmail(to: string | string[], subject: string, html: string) {
  await connectToDatabase();
  const settings = await Setting.find({
    key: { $in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from_email'] }
  }).lean();
  
  const config = settings.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
  
  if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
    throw new Error('SMTP is not fully configured in settings.');
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: parseInt(config.smtp_port) || 465,
    secure: parseInt(config.smtp_port) === 465,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass,
    },
  });

  const mailOptions: any = {
    from: config.smtp_from_email || config.smtp_user,
    subject,
    html,
  };

  if (Array.isArray(to)) {
    mailOptions.bcc = to.join(', ');
    mailOptions.to = config.smtp_from_email || config.smtp_user; // send to self, bcc others
  } else {
    mailOptions.to = to;
  }

  return await transporter.sendMail(mailOptions);
}
