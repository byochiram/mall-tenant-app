const nodemailer = require('nodemailer');
const prisma = require('./prisma');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

async function sendEmail({ to, subject, html }) {
  try {
    if (!process.env.SMTP_USER) {
      console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
      return { success: true, mock: true };
    }
    await transporter.sendMail({
      from: `"MallManager" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function sendInvoiceReminder(invoice, daysBefore) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: invoice.tenantId },
    include: { contacts: { where: { isPrimary: true }, take: 1 } },
  });
  if (!tenant) return;

  const email = tenant.contacts?.[0]?.email;
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const subject = `[MallManager] Pengingat: Invoice ${invoice.invoiceNo} jatuh tempo ${daysBefore === 0 ? 'hari ini' : `dalam ${daysBefore} hari`}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Pengingat Pembayaran</h2>
      <p>Kepada Yth. <strong>${tenant.businessName}</strong>,</p>
      <p>Berikut pengingat untuk invoice Anda:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb;">No. Invoice</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${invoice.invoiceNo}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb;">Periode</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${invoice.period}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb;">Total</td><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Rp ${invoice.totalAmount.toLocaleString('id-ID')}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb;">Jatuh Tempo</td><td style="padding: 8px; border: 1px solid #e5e7eb; color: ${daysBefore <= 3 ? '#dc2626' : '#1f2937'}; font-weight: bold;">${dueDate}</td></tr>
      </table>
      <p>Silakan lakukan pembayaran sebelum tanggal jatuh tempo untuk menghindari denda keterlambatan.</p>
      <p style="color: #6b7280; font-size: 12px;">Email ini dikirim otomatis oleh sistem MallManager.</p>
    </div>
  `;

  if (email) {
    await sendEmail({ to: email, subject, html });
    await prisma.emailLog.create({
      data: { tenantId: tenant.id, recipientEmail: email, subject, body: html },
    });
  }
}

module.exports = { sendEmail, sendInvoiceReminder };
