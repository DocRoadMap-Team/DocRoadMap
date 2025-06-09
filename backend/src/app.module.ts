import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProcessModule } from './process/process.module';
import { StepsModule } from './steps/steps.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { ListAdministrativeProcessModule } from './list_administrative_process/list_administrative_process.module';
import { AiHistoryModule } from './ai_history/ai_history.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'postgres',
      entities: ['dist/**/.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UsersModule,
    ProcessModule,
    StepsModule,
    AuthModule,
    AiModule,
    ListAdministrativeProcessModule,
    AiHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
