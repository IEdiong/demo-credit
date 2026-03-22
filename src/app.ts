import express from 'express';
import userRoutes from './modules/user/user.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import transactionRoutes from './modules/transaction/transaction.routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1/wallets', transactionRoutes);

// Health check
app.get('/health', (_, res) => {
  res
    .status(200)
    .json({ status: 'success', message: 'Demo Credit API is running' });
});

// 404 handler
app.use((_, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

export default app;
