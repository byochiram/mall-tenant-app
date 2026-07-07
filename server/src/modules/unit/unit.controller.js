const prisma = require('../../utils/prisma');

// Floors
const getFloors = async (req, res) => {
  try {
    const floors = await prisma.floor.findMany({
      include: { _count: { select: { units: true } } },
      orderBy: { number: 'asc' },
    });
    res.json(floors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createFloor = async (req, res) => {
  try {
    const floor = await prisma.floor.create({ data: req.body });
    res.status(201).json(floor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateFloor = async (req, res) => {
  try {
    const floor = await prisma.floor.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    res.json(floor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeFloor = async (req, res) => {
  try {
    const unitCount = await prisma.unit.count({ where: { floorId: parseInt(req.params.id) } });
    if (unitCount > 0) return res.status(400).json({ error: 'Tidak bisa hapus lantai yang masih punya unit' });
    await prisma.floor.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Lantai berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Units
const getUnits = async (req, res) => {
  try {
    const { floorId, status, unitType, search } = req.query;
    const where = {};
    if (floorId) where.floorId = parseInt(floorId);
    if (status) where.status = status;
    if (unitType) where.unitType = unitType;
    if (search) {
      where.OR = [
        { unitNumber: { contains: search } },
        { description: { contains: search } },
      ];
    }
    const units = await prisma.unit.findMany({
      where,
      include: {
        floor: true,
        tenantUnits: { where: { isCurrent: true }, include: { tenant: { select: { id: true, code: true, businessName: true, status: true } } } },
      },
      orderBy: [{ floor: { number: 'asc' } }, { unitNumber: 'asc' }],
    });
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUnitById = async (req, res) => {
  try {
    const unit = await prisma.unit.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        floor: true,
        tenantUnits: { include: { tenant: true }, orderBy: { startDate: 'desc' } },
      },
    });
    if (!unit) return res.status(404).json({ error: 'Unit tidak ditemukan' });
    res.json(unit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUnit = async (req, res) => {
  try {
    const unit = await prisma.unit.create({ data: req.body, include: { floor: true } });
    res.status(201).json(unit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateUnit = async (req, res) => {
  try {
    const unit = await prisma.unit.update({ where: { id: parseInt(req.params.id) }, data: req.body, include: { floor: true } });
    res.json(unit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeUnit = async (req, res) => {
  try {
    const activeTU = await prisma.tenantUnit.count({ where: { unitId: parseInt(req.params.id), isCurrent: true } });
    if (activeTU > 0) return res.status(400).json({ error: 'Tidak bisa hapus unit yang sedang disewa' });
    await prisma.tenantUnit.deleteMany({ where: { unitId: parseInt(req.params.id) } });
    await prisma.unit.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Unit berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign tenant to unit
const assignTenant = async (req, res) => {
  try {
    const { tenantId, startDate, endDate } = req.body;
    const unitId = parseInt(req.params.id);

    const existing = await prisma.tenantUnit.findFirst({ where: { unitId, isCurrent: true } });
    if (existing) return res.status(400).json({ error: 'Unit sudah disewa tenant lain' });

    const assignment = await prisma.$transaction(async (tx) => {
      const tu = await tx.tenantUnit.create({
        data: { tenantId, unitId, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, isCurrent: true },
        include: { tenant: true, unit: true },
      });
      await tx.unit.update({ where: { id: unitId }, data: { status: 'occupied' } });
      return tu;
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const unassignTenant = async (req, res) => {
  try {
    const unitId = parseInt(req.params.id);
    await prisma.$transaction(async (tx) => {
      await tx.tenantUnit.updateMany({ where: { unitId, isCurrent: true }, data: { isCurrent: false, endDate: new Date() } });
      await tx.unit.update({ where: { id: unitId }, data: { status: 'available' } });
    });
    res.json({ message: 'Tenant berhasil di-unassign dari unit' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getFloors, createFloor, updateFloor, removeFloor, getUnits, getUnitById, createUnit, updateUnit, removeUnit, assignTenant, unassignTenant };
