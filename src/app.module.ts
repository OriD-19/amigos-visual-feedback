import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheConfigService } from './cache/cache.service';
import { ProductsModule } from './products/products.module';
import { StoresModule } from './stores/stores.module';
import "dotenv/config"
import { ComentarioModule } from './comentario/comentario.module';
import { EtiquetaAutomática } from './etiqueta-automática/etiqueta-automática.entity';
import { EtiquetaAutomáticaModule } from './etiqueta-automática/etiqueta-automática.module';
import { ChatGptService } from './chatgpt/chatgpt.service';
import { VisionModule } from './vision/vision.module';
import { ReportModule } from './reports/report.module';
import { ModerationHistoryModule } from './moderation-history/moderation-history.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(
            process.env.NODE_ENV === 'test'
                ? {
                    type: 'sqlite',
                    database: ':memory:',
                    autoLoadEntities: true,
                    synchronize: true,
                }
                : {
                    type: 'postgres',
                    host: process.env.DB_HOST || 'localhost',
                    port: parseInt(process.env.DB_PORT!) || 5432,
                    username: process.env.DB_USER || 'postgres',
                    password: process.env.DB_PASSWORD || '1234',
                    database: process.env.DB_NAME || 'apiamigos',
                    autoLoadEntities: true,
                    synchronize: true,
                }
        ),
        AuthModule,
        CacheModule.registerAsync({
            useClass: CacheConfigService,
            isGlobal: true,
        }),
        ProductsModule,
        StoresModule,
        ComentarioModule,
        EtiquetaAutomáticaModule,
        VisionModule,
        ReportModule,
        ModerationHistoryModule,
    ],
    controllers: [AppController],
    providers: [AppService, ChatGptService],
})
export class AppModule { }
