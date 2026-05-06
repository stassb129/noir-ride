import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 Database: ${process.env.DB_DATABASE}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`🌍 Frontend: ${process.env.FRONTEND_URL}\n`);
}
bootstrap();
