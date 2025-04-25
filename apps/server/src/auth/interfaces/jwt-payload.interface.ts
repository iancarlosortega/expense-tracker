export interface JwtPayload {
	sub: number;
	email: string | null;
	name: string | null;
	provider: string;
}
