import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Image } from './image.entity';

@Entity()
export class ImageLabel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @ManyToOne(() => Image, image => image.labels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'imageId' })
  image: Image;
} 