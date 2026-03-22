import type { Knex } from 'knex';
// import dotenv from 'dotenv';

// dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
    pool: { min: 2, max: 10 },
  },

  test: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_TEST_NAME,
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
    pool: { min: 2, max: 10 },
  },
};

module.exports = config;
