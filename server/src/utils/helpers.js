const generateInvoiceNo = async (prisma) => {
  const count = await prisma.invoice.count();
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const seq = String(count + 1).padStart(4, '0');
  return `INV-${y}${m}-${seq}`;
};

const generateContractNo = async (prisma) => {
  const count = await prisma.leaseContract.count();
  const date = new Date();
  const y = date.getFullYear();
  const seq = String(count + 1).padStart(3, '0');
  return `CTR-${y}-${seq}`;
};

const generateTenantCode = async (prisma) => {
  const count = await prisma.tenant.count();
  return `TNT-${String(count + 1).padStart(4, '0')}`;
};

const generatePaymentNo = async (prisma) => {
  const count = await prisma.payment.count();
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const seq = String(count + 1).padStart(4, '0');
  return `PAY-${y}${m}-${seq}`;
};

module.exports = { generateInvoiceNo, generateContractNo, generateTenantCode, generatePaymentNo };
