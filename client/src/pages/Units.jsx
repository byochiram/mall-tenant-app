import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getFloors, createFloor, deleteFloor, getUnits, createUnit, deleteUnit, assignTenant, unassignTenant, getTenants } from '../services/api';
import { PageHeader, Badge, Modal, Loading, ConfirmModal, fmt, Tabs } from '../components/UI';
import { Plus, Trash2, Grid3X3, Layers, Building2, Link, Unlink, Users, MapPin, Ruler, DollarSign } from 'lucide-react';

const UNIT_TYPES = ['retail', 'food_court', 'kiosk', 'anchor', 'office', 'warehouse'];
const STATUS_OPTIONS = ['', 'available', 'occupied', 'maintenance'];

export default function Units() {
  const [tab, setTab] = useState('units');
  const [floors, setFloors] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [floorFilter, setFloorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignUnitId, setAssignUnitId] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [unassignUnitId, setUnassignUnitId] = useState(null);
  const [unitForm, setUnitForm] = useState({ floorId: '', unitNumber: '', areaSqm: '', unitType: 'retail', baseRentPerSqm: '', description: '' });
  const [floorForm, setFloorForm] = useState({ number: '', name: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, uRes, tRes] = await Promise.all([getFloors(), getUnits(), getTenants()]);
      setFloors(fRes.data);
      setUnits(uRes.data);
      setTenants(tRes.data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = units.filter(u => {
    if (floorFilter && String(u.floor?.number) !== floorFilter) return false;
    if (statusFilter && u.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: units.length,
    available: units.filter(u => u.status === 'available').length,
    occupied: units.filter(u => u.status === 'occupied').length,
    maintenance: units.filter(u => u.status === 'maintenance').length,
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    try {
      await createUnit({ ...unitForm, areaSqm: Number(unitForm.areaSqm), baseRentPerSqm: Number(unitForm.baseRentPerSqm) });
      setShowUnitModal(false);
      setUnitForm({ floorId: '', unitNumber: '', areaSqm: '', unitType: 'retail', baseRentPerSqm: '', description: '' });
      toast.success('Unit berhasil ditambahkan');
      load();
    } catch { toast.error('Gagal menambah unit'); }
  };

  const handleCreateFloor = async (e) => {
    e.preventDefault();
    try {
      await createFloor({ number: floorForm.number, name: floorForm.name });
      setShowFloorModal(false);
      setFloorForm({ number: '', name: '' });
      toast.success('Lantai berhasil ditambahkan');
      load();
    } catch { toast.error('Gagal menambah lantai'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'floor') await deleteFloor(deleteTarget.id);
      else await deleteUnit(deleteTarget.id);
      setDeleteTarget(null);
      toast.success(`${deleteTarget.type === 'floor' ? 'Lantai' : 'Unit'} berhasil dihapus`);
      load();
    } catch { toast.error('Gagal menghapus'); }
  };

  const handleAssign = async () => {
    if (!selectedTenant || !assignUnitId) return;
    try {
      await assignTenant(assignUnitId, { tenantId: Number(selectedTenant) });
      setShowAssignModal(false);
      toast.success('Tenant berhasil di-assign');
      load();
    } catch { toast.error('Gagal assign tenant'); }
  };

  const handleUnassign = async (unitId) => {
    setUnassignUnitId(unitId);
  };

  const confirmUnassign = async () => {
    if (!unassignUnitId) return;
    try { await unassignTenant(unassignUnitId); toast.success('Tenant berhasil di-unassign'); load(); } catch { toast.error('Gagal unassign'); }
    finally { setUnassignUnitId(null); }
  };

  return (
    <div className="space-y-6 fade-in">
      <PageHeader title="Units & Floors" subtitle="Kelola unit dan lantai mall"
        actions={<button className="btn btn-primary btn-sm" onClick={() => tab === 'units' ? setShowUnitModal(true) : setShowFloorModal(true)}>
          <Plus size={15} /> {tab === 'units' ? 'Tambah Unit' : 'Tambah Lantai'}
        </button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Unit', value: stats.total, icon: Grid3X3, gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
          { label: 'Tersedia', value: stats.available, icon: Building2, gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
          { label: 'Terisi', value: stats.occupied, icon: Users, gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)' },
          { label: 'Maintenance', value: stats.maintenance, icon: Layers, gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
        ].map(s => (
          <div key={s.label} className="card overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.gradient }}>
                <s.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
            <div className="h-0.5" style={{ background: s.gradient }} />
          </div>
        ))}
      </div>

      <Tabs tabs={[{ key: 'units', label: 'Unit' }, { key: 'floors', label: 'Lantai' }]} active={tab} onChange={setTab} />

      {/* Units Tab */}
      {tab === 'units' && (
        <div className="space-y-4 fade-in">
          {/* Floor map overview */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Denah Lantai</p>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {floors.map(f => {
                const floorUnits = units.filter(u => u.floorId === f.id);
                const occupied = floorUnits.filter(u => u.status === 'occupied').length;
                return (
                  <button key={f.id} onClick={() => setFloorFilter(floorFilter === f.number ? '' : f.number)}
                    className={`shrink-0 rounded-xl px-4 py-3 border-2 transition-all ${floorFilter === f.number ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <p className="text-sm font-bold text-gray-900">{f.name || `Lantai ${f.number}`}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{occupied}/{floorUnits.length} terisi</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${floorUnits.length > 0 ? (occupied / floorUnits.length) * 100 : 0}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="input-icon-wrapper">
              <Layers size={14} className="input-icon" />
              <select className="input pr-8 appearance-none cursor-pointer" value={floorFilter} onChange={e => setFloorFilter(e.target.value)}>
                <option value="">Semua Lantai</option>
                {floors.map(f => <option key={f.id} value={f.number}>{f.name}</option>)}
              </select>
            </div>
            <div className="input-icon-wrapper">
              <Grid3X3 size={14} className="input-icon" />
              <select className="input pr-8 appearance-none cursor-pointer" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">Semua Status</option>
                <option value="available">Tersedia</option>
                <option value="occupied">Terisi</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            {(floorFilter || statusFilter) && (
              <button onClick={() => { setFloorFilter(''); setStatusFilter(''); }} className="btn btn-secondary btn-sm">Reset Filter</button>
            )}
            <span className="text-xs text-gray-400 self-center ml-1">{filtered.length} unit</span>
          </div>

          {/* Unit grid */}
          {loading ? <Loading /> : filtered.length === 0 ? (
            <div className="card p-8 text-center"><Grid3X3 size={36} className="mx-auto text-gray-300 mb-2" /><p className="text-sm text-gray-400">Tidak ada unit ditemukan</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map(unit => {
                const status = unit.status;
                const tenant = unit.tenantUnits?.[0]?.tenant;
                const borderColors = { available: 'border-l-emerald-500', occupied: 'border-l-indigo-500', maintenance: 'border-l-amber-500' };
                const bgColors = { available: 'bg-emerald-50', occupied: 'bg-indigo-50', maintenance: 'bg-amber-50' };
                return (
                  <div key={unit.id} className={`card p-4 border-l-4 ${borderColors[status] || 'border-l-gray-300'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">{unit.unitNumber}</h3>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {unit.floor?.name || `Lantai ${unit.floor?.number}`}
                        </p>
                      </div>
                      <Badge status={status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className={`rounded-lg px-2.5 py-1.5 ${bgColors[status] || 'bg-gray-50'}`}>
                        <p className="text-[10px] text-gray-400">Luas</p>
                        <p className="text-xs font-semibold text-gray-800">{unit.areaSqm} m²</p>
                      </div>
                      <div className="rounded-lg px-2.5 py-1.5 bg-gray-50">
                        <p className="text-[10px] text-gray-400">Sewa/m²</p>
                        <p className="text-xs font-semibold text-gray-800">{fmt(unit.baseRentPerSqm)}</p>
                      </div>
                    </div>

                    {tenant && (
                      <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-indigo-50 mb-3">
                        <Users size={13} className="text-indigo-500" />
                        <span className="text-xs font-semibold text-indigo-700 truncate">{tenant.businessName}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                      {status === 'available' && (
                        <button className="btn btn-success btn-sm flex-1" onClick={() => { setAssignUnitId(unit.id); setSelectedTenant(''); setShowAssignModal(true); }}>
                          <Link size={13} /> Assign
                        </button>
                      )}
                      {status === 'occupied' && (
                        <button className="btn btn-secondary btn-sm flex-1" onClick={() => handleUnassign(unit.id)}>
                          <Unlink size={13} /> Unassign
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" onClick={() => setDeleteTarget({ type: 'unit', id: unit.id, label: unit.unitNumber })}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Floors Tab */}
      {tab === 'floors' && (
        <div className="fade-in">
          {loading ? <Loading /> : floors.length === 0 ? (
            <div className="card p-8 text-center"><Layers size={36} className="mx-auto text-gray-300 mb-2" /><p className="text-sm text-gray-400">Belum ada lantai</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {floors.map(floor => {
                const floorUnits = units.filter(u => u.floorId === floor.id);
                const occupied = floorUnits.filter(u => u.status === 'occupied').length;
                const available = floorUnits.filter(u => u.status === 'available').length;
                return (
                  <div key={floor.id} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                          <Layers size={18} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{floor.name || `Lantai ${floor.number}`}</h3>
                          <p className="text-[11px] text-gray-400">Lantai {floor.number}</p>
                        </div>
                      </div>
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" onClick={() => setDeleteTarget({ type: 'floor', id: floor.id, label: floor.name })}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center rounded-lg bg-gray-50 py-2">
                        <p className="text-lg font-bold text-gray-900">{floorUnits.length}</p>
                        <p className="text-[10px] text-gray-400">Total</p>
                      </div>
                      <div className="text-center rounded-lg bg-emerald-50 py-2">
                        <p className="text-lg font-bold text-emerald-700">{available}</p>
                        <p className="text-[10px] text-gray-400">Kosong</p>
                      </div>
                      <div className="text-center rounded-lg bg-indigo-50 py-2">
                        <p className="text-lg font-bold text-indigo-700">{occupied}</p>
                        <p className="text-[10px] text-gray-400">Terisi</p>
                      </div>
                    </div>
                    {floorUnits.length > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(occupied / floorUnits.length) * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal open={showUnitModal} onClose={() => setShowUnitModal(false)} title="Tambah Unit Baru">
        <form onSubmit={handleCreateUnit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Lantai *</label>
              <select className="input" value={unitForm.floorId} onChange={e => setUnitForm(f => ({ ...f, floorId: e.target.value }))} required>
                <option value="">Pilih lantai</option>
                {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div><label className="label">Nomor Unit *</label><input className="input" value={unitForm.unitNumber} onChange={e => setUnitForm(f => ({ ...f, unitNumber: e.target.value }))} placeholder="A-01" required /></div>
            <div><label className="label">Luas (m²) *</label><input type="number" className="input" value={unitForm.areaSqm} onChange={e => setUnitForm(f => ({ ...f, areaSqm: e.target.value }))} placeholder="50" required /></div>
            <div><label className="label">Tipe Unit</label>
              <select className="input" value={unitForm.unitType} onChange={e => setUnitForm(f => ({ ...f, unitType: e.target.value }))}>
                {UNIT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Sewa Dasar /m² *</label><input type="number" className="input" value={unitForm.baseRentPerSqm} onChange={e => setUnitForm(f => ({ ...f, baseRentPerSqm: e.target.value }))} placeholder="150000" required /></div>
          <div><label className="label">Deskripsi</label><textarea className="input" rows={2} value={unitForm.description} onChange={e => setUnitForm(f => ({ ...f, description: e.target.value }))} placeholder="Opsional" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowUnitModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>

      <Modal open={showFloorModal} onClose={() => setShowFloorModal(false)} title="Tambah Lantai">
        <form onSubmit={handleCreateFloor} className="space-y-4">
          <div><label className="label">Nomor Lantai *</label><input className="input" value={floorForm.number} onChange={e => setFloorForm(f => ({ ...f, number: e.target.value }))} placeholder="5" required /></div>
          <div><label className="label">Nama Lantai *</label><input className="input" value={floorForm.name} onChange={e => setFloorForm(f => ({ ...f, name: e.target.value }))} placeholder="Lantai 5" required /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowFloorModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>

      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Tenant ke Unit">
        <div className="space-y-4">
          <div><label className="label">Pilih Tenant</label>
            <select className="input" value={selectedTenant} onChange={e => setSelectedTenant(e.target.value)}>
              <option value="">Pilih tenant...</option>
              {(() => {
                const assignedTenantIds = new Set(
                  units
                    .filter(u => u.status === 'occupied' && u.tenantUnits?.[0]?.tenant)
                    .map(u => u.tenantUnits[0].tenant.id)
                );
                const unassigned = tenants.filter(t => !assignedTenantIds.has(t.id));
                const assigned = tenants.filter(t => assignedTenantIds.has(t.id));
                return (
                  <>
                    {unassigned.map(t => (
                      <option key={t.id} value={t.id}>{t.code} — {t.businessName}</option>
                    ))}
                    {assigned.length > 0 && (
                      <optgroup label="Sudah di-assign (tidak bisa dipilih)">
                        {assigned.map(t => {
                          const unit = units.find(u => u.tenantUnits?.[0]?.tenant?.id === t.id);
                          return (
                            <option key={t.id} value={t.id} disabled style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                              {t.code} — {t.businessName} (Unit {unit?.unitNumber || '?'})
                            </option>
                          );
                        })}
                      </optgroup>
                    )}
                  </>
                );
              })()}
            </select>
            <p className="text-[11px] text-gray-400 mt-1">Tenant yang sudah di-assign ke unit lain tidak bisa dipilih</p>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Batal</button>
            <button className="btn btn-primary" disabled={!selectedTenant} onClick={handleAssign}>Assign</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={`Hapus ${deleteTarget?.type === 'floor' ? 'Lantai' : 'Unit'}`} message={`Yakin ingin menghapus "${deleteTarget?.label}"? Tindakan ini tidak dapat dibatalkan.`} />
      <ConfirmModal open={!!unassignUnitId} onClose={() => setUnassignUnitId(null)} onConfirm={confirmUnassign} title="Unassign Tenant" message="Tenant akan di-unassign dari unit ini. Lanjutkan?" />
    </div>
  );
}
