import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		private authService: AuthService,
		configService: ConfigService,
	) {
		super({
			clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
			clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
			callbackURL:
				configService.get<string>('GOOGLE_CALLBACK_URL') ||
				'http://localhost:3000/auth/google/callback',
			scope: ['email', 'profile'],
		});
	}

	async validate(profile: any, done: VerifyCallback): Promise<any> {
		try {
			const user = await this.authService.validateOAuthUser(profile);
			done(null, user);
		} catch (err) {
			done(err, false);
		}
	}
}
