import app from './app';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.listen(PORT, () => {
  console.log(`PulseOps API [development] port ${PORT}`);
  console.log('  Auth:     POST /api/auth/register  |  POST /api/auth/login');
  console.log('  Intercom: GET  /api/intercom/status');
  console.log('  Webhooks: POST /api/webhooks/intercom');
  console.log('  Events:   GET  /api/events?token=<jwt>  (SSE, local only)');
  console.log('            GET  /api/events/poll?since=<unix>');
  console.log('  Health:   GET  /api/health');
});
