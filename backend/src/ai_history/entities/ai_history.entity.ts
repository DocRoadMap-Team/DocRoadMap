import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class AiHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    history: string;

    @Column({ type: 'uuid' })
    uuid: string;

    @ManyToOne(() => User, user => user.aiHistories)
    user: User;
}
