import app from './app';
import db from './database/knex';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection established');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();
