const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Food & Beverage' },
      update: {},
      create: { name: 'Food & Beverage', description: 'Restoran, kafe, dan kedai makanan' },
    }),
    prisma.category.upsert({
      where: { name: 'Retail' },
      update: {},
      create: { name: 'Retail', description: 'Toko pakaian, aksesoris, dan barang dagangan' },
    }),
    prisma.category.upsert({
      where: { name: 'Entertainment' },
      update: {},
      create: { name: 'Entertainment', description: 'Bioskop, game center, dan hiburan' },
    }),
    prisma.category.upsert({
      where: { name: 'Services' },
      update: {},
      create: { name: 'Services', description: 'Salon, laundry, dan jasa lainnya' },
    }),
    prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: { name: 'Electronics', description: 'Toko elektronik dan gadget' },
    }),
  ]);

  const tenants = await Promise.all([
    prisma.tenant.create({
      data: {
        name: 'Warung Nusantara',
        categoryId: categories[0].id,
        floor: 'GF',
        unitNumber: 'GF-01',
        contactName: 'Budi Santoso',
        contactPhone: '081234567890',
        contactEmail: 'budi@warung.com',
        status: 'active',
        leaseStart: new Date('2024-01-01'),
        leaseEnd: new Date('2026-12-31'),
        monthlyRent: 15000000,
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'Fashion Hub',
        categoryId: categories[1].id,
        floor: '1',
        unitNumber: '1F-01',
        contactName: 'Siti Rahma',
        contactPhone: '081234567891',
        contactEmail: 'siti@fashionhub.com',
        status: 'active',
        leaseStart: new Date('2024-03-01'),
        leaseEnd: new Date('2027-02-28'),
        monthlyRent: 25000000,
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'GameZone',
        categoryId: categories[2].id,
        floor: '2',
        unitNumber: '2E-01',
        contactName: 'Andi Pratama',
        contactPhone: '081234567892',
        status: 'active',
        leaseStart: new Date('2024-06-01'),
        leaseEnd: new Date('2026-05-31'),
        monthlyRent: 30000000,
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'CleanExpress',
        categoryId: categories[3].id,
        floor: 'GF',
        unitNumber: 'GF-05',
        contactName: 'Dewi Lestari',
        contactPhone: '081234567893',
        contactEmail: 'dewi@clean.com',
        status: 'active',
        leaseStart: new Date('2024-02-01'),
        leaseEnd: new Date('2026-01-31'),
        monthlyRent: 10000000,
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'TechStore',
        categoryId: categories[4].id,
        floor: '1',
        unitNumber: '1T-01',
        contactName: 'Rudi Hermawan',
        contactPhone: '081234567894',
        status: 'inactive',
        leaseStart: new Date('2023-01-01'),
        leaseEnd: new Date('2025-12-31'),
        monthlyRent: 20000000,
      },
    }),
  ]);

  const paymentTypes = ['rent', 'utilities', 'maintenance', 'marketing'];
  const statuses = ['paid', 'pending', 'overdue'];

  for (const tenant of tenants) {
    for (let month = 1; month <= 6; month++) {
      const type = paymentTypes[month % paymentTypes.length];
      const status = month <= 3 ? 'paid' : month <= 5 ? 'pending' : 'overdue';
      await prisma.payment.create({
        data: {
          tenantId: tenant.id,
          amount: tenant.monthlyRent + (type !== 'rent' ? Math.floor(Math.random() * 5000000) : 0),
          type,
          status,
          dueDate: new Date(`2026-${String(month).padStart(2, '0')}-05`),
          paidDate: status === 'paid' ? new Date(`2026-${String(month).padStart(2, '0')}-03`) : null,
          invoiceNo: `INV-2026${String(month).padStart(2, '0')}-${String(tenant.id).padStart(4, '0')}`,
        },
      });
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
