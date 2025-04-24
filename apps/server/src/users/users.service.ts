import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@/drizzle/drizzle.module';
import { DrizzleDB } from '@/drizzle/types/drizzle';
import { User, UserInsert, users } from '@/drizzle/schema/users';

@Injectable()
export class UsersService {
	constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

	async findByEmail(email: string): Promise<User | undefined> {
		return this.db.query.users.findFirst({
			where: (users, { eq }) => eq(users.email, email),
		});
	}

	async findByProviderId(providerId: string): Promise<User | undefined> {
		return this.db.query.users.findFirst({
			where: (users, { eq }) => eq(users.providerId, providerId),
		});
	}

	async create(userData: UserInsert): Promise<User> {
		const [newUser] = await this.db.insert(users).values(userData).returning();
		return newUser;
	}

	async update(id: number, userData: Partial<UserInsert>): Promise<User> {
		const [updatedUser] = await this.db
			.update(users)
			.set(userData)
			.where(eq(users.id, id))
			.returning();
		return updatedUser;
	}
}
