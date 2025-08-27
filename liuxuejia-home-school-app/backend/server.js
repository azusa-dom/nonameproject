import 'dotenv/config';
import app from './src/app.js';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Backend listening on port ${port}`);
  console.log(`📍 API: http://localhost:${port}/api`);
});


