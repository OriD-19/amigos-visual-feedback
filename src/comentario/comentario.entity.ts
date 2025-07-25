import { EtiquetaAutomática } from 'src/etiqueta-automática/etiqueta-automática.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductStore } from 'src/products/products.entity/product-store.entity';

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

  @ManyToOne(() => EtiquetaAutomática, (etiqueta) => etiqueta.comentarios, {
    eager: true,
  })
  etiquetaAutomatica: EtiquetaAutomática;

  @ManyToOne(() => ProductStore, { eager: true })
  productStore: ProductStore;
}
