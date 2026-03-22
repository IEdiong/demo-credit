import type { Knex } from 'knex';
// import dotenv from 'dotenv';

// dotenv.config();

const config: { [key: string]: Knex.Config } = {
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQLHOST,
      port: Number(process.env.MYSQLPORT),
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
    },
    migrations: {
      directory: './migrations',
      extension: 'js',
    },
    pool: { min: 2, max: 10 },
  },

  development: {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQLHOST,
      port: Number(process.env.MYSQLPORT),
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
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
      host: process.env.MYSQLHOST,
      port: Number(process.env.MYSQLPORT),
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
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
