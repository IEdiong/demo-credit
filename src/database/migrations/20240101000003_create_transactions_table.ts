import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.binary('id', 16).primary();
    table.binary('wallet_id', 16).notNullable();
    table.enum('type', ['credit', 'debit']).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('reference', 100).notNullable().index();
    table.string('description', 255).nullable();
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());

    table
      .foreign('wallet_id')
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
}
