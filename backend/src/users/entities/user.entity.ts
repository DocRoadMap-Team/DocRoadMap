import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Process } from '../../process/entities/process.entity';
import { AiHistory } from '../../ai_history/entities/ai_history.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'uuid', unique: true })
    uuid: string = uuidv4();

    @Column('text')
    firstName: string;

    @Column('text')
    lastName: string;

    @Column('text')
    email: string;

    @Column('boolean', { default: false })
    isActive: boolean;

    @Column('text')
    password: string

    @CreateDateColumn()
    createdAt: Date;

    @Column('timestamp', {nullable: true})
    latestLogin: Date;

    @OneToMany(() => Process, process => process.user)
    processes: Process[];

    @OneToMany(() => AiHistory, aiHistory => aiHistory.user)
    aiHistories: AiHistory[];
}
