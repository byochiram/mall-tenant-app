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

async function checkExpiredContracts() {
  console.log('[CRON] Checking expired contracts...');
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const expiredContracts = await prisma.leaseContract.findMany({
    where: {
      status: 'active',
      endDate: { lt: now },
    },
    include: { tenant: { include: { tenantUnits: { where: { isCurrent: true } } } } },
  });

  for (const contract of expiredContracts) {
    await prisma.$transaction(async (tx) => {
      // 1. Update contract status
      await tx.leaseContract.update({
        where: { id: contract.id },
        data: { status: 'expired' },
      });

      // 2. Update tenant status
      await tx.tenant.update({
        where: { id: contract.tenantId },
        data: { status: 'terminated', exitDate: now },
      });

      // 3. Unassign units
      for (const tu of contract.tenant.tenantUnits) {
        await tx.tenantUnit.update({
          where: { id: tu.id },
          data: { isCurrent: false, endDate: now },
        });
        await tx.unit.update({
          where: { id: tu.unitId },
          data: { status: 'available' },
        });
      }

      // 4. Create notification
      await tx.notification.create({
        data: {
          tenantId: contract.tenantId,
          title: 'Kontrak Expired',
          message: `Kontrak ${contract.contractNumber} telah berakhir pada ${contract.endDate.toISOString().slice(0, 10)}`,
          type: 'contract_expired',
        },
      });
    });

    console.log(`[CRON] Contract ${contract.contractNumber} marked as expired`);
  }

  if (expiredContracts.length === 0) {
    console.log('[CRON] No expired contracts found');
  }
}

module.exports = { checkDueDateReminders, checkExpiredContracts };
