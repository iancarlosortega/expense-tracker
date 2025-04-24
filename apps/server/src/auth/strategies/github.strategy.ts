import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
	constructor(
		private authService: AuthService,
		configService: ConfigService,
	) {
		super({
			clientID: configService.get<string>('GITHUB_CLIENT_ID') || '',
			clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || '',
			callbackURL:
				configService.get<string>('GITHUB_CALLBACK_URL') ||
				'http://localhost:3000/auth/github/callback',
			scope: ['user:email'],
		});
	}

	async validate(profile: any, done: any): Promise<any> {
		try {
			const user = await this.authService.validateOAuthUser(profile);
			done(null, user);
		} catch (err) {
			done(err, false);
		}
	}
}
