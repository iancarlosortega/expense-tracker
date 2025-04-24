import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Get('google')
	@UseGuards(AuthGuard('google'))
	googleAuth() {}

	@Get('google/callback')
	@UseGuards(AuthGuard('google'))
	googleAuthCallback(@Req() req: Request) {
		if (!req.user) {
			throw new Error('User information is missing');
		}
		const token = this.authService.generateJwt(
			req.user as {
				id: number;
				provider: string;
				providerId: string;
				email: string | null;
				name: string | null;
				createdAt: Date;
			},
		);
		return {
			token,
		};
	}

	// GitHub Auth
	@Get('github')
	@UseGuards(AuthGuard('github'))
	githubAuth() {}

	@Get('github/callback')
	@UseGuards(AuthGuard('github'))
	githubAuthCallback(@Req() req: Request) {
		if (!req.user) {
			throw new Error('User information is missing');
		}
		const token = this.authService.generateJwt(
			req.user as {
				id: number;
				provider: string;
				providerId: string;
				email: string | null;
				name: string | null;
				createdAt: Date;
			},
		);
		return {
			token,
		};
	}

	@Get('profile')
	@UseGuards(AuthGuard('jwt'))
	getProfile(@Req() req: Request) {
		return req.user;
	}
}
