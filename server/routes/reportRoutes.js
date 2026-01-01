import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  // Return dummy report
  res.json({ report: 'Sample report data' });
});

export default router;
