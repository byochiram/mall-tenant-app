const prisma = require('../utils/prisma');
const { sendInvoiceReminder } = require('../utils/email');

const REMINDER_DAYS = [30, 20, 10, 3, 1, 0];

async function checkDueDateReminders() {
  console.log('[REMINDER] Checking due date reminders...');
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['sent', 'pending'] },
      dueDate: {
        gte: now,
        lte: new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000),
      },
    },
    include: { tenant: { include: { contacts: { where: { isPrimary: true }, take: 1 } } } },
  });

  for (const invoice of upcomingInvoices) {
    const dueDate = new Date(invoice.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (REMINDER_DAYS.includes(daysUntilDue)) {
      const existingNotif = await prisma.notification.findFirst({
        where: {
          tenantId: invoice.tenantId,
          type: 'reminder',
          message: { contains: invoice.invoiceNo },
          createdAt: { gte: new Date(now.getTime() - 20 * 60 * 60 * 1000) },
        },
      });

      if (!existingNotif) {
        const label = daysUntilDue === 0 ? 'hari ini' : `${daysUntilDue} hari lagi`;
        await prisma.notification.create({
          data: {
            tenantId: invoice.tenantId,
            title: `Invoice Jatuh Tempo ${label}`,
            message: `Invoice ${invoice.invoiceNo} sebesar Rp ${invoice.totalAmount.toLocaleString('id-ID')} jatuh tempo ${label}`,
            type: 'reminder',
            link: '/tenant-portal',
          },
        });

        await sendInvoiceReminder(invoice, daysUntilDue);
        console.log(`[REMINDER] Sent reminder for ${invoice.invoiceNo} - ${daysUntilDue} days`);
      }
    }
  }

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['sent', 'pending'] },
      dueDate: { lt: now },
    },
  });

  for (const invoice of overdueInvoices) {
    if (invoice.status !== 'overdue') {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'overdue' },
      });

      await prisma.notification.create({
        data: {
          tenantId: invoice.tenantId,
          title: 'Invoice Jatuh Tempo',
          message: `Invoice ${invoice.invoiceNo} telah melewati jatuh tempo. Segera lakukan pembayaran untuk menghindari denda.`,
          type: 'overdue',
          link: '/tenant-portal',
        },
      });
      console.log(`[REMINDER] Marked ${invoice.invoiceNo} as overdue`);
    }
  }
}

module.exports = { checkDueDateReminders };
