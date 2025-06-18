import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { seedListAdministrativeProcess } from './database/seed-list-administrative-process';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
  });

  app.setBaseViewsDir(join(__dirname, '..', 'templates'));
  app.setViewEngine('hbs');

  app.useStaticAssets(join(__dirname, '..', 'assets'));

  const config = new DocumentBuilder()
    .setTitle('DocRoadMap API')
    .setDescription('The DocRoadMap API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const dataSource = app.get<DataSource>(getDataSourceToken());
  await seedListAdministrativeProcess(dataSource);

  await app.listen(process.env.PORT ?? 8082);
}
bootstrap();
