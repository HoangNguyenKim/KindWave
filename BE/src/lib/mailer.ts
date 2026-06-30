import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { ENV } from "@/config/env.config";
import { logger } from "@/config/pino.logger";

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (transporter) {
    return transporter;
  }
  if (!ENV.SMTP_HOST || !ENV.SMTP_PORT) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: Number(ENV.SMTP_PORT),
    secure: Number(ENV.SMTP_PORT) === 465,
    auth:
      ENV.SMTP_USER && ENV.SMTP_PASS
        ? { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS }
        : undefined,
  });
  return transporter;
};

export const sendMail = async (params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> => {
  const tx = getTransporter();

  if (!tx) {
    // No SMTP configured (local/dev): log instead of failing the request.
    logger.info(
      { to: params.to, subject: params.subject },
      "SMTP not configured; email not sent. Logging payload for development."
    );
    return;
  }

  await tx.sendMail({
    from: ENV.SMTP_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
};

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  await sendMail({
    to,
    subject: "KindWave - Mã OTP đặt lại mật khẩu",
    html: `<p>Mã OTP đặt lại mật khẩu của bạn là: <strong>${otp}</strong></p><p>Mã có hiệu lực trong 5 phút.</p>`,
  });
};
