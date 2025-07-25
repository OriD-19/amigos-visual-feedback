import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ImageLabel } from './image-label.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @OneToMany(() => ImageLabel, label => label.image)
  labels: ImageLabel[];
} 