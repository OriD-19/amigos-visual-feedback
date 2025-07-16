import { ProductStore } from "src/products/products.entity/product-store.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Store {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    direction: string;

    @OneToMany(() => ProductStore, (productStore) => productStore.store)
    productStores: ProductStore[];
}
