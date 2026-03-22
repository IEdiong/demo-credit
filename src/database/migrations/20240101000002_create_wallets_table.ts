import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('wallets', (table) => {
    table.binary('id', 16).primary();
    table.binary('user_id', 16).notNullable().unique();
    table.decimal('balance', 15, 2).notNullable().defaultTo(0.0);
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());

    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('wallets');
}
