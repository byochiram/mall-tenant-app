const generateInvoiceNo = (prefix = 'INV') => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${y}${m}-${rand}`;
};

const generateContractNo = () => {
  const date = new Date();
  const y = date.getFullYear();
  const rand = Math.floor(100 + Math.random() * 900);
  return `CTR-${y}-${rand}`;
};

const generateTenantCode = async (prisma) => {
  const count = await prisma.tenant.count();
  return `TNT-${String(count + 1).padStart(4, '0')}`;
};

const generatePaymentNo = () => generateInvoiceNo('PAY');

module.exports = { generateInvoiceNo, generateContractNo, generateTenantCode, generatePaymentNo };
