import { EtiquetaAutomática } from '../etiqueta-automática/etiqueta-automática.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductStore } from '../products/products.entity/product-store.entity';

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
  etiquetaAutomatica: EtiquetaAutomática;

  @ManyToOne(() => ProductStore, { eager: true })
  productStore: ProductStore;
}
