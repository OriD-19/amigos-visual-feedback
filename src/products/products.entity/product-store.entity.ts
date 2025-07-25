import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./products.entity";
import { Store } from "../../stores/store.entity/store.entity";

@Entity('product_store')
export class ProductStore {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    product_id: number;

    @Column()
    store_id: number;

    /**para el stock */
    @Column({nullable: true})
    stock: number;

    @CreateDateColumn()
    added_date: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Product, (product) => product.productStores)
    @JoinColumn({name: 'product_id'})
    product: Product;

    @ManyToOne(() => Store, (store) => store.productStores)
    @JoinColumn({name: 'store_id'})
    store: Store;
}