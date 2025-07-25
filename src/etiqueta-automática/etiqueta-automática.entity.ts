import { Comentario } from '../comentario/comentario.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EtiquetaAutomática {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToMany(() => Comentario, (comentario) => comentario.etiquetaAutomatica)
  comentarios: Comentario[];
}
