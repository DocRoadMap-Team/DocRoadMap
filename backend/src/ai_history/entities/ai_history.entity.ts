import { User } from "../../users/entities/user.entity";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class AiHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    history: string

    @ManyToOne(() => User, user => user.aiHistories)
    user: User;
}
