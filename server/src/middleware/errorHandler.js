function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.message);

  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'data';
    return res.status(409).json({ error: `Data sudah ada (duplikat pada field: ${field})` });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Data tidak ditemukan' });
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Data terkait tidak ditemukan' });
  }
  if (err.code?.startsWith('P')) {
    return res.status(400).json({ error: 'Data tidak valid' });
  }

  if (err.status && err.message) {
    return res.status(err.status).json({ error: err.message });
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }

  res.status(500).json({ error: err.message });
}

module.exports = errorHandler;
