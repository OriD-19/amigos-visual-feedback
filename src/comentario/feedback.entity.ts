import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Image } from './image.entity';
import { Comentario } from './comentario.entity';
import { ModerationHistory } from '../moderation-history/moderation-history.entity';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  imageId: number | null;

  @Column()
  comentarioId: number;

  @ManyToOne(() => Image, { eager: true })
  @JoinColumn({ name: 'imageId' })
  image: Image;

  @ManyToOne(() => Comentario, { eager: true })
  @JoinColumn({ name: 'comentarioId' })
  comentario: Comentario;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ModerationHistory, (history) => history.feedback)
  moderationHistory: ModerationHistory[];
} 