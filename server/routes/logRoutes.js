import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
  // Save log to DB (placeholder)
  res.json({ message: 'Log received', data: req.body });
});

export default router;
