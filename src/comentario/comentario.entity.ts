import { EtiquetaAutomática } from '../etiqueta-automática/etiqueta-automática.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ProductStore } from '../products/products.entity/product-store.entity';
import { User } from '../users/entities/user.entity';

@Entity()
export class Comentario {
  @PrimaryGeneratedColumn()
  id: number;

  //   @Column() //para mientras jovenes
  //   feedback: number;

  @Column()
  textoComentario: string;

  @Column()
  sentimientoComentario: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => EtiquetaAutomática, (etiqueta) => etiqueta.comentarios, {
    eager: true,
  })
  @JoinColumn({ name: 'etiquetaAutomaticaId' })
  etiquetaAutomatica: EtiquetaAutomática;

  @Column({ nullable: false })
  etiquetaAutomaticaId: number;

  @ManyToOne(() => ProductStore, { eager: true })
  @JoinColumn({ name: 'productStoreId' })
  productStore: ProductStore;

  @Column({ nullable: false })
  productStoreId: number;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  userId: number;
}
