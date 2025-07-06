// src/cache/cache.service.ts
import { Injectable } from '@nestjs/common';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
    createCacheOptions(): CacheModuleOptions {
        const keyv = new Keyv({
            store: new KeyvRedis('redis://localhost:6379'),
            ttl: 10 * 1000, // 10 seconds in milliseconds
        });

        return {
            store: keyv,
            isGlobal: true,
        };
    }
}
