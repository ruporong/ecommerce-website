"use server";
import { sendMail } from '@/lib/email';

export async function sendEmailOTP(email: string, otp: string) {
  try {
    const res = await sendMail({
      to: email,
      subject: 'Your Login OTP',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #111827;">Login Verification</h2>
          <p style="color: #4b5563;">Your One-Time Password (OTP) is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; margin: 20px 0; background: #f3f4f6; padding: 10px; border-radius: 8px;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 12px;">This code is valid for 5 minutes. Do not share this code with anyone.</p>
        </div>
      `
    });
    return res;
  } catch (error) {
    console.error("OTP send error:", error);
    return { success: false, error: 'Failed to send OTP' };
  }
}
