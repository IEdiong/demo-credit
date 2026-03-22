import knex from 'knex';
import type { Knex } from 'knex';

const environment = process.env.NODE_ENV || 'development';

const config: { [key: string]: Knex.Config } = require('./knexfile');

const db = knex(config[environment]);

export default db;
