const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.payment.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.leaseRenewal.deleteMany();
  await prisma.leaseContract.deleteMany();
  await prisma.tenantUnit.deleteMany();
  await prisma.tenantNote.deleteMany();
  await prisma.tenantDocument.deleteMany();
  await prisma.tenantContact.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.category.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Food & Beverage', description: 'Restoran, kafe, fast food' } }),
    prisma.category.create({ data: { name: 'Fashion', description: 'Pakaian, sepatu, aksesoris' } }),
    prisma.category.create({ data: { name: 'Electronics', description: 'Gadget, komputer, elektronik' } }),
    prisma.category.create({ data: { name: 'Entertainment', description: 'Bioskop, game center, karaoke' } }),
    prisma.category.create({ data: { name: 'Health & Beauty', description: 'Farmasi, kosmetik, gym' } }),
    prisma.category.create({ data: { name: 'Services', description: 'Bank, laundry, print shop' } }),
  ]);

  const floors = await Promise.all([
    prisma.floor.create({ data: { number: 'GF', name: 'Ground Floor' } }),
    prisma.floor.create({ data: { number: '1', name: 'Lantai 1' } }),
    prisma.floor.create({ data: { number: '2', name: 'Lantai 2' } }),
    prisma.floor.create({ data: { number: '3', name: 'Lantai 3' } }),
  ]);

  const unitsData = [
    { floorId: floors[0].id, units: ['GF-01','GF-02','GF-03','GF-04','GF-05','GF-06'] },
    { floorId: floors[1].id, units: ['1-01','1-02','1-03','1-04','1-05','1-06','1-07','1-08'] },
    { floorId: floors[2].id, units: ['2-01','2-02','2-03','2-04','2-05','2-06','2-07'] },
    { floorId: floors[3].id, units: ['3-01','3-02','3-03','3-04','3-05'] },
  ];

  const allUnits = [];
  for (const fd of unitsData) {
    for (const num of fd.units) {
      const area = 30 + Math.floor(Math.random() * 120);
      const unit = await prisma.unit.create({
        data: { floorId: fd.floorId, unitNumber: num, areaSqm: area, unitType: 'retail', status: 'available', baseRentPerSqm: 200000 + Math.floor(Math.random() * 100000), description: `Unit ${num}` },
      });
      allUnits.push(unit);
    }
  }

  const tenantsData = [
    { businessName: 'Warung Padang Sederhana', brandName: 'Sederhana', categoryId: categories[0].id, tenantType: 'inline' },
    { businessName: 'Starbucks Coffee', brandName: 'Starbucks', categoryId: categories[0].id, tenantType: 'inline' },
    { businessName: 'McDonald\'s', brandName: 'McDonald\'s', categoryId: categories[0].id, tenantType: 'anchor' },
    { businessName: 'Zara Fashion', brandName: 'Zara', categoryId: categories[1].id, tenantType: 'inline' },
    { businessName: 'H&M Store', brandName: 'H&M', categoryId: categories[1].id, tenantType: 'inline' },
    { businessName: 'Nike Flagship', brandName: 'Nike', categoryId: categories[1].id, tenantType: 'anchor' },
    { businessName: 'iBox Apple Reseller', brandName: 'iBox', categoryId: categories[2].id, tenantType: 'inline' },
    { businessName: 'Samsung Experience', brandName: 'Samsung', categoryId: categories[2].id, tenantType: 'inline' },
    { businessName: 'XXI Cinema', brandName: 'XXI', categoryId: categories[3].id, tenantType: 'anchor' },
    { businessName: 'Timezone', brandName: 'Timezone', categoryId: categories[3].id, tenantType: 'inline' },
    { businessName: 'Guardian Pharmacy', brandName: 'Guardian', categoryId: categories[4].id, tenantType: 'inline' },
    { businessName: 'Watsons', brandName: 'Watsons', categoryId: categories[4].id, tenantType: 'inline' },
    { businessName: 'BCA Bank', brandName: 'BCA', categoryId: categories[5].id, tenantType: 'kiosk' },
    { businessName: 'J.CO Donuts', brandName: 'J.CO', categoryId: categories[0].id, tenantType: 'kiosk' },
  ];

  const tenants = [];
  for (let i = 0; i < tenantsData.length; i++) {
    const td = tenantsData[i];
    const code = `TNT-${String(i + 1).padStart(4, '0')}`;
    const tenant = await prisma.tenant.create({
      data: {
        code,
        businessName: td.businessName,
        legalName: `PT ${td.businessName}`,
        brandName: td.brandName,
        categoryId: td.categoryId,
        tenantType: td.tenantType,
        status: 'active',
        joinDate: new Date(2024, Math.floor(Math.random() * 12), 1),
      },
    });
    tenants.push(tenant);
  }

  for (const tenant of tenants) {
    await prisma.tenantContact.create({
      data: { tenantId: tenant.id, contactType: 'owner', name: `Owner ${tenant.brandName}`, position: 'Owner', phone: '081234567890', email: `owner@${tenant.brandName.toLowerCase().replace(/[^a-z]/g, '')}.com`, isPrimary: true },
    });
    await prisma.tenantContact.create({
      data: { tenantId: tenant.id, contactType: 'manager', name: `Manager ${tenant.brandName}`, position: 'Store Manager', phone: '081234567891', isPrimary: false },
    });
  }

  const usedUnits = new Set();
  const contracts = [];
  for (let i = 0; i < tenants.length; i++) {
    let unitIdx;
    do { unitIdx = Math.floor(Math.random() * allUnits.length); } while (usedUnits.has(unitIdx));
    usedUnits.add(unitIdx);
    const unit = allUnits[unitIdx];
    const startDate = new Date(2025, 0, 1);
    const endDate = new Date(2027, 11, 31);
    const rentPerSqm = unit.baseRentPerSqm;
    const fixedRent = unit.areaSqm * rentPerSqm;

    await prisma.tenantUnit.create({
      data: { tenantId: tenants[i].id, unitId: unit.id, startDate, isCurrent: true },
    });
    await prisma.unit.update({ where: { id: unit.id }, data: { status: 'occupied' } });

    const contract = await prisma.leaseContract.create({
      data: {
        tenantId: tenants[i].id,
        contractNumber: `CTR-2025-${String(i + 1).padStart(3, '0')}`,
        contractType: 'new',
        startDate,
        endDate,
        durationMonths: 36,
        gracePeriodDays: tenants[i].tenantType === 'anchor' ? 30 : 0,
        fixedRent,
        rentPerSqm,
        revenueSharePercent: tenants[i].tenantType === 'anchor' ? 5 : 0,
        serviceCharge: unit.areaSqm * 50000,
        securityDeposit: fixedRent * 2,
        fitoutDeposit: 10000000,
        paymentTerms: 'monthly',
        paymentDueDay: 5,
        lateFeePercent: 2,
        annualEscalation: 5,
        status: 'active',
        approvedBy: 'System',
        approvedAt: new Date(),
        signedAt: new Date(),
      },
    });
    contracts.push(contract);
  }

  for (let i = 0; i < tenants.length; i++) {
    for (let m = 1; m <= 6; m++) {
      const period = `2026-${String(m).padStart(2, '0')}`;
      const dueDate = new Date(2026, m, 5);
      const amount = contracts[i].fixedRent;
      const invoiceNo = `INV-2026${String(m).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`;
      const status = m <= 4 ? 'paid' : m === 5 ? 'pending' : 'sent';

      const invoice = await prisma.invoice.create({
        data: {
          tenantId: tenants[i].id,
          contractId: contracts[i].id,
          invoiceNo,
          period,
          invoiceType: 'rent',
          subtotal: amount,
          taxPercent: 0,
          taxAmount: 0,
          discount: 0,
          totalAmount: amount,
          issueDate: new Date(2026, m - 1, 1),
          dueDate,
          paidDate: status === 'paid' ? new Date(2026, m - 1, 3) : null,
          status,
          lineItems: { create: [{ description: `Sewa bulanan ${period}`, quantity: 1, unitPrice: amount, amount }] },
        },
      });

      if (status === 'paid') {
        await prisma.payment.create({
          data: {
            tenantId: tenants[i].id,
            invoiceId: invoice.id,
            paymentNo: `PAY-2026${String(m).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`,
            amount,
            paymentMethod: 'transfer',
            bankName: 'BCA',
            paymentDate: new Date(2026, m - 1, 3),
            status: 'verified',
            verifiedBy: 'System',
            verifiedAt: new Date(2026, m - 1, 3),
          },
        });
      }
    }
  }

  const hashed = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: { email: 'admin@mall.com', password: hashed, name: 'Super Admin', phone: '08111111111', role: 'super_admin', status: 'active' },
  });
  await prisma.user.create({
    data: { email: 'leasing@mall.com', password: hashed, name: 'Leasing Manager', phone: '08222222222', role: 'leasing_manager', status: 'active' },
  });
  await prisma.user.create({
    data: { email: 'finance@mall.com', password: hashed, name: 'Finance Manager', phone: '08333333333', role: 'finance_manager', status: 'active' },
  });
  await prisma.user.create({
    data: { email: 'staff@mall.com', password: hashed, name: 'Staff', phone: '08444444444', role: 'staff', status: 'active' },
  });

  for (let i = 0; i < Math.min(3, tenants.length); i++) {
    const t = tenants[i];
    const slug = t.brandName.toLowerCase().replace(/[^a-z]/g, '');
    await prisma.user.create({
      data: {
        email: `${slug}@tenant.com`,
        password: hashed,
        name: `Owner ${t.brandName}`,
        phone: '08555555555',
        role: 'tenant_user',
        tenantId: t.id,
        status: 'active',
      },
    });
  }

  const unpaidInvoices = await prisma.invoice.findMany({ where: { status: { in: ['sent', 'pending'] } }, take: 3 });
  for (const inv of unpaidInvoices) {
    const daysUntil = Math.ceil((new Date(inv.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    const label = daysUntil > 0 ? `${daysUntil} hari lagi` : 'sudah jatuh tempo';
    await prisma.notification.create({
      data: {
        tenantId: inv.tenantId,
        title: `Invoice Jatuh Tempo ${label}`,
        message: `Invoice ${inv.invoiceNo} sebesar Rp ${inv.totalAmount.toLocaleString('id-ID')} jatuh tempo ${label}`,
        type: 'reminder',
        link: '/tenant-portal',
      },
    });
  }

  console.log('Seed completed!');
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Floors: ${floors.length}`);
  console.log(`  Units: ${allUnits.length}`);
  console.log(`  Tenants: ${tenants.length}`);
  console.log(`  Contracts: ${contracts.length}`);
  console.log(`  Users: 4 admin + 3 tenant`);
  console.log(`  Tenant logins: starbucks@tenant.com, mcdonalds@tenant.com, zara@tenant.com / password123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
