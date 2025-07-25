import { Product } from './products.entity';

describe('ProductsEntity', () => {
  it('should be defined', () => {
    expect(new Product()).toBeDefined();
  });
});
