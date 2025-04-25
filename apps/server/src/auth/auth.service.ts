import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { User, UserInsert } from '@/drizzle/schema/users';
import { UsersService } from '@/users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
	private logger = new Logger(AuthService.name);

	constructor(
		private userService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateGoogleToken(token: string): Promise<User> {
		try {
			// Verify the token with Google
			const response = await axios.get(
				'https://www.googleapis.com/oauth2/v3/userinfo',
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			const { sub, email, name } = response.data;

			if (!email) {
				throw new UnauthorizedException('Email not provided by Google');
			}

			// Find or create user
			let user = await this.userService.findByProviderId(sub);

			if (!user) {
				// Try to find by email
				user = await this.userService.findByEmail(email);

				if (user) {
					// Update existing user with Google ID
					user = await this.userService.update(user.id, {
						providerId: sub,
						provider: user.provider || 'google',
					});
				} else {
					// Create new user
					user = await this.userService.create({
						email,
						name,
						providerId: sub,
						provider: 'google',
					});
				}
			}

			return user;
		} catch (error) {
			this.logger.error('Error validating Google token', error);
			throw new UnauthorizedException('Invalid Google token');
		}
	}

	async validateGithubToken(token: string): Promise<User> {
		try {
			// Get user info from GitHub
			const userResponse = await axios.get('https://api.github.com/user', {
				headers: { Authorization: `token ${token}` },
			});

			// GitHub doesn't always return email in user endpoint, so we need a separate call
			const emailsResponse = await axios.get(
				'https://api.github.com/user/emails',
				{
					headers: { Authorization: `token ${token}` },
				},
			);

			const primaryEmail = emailsResponse.data.find(
				(email) => email.primary,
			)?.email;
			if (!primaryEmail) {
				throw new UnauthorizedException('Email not provided by GitHub');
			}

			const { id, login, name } = userResponse.data;

			// Find or create user
			let user = await this.userService.findByProviderId(id.toString());

			if (!user) {
				// Try to find by email
				user = await this.userService.findByEmail(primaryEmail);

				if (user) {
					// Update existing user with GitHub ID
					user = await this.userService.update(user.id, {
						providerId: id.toString(),
						provider: user.provider || 'github',
					});
				} else {
					// Create new user
					user = await this.userService.create({
						email: primaryEmail,
						name: name || login,
						providerId: id.toString(),
						provider: 'github',
					});
				}
			}

			return user;
		} catch (error) {
			this.logger.error('Error validating GitHub token', error);
			throw new UnauthorizedException('Invalid GitHub token');
		}
	}

	generateJwt(user: User) {
		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
			name: user.name,
			provider: user.provider,
		};

		return this.jwtService.sign(payload);
	}
}
