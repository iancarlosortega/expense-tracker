import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('google')
	async googleLogin(@Body() body: { token: string }) {
		const user = await this.authService.validateGoogleToken(body.token);
		const jwt = this.authService.generateJwt(user);

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				provider: user.provider,
			},
			token: jwt,
		};
	}

	@Post('github')
	async githubLogin(@Body() body: { token: string }) {
		const user = await this.authService.validateGithubToken(body.token);
		const jwt = this.authService.generateJwt(user);

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				provider: user.provider,
			},
			token: jwt,
		};
	}

	@Get('profile')
	@UseGuards(AuthGuard('jwt'))
	getProfile(@Req() req) {
		return req.user;
	}
}
