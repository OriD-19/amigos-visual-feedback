import { ProductStore } from "../../products/products.entity/product-store.entity";
import { User } from "../../users/entities/user.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @OneToOne(() => User, user => user.store, { nullable: true })
    manager: User;

    @Column()
    managerId: number;
}
