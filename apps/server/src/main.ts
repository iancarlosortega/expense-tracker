import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
	const port = process.env.PORT;
	if (!port) {
		throw new Error('PORT is not defined');
	}

	const app = await NestFactory.create(AppModule);
	const logger = new Logger('Bootstrap');
	app.enableCors();
	app.setGlobalPrefix('api');
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);

	await app.listen(port);
	logger.log(`Application is running on: ${port}`);
}
bootstrap();
