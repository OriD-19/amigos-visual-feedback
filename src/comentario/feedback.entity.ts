import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Image } from './image.entity';
import { Comentario } from './comentario.entity';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageId: number;

  @Column()
  comentarioId: number;

  @ManyToOne(() => Image, { eager: true })
  @JoinColumn({ name: 'imageId' })
  image: Image;

  @ManyToOne(() => Comentario, { eager: true })
  @JoinColumn({ name: 'comentarioId' })
  comentario: Comentario;
} 