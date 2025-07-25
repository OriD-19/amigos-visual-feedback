import { ProductStore } from "../../products/products.entity/product-store.entity";
import { User } from "../../users/entities/user.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class Store {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    direction: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => ProductStore, (productStore) => productStore.store)
    productStores: ProductStore[];

    @OneToOne(() => User, user => user.store, { nullable: true })
    manager: User;

    @Column()
    managerId: number;
}
