import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductStore } from "./product-store.entity";

@Entity()
export class Product{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    price: number;

    @OneToMany(() => ProductStore, (productStore) => productStore.product)
    productStores: ProductStore[];
}