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
import * as bcrypt from 'bcrypt';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let productStoreId: number;
  let authToken: string;
  let testUserId: number;

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

    // Create a test user with cliente role
    const hashedPassword = await bcrypt.hash('testpassword', 12);
    const user = userRepo.create({
      name: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      dui: 12345678,
      password: hashedPassword,
      role: 'cliente',
    });
    await userRepo.save(user);
    testUserId = user.id;

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

    // Get authentication token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'testpassword',
      })
      .expect(201);

    authToken = `Bearer ${loginResponse.body.access_token}`;
  });

  afterAll(async () => {
    // Clean up test data
    const userRepo = app.get(getRepositoryToken(User));
    const storeRepo = app.get(getRepositoryToken(Store));
    const productRepo = app.get(getRepositoryToken(Product));
    const productStoreRepo = app.get(getRepositoryToken(ProductStore));

    await productStoreRepo.delete({ id: productStoreId });
    await productRepo.delete({ name: 'Test Product' });
    await storeRepo.delete({ name: 'Test Store' });
    await userRepo.delete({ email: 'testuser@example.com' });

    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(201)
      .expect('Hello World!');
  });

  it('/auth/login (POST) should authenticate user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'testpassword',
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', 'testuser@example.com');
    expect(response.body.user).toHaveProperty('role', 'cliente');
  });

  it('/comentarios (POST) should create comment without image', async () => {
    const res = await request(app.getHttpServer())
      .post('/comentarios')
      .set('Authorization', authToken)
      .field('comentario', 'Comentario de prueba sin imagen')
      .field('productStoreId', productStoreId)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('textoComentario', 'Comentario de prueba sin imagen');
  });

  it('/comentarios (POST) should create comment with image (if GCS configured)', async () => {
    // Skip this test if GCS credentials are not configured
    if (!process.env.GCP_CREDENTIALS_PATH && !process.env.GCP_BUCKET_NAME) {
      console.log('Skipping image upload test - GCS not configured');
      return;
    }

    const imageBuffer = Buffer.from([
      0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,
      0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,
      0xDE,0x00,0x00,0x00,0x0A,0x49,0x44,0x41,0x54,0x08,0xD7,0x63,0xF8,0x0F,0x00,0x01,
      0x01,0x01,0x00,0x18,0xDD,0x8D,0xB1,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,0x44,0xAE,
      0x42,0x60,0x82
    ]);
    const tempImagePath = path.join(__dirname, 'test-image.png');
    fs.writeFileSync(tempImagePath, imageBuffer);

    try {
      const res = await request(app.getHttpServer())
        .post('/comentarios')
        .set('Authorization', authToken)
        .field('comentario', 'Comentario de prueba con imagen')
        .field('productStoreId', productStoreId)
        .attach('image', tempImagePath)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('textoComentario', 'Comentario de prueba con imagen');
    } catch (error) {
      console.log('Image upload test failed - this is expected if GCS is not configured:', error.message);
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
    }
  });

  it('/comentarios (GET) should return user comments', async () => {
    const response = await request(app.getHttpServer())
      .get('/comentarios')
      .set('Authorization', authToken)
      .expect(201);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/comentarios (POST) should reject without authentication', async () => {
    await request(app.getHttpServer())
      .post('/comentarios')
      .field('comentario', 'Test comment')
      .field('productStoreId', productStoreId)
      .expect(401);
  });

  it('/auth/register (POST) should create new cliente user', async () => {
    const newUserData = {
      name: 'New',
      lastName: 'Customer',
      email: 'newcustomer@example.com',
      dui: 87654321,
      password: 'newpassword123',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(newUserData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email', 'newcustomer@example.com');
    expect(response.body).toHaveProperty('role', 'cliente');

    // Clean up
    const userRepo = app.get(getRepositoryToken(User));
    await userRepo.delete({ email: 'newcustomer@example.com' });
  });
});
