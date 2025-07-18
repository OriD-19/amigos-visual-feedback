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

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: parseInt(process.env.DB_PORT!) ?? 5432,
            username: process.env.DB_USER ?? 'postgres',
            password: process.env.DB_PASSWORD ?? '1234',
            database: process.env.DB_NAME ?? 'apiamigos',
            autoLoadEntities: true,
            synchronize: true,
        }),
        AuthModule,
        CacheModule.registerAsync({
            useClass: CacheConfigService,
            isGlobal: true,
        }),
        ProductsModule,
        StoresModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
