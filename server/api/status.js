module.exports = (req, res) => {
  res.json({
    status: 'ok',
    service: 'ReadyForms API',
    vercel: true,
    environment: process.env.NODE_ENV || 'unknown',
    time: new Date().toISOString(),
    headers: req.headers
  });
};
