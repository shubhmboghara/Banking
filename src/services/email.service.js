import dotenv from "dotenv";
import nodemailer, { createTransport } from "nodemailer";

dotenv.config();

const emailBrand = "Backend Ledger";
const emailFrom = `"${emailBrand}" <${process.env.EMAIL_USER}>`;

const transporter = createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject,
      text,
      html,
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const safeName = name || "there";
  const subject = "Welcome to Backend Ledger";
  const text = `Hi ${safeName},\n\nWelcome to Backend Ledger. Your account is ready and you can now start using the platform. If you need help, just reply to this email and our team will assist you.\n\nBest regards,\nBackend Ledger Team`;
  const html = `
    <div style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.08);">
              <tr>
                <td style="padding:32px 32px 24px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);color:#ffffff;">
                  <div style="font-size:14px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.85;">${emailBrand}</div>
                  <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">Welcome aboard, ${safeName}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;color:#0f172a;">
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Your account has been created successfully. You can now sign in and start using Backend Ledger.</p>
                  <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">If you run into anything unexpected, reply to this message and we will help you out.</p>
                  <div style="padding:16px 20px;border-radius:14px;background:#eff6ff;color:#1d4ed8;font-weight:700;display:inline-block;">Secure. Fast. Ready to use.</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px 32px;color:#475569;font-size:14px;line-height:1.6;">
                  <p style="margin:0;">Best regards,<br>${emailBrand} Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>`;

  await sendEmail(userEmail, subject, text, html);
}

const sendLoginEmail = async (userEmail, name) => {
  const safeName = name || "there";
  const subject = "New Login Alert";
  const text = `Hi ${safeName},\n\nWe noticed a new login to your account. If this was you, you can safely ignore this email. If you did not log in, please reset your password immediately and contact our support team.\n\nBest regards,\nBackend Ledger Team`;
  const html = `
    <div style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.08);">
              <tr>
                <td style="padding:32px 32px 24px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);color:#ffffff;">
                  <div style="font-size:14px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.85;">${emailBrand}</div>
                  <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">New Login Detected</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;color:#0f172a;">
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">We noticed a new login to your account. If this was you, you can safely ignore this email. If you did not log in, please reset your password immediately and contact our support team.</p>
                  <div style="padding:16px 20px;border-radius:14px;background:#fee2e2;color:#b91c1c;font-weight:700;display:inline-block;">If this wasn't you, take action now!</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px 32px;color:#475569;font-size:14px;line-height:1.6;">
                  <p style="margin:0;">Best regards,<br>${emailBrand} Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>`;

  await sendEmail(userEmail, subject, text, html);
};

const sendTransactionEmail = async (
  userEmail,
  name,
  amount,
  toAccount,
  type,
) => {
  const safeName = name || "there";
  const subject = `Transaction Alert: ${type} of $${amount}`;
  const text = `Hi ${safeName},\n\nA ${type} transaction of $${amount} has been made on your account. If you did not authorize this transaction, please contact our support team immediately.\n\nBest regards,\nBackend Ledger Team`;
  const html = `
    <div style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;   box-shadow:0 12px 30px rgba(15,23,42,0.08);">
              <tr>
                <td style="padding:32px 32px 24px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);color:#ffffff;">
                  <div style="font-size:14px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.85;">${emailBrand}</div>
                  <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">Transaction Alert</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;color:#0f172a;">
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">A ${type} transaction of $${amount} has been made on your account. If you did not authorize this transaction, please contact our support team immediately.</p>
                  <div style="padding:16px 20px;border-radius:14px;background:#fee2e2;color:#b91c1c;font-weight:700;display:inline-block;">If this wasn't you, take action now!</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px 32px;color:#475569;font-size:14px;line-height:1.6;">
                  <p style="margin:0;">Best regards,<br>${emailBrand} Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>`;

  await sendEmail(userEmail, subject, text, html);
};

const sendTransactionfailedEmail = async (
  userEmail,
  name,
  amount,
  toAccount,
  type,
) => {
  const safeName = name || "there";
  const subject = `Transaction Failed: ${type} of $${amount}`;
  const text = `Hi ${safeName},\n\nWe wanted to let you know that a ${type} transaction of $${amount} has failed. If you were trying to make this transaction, please check your account details and try again. If you have any questions, feel free to contact our support team.\n\nBest regards,\nBackend Ledger Team`;
  const html = `
    <div style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.08);">
              <tr>
                <td style="padding:32px 32px 24px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);color:#ffffff;">
                  <div style="font-size:14px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.85;">${emailBrand}</div>
                  <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">Transaction Failed</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;color:#0f172a;">
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">We wanted to let you know that a ${type} transaction of $${amount} has failed. If you were trying to make this transaction, please check your account details and try again. If you have any questions, feel free to contact our support team.</p>
                  <div style="padding:16px 20px;border-radius:14px;background:#fee2e2;color:#b91c1c;font-weight:700;display:inline-block;">If you need help, we're here for you!</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px 32px;color:#475569;font-size:14px;line-height:1.6;">
                  <p style="margin:0;">Best regards,<br>${emailBrand} Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>`;

  await sendEmail(userEmail, subject, text, html);
};

export {
  transporter,
  sendEmail,
  sendRegistrationEmail,
  sendLoginEmail,
  sendTransactionEmail,
  sendTransactionfailedEmail,
};
