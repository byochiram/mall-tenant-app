const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { uploadProof } = require('../../middleware/upload');
const asyncHandler = require('../../utils/asyncHandler');

const router = Router();
router.use(authenticate);

router.post('/proof', uploadProof.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang di-upload' });
  const fileUrl = `/uploads/proofs/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
}));

module.exports = router;
