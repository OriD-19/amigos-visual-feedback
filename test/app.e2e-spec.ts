import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import * as fs from 'fs';
import * as path from 'path';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Store } from '../src/stores/store.entity/store.entity';
import { Product } from '../src/products/products.entity/products.entity';
import { ProductStore } from '../src/products/products.entity/product-store.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let productStoreId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const userRepo = app.get(getRepositoryToken(User));
    const storeRepo = app.get(getRepositoryToken(Store));
    const productRepo = app.get(getRepositoryToken(Product));
    const productStoreRepo = app.get(getRepositoryToken(ProductStore));

    const user = userRepo.create({
      name: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      dui: 12345678,
      password: 'testpassword',
      role: 'cliente',
    });
    await userRepo.save(user);

    const store = storeRepo.create({
      name: 'Test Store',
      direction: 'Test Address',
      managerId: user.id,
    });
    await storeRepo.save(store);

    const product = productRepo.create({
      name: 'Test Product',
      price: 10.5,
    });
    await productRepo.save(product);

    const productStore = productStoreRepo.create({
      product_id: product.id,
      store_id: store.id,
      stock: 100,
      added_date: new Date(),
    });
    await productStoreRepo.save(productStore);
    productStoreId = productStore.id;
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/comentarios (POST) subir comentario con imagen', async () => {
    const token = 'Bearer test-token'; 

    const imageBuffer = Buffer.from([
      0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,
      0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,
      0xDE,0x00,0x00,0x00,0x0A,0x49,0x44,0x41,0x54,0x08,0xD7,0x63,0xF8,0x0F,0x00,0x01,
      0x01,0x01,0x00,0x18,0xDD,0x8D,0xB1,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,0x44,0xAE,
      0x42,0x60,0x82
    ]);
    const tempImagePath = path.join(__dirname, 'test-image.png');
    fs.writeFileSync(tempImagePath, imageBuffer);

    const res = await request(app.getHttpServer())
      .post('/comentarios')
      .set('Authorization', token)
      .field('comentario', 'Comentario de prueba con imagen')
      .field('productStoreId', productStoreId)
      .attach('image', tempImagePath)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('textoComentario', 'Comentario de prueba con imagen');
    fs.unlinkSync(tempImagePath);
  });
});
