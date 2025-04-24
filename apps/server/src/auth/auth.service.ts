import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserInsert } from '@/drizzle/schema/users';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
	constructor(
		private userService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateOAuthUser(profile: any): Promise<User> {
		const email = profile.emails?.[0]?.value;
		if (!email) {
			throw new Error('Email not provided by OAuth provider');
		}

		// Check if user already exists
		let user: User | undefined;

		user = await this.userService.findByProviderId(profile.id);

		// If not found by provider ID, try to find by email
		if (!user) {
			user = await this.userService.findByEmail(email);
		}

		// If user exists but doesn't have this provider ID, update the user
		if (user) {
			user = await this.userService.update(user.id, {
				providerId: profile.id,
			});
		} else {
			// Create a new user if none exists
			const newUser: UserInsert = {
				email,
				name: profile.displayName || email.split('@')[0],
				provider: profile.provider,
				providerId: profile.id,
			};

			user = await this.userService.create(newUser);
		}

		return user;
	}

	generateJwt(user: User) {
		const payload = {
			sub: user.id,
			email: user.email,
			name: user.name,
			provider: user.provider,
		};

		return this.jwtService.sign(payload);
	}
}
