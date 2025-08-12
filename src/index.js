import app from './app.js';
import { CONFIG } from './config/env.js';

const PORT = CONFIG.PORT; // Render définit PORT automatiquement

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
