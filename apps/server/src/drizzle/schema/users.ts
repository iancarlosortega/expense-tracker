import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	provider: text('provider').notNull(),
	providerId: text('provider_id').notNull().unique(),
	email: text('email').unique(),
	name: text('name'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
