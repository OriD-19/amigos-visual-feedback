
import { Store } from "../../stores/store.entity/store.entity";
import { Column, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column()
    dui: number;

    @Column()
    password: string;

    @Column({ default: 'cliente' })
    role: string;

    // Para el rol de manager - ID de la sucursal que maneja
    @OneToOne(() => Store, { nullable: true })
    @JoinColumn({ name: 'sucursalId' })
    store: Store;

    @Column({ nullable: true })
    storeId: number;
}
