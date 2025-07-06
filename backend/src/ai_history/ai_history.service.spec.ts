import { NotFoundException } from '@nestjs/common';
import { AiHistoryService } from './ai_history.service';
import { Repository } from 'typeorm';
import { AiHistory } from './entities/ai_history.entity';
import { User } from '../users/entities/user.entity';

jest.mock('typeorm', () => {
    const actual = jest.requireActual('typeorm');
    return {
        ...actual,
        Repository: jest.fn().mockImplementation(() => ({
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
        })),
    };
});

const mockAiHistoryRepo = () => ({
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
});
const mockUserRepo = () => ({
    findOneBy: jest.fn(),
});

describe('AiHistoryService', () => {
    let service: AiHistoryService;
    let aiHistoryRepo: ReturnType<typeof mockAiHistoryRepo>;
    let userRepo: ReturnType<typeof mockUserRepo>;

    beforeEach(() => {
        aiHistoryRepo = mockAiHistoryRepo();
        userRepo = mockUserRepo();
        service = new AiHistoryService(
            aiHistoryRepo as any as Repository<AiHistory>,
            userRepo as any as Repository<User>
        );
    });

    describe('create', () => {
        it('should create and save ai history if user exists', async () => {
            const dto = { userId: 1, history: 'User: hi AI: hello' };
            const user = { id: 1 } as User;
            const aiHistory = { history: dto.history, user } as AiHistory;
            userRepo.findOneBy.mockResolvedValue(user);
            aiHistoryRepo.create.mockReturnValue(aiHistory);
            aiHistoryRepo.save.mockResolvedValue(aiHistory);

            const result = await service.create(dto as any);
            expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: dto.userId });
            expect(aiHistoryRepo.create).toHaveBeenCalledWith({ history: dto.history, user });
            expect(aiHistoryRepo.save).toHaveBeenCalledWith(aiHistory);
            expect(result).toBe(aiHistory);
        });

        it('should throw NotFoundException if user does not exist', async () => {
            userRepo.findOneBy.mockResolvedValue(null);
            await expect(service.create({ userId: 2, history: 'test' } as any)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return all ai histories', async () => {
            const histories = [{}, {}] as AiHistory[];
            aiHistoryRepo.find.mockResolvedValue(histories);
            const result = await service.findAll();
            expect(aiHistoryRepo.find).toHaveBeenCalledWith({ relations: ['user'] });
            expect(result).toBe(histories);
        });
    });

    describe('findOne', () => {
        it('should return ai history for user', async () => {
            const history = { id: 1 } as AiHistory;
            aiHistoryRepo.findOne.mockResolvedValue(history);
            const result = await service.findOne(1);
            expect(aiHistoryRepo.findOne).toHaveBeenCalledWith({
                where: { user: { id: 1 } },
                relations: ['user'],
            });
            expect(result).toBe(history);
        });

        it('should throw NotFoundException if not found', async () => {
            aiHistoryRepo.findOne.mockResolvedValue(null);
            await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByUuid', () => {
        it('should return mapped ai histories by uuid', async () => {
            const histories = [
                { history: 'User: hi AI: hello', uuid: 'abc', id: 1 },
                { history: 'User: bye AI: goodbye', uuid: 'abc', id: 2 },
            ] as any[];
            aiHistoryRepo.find.mockResolvedValue(histories);
            const result = await service.findByUuid('abc');
            expect(aiHistoryRepo.find).toHaveBeenCalledWith({
                where: { uuid: 'abc' },
                order: { id: 'ASC' },
            });
            expect(result).toEqual([
                { message: 'hi', response: 'hello' },
                { message: 'bye', response: 'goodbye' },
            ]);
        });

        it('should handle malformed history', async () => {
            const histories = [
                { history: 'Just a message', uuid: 'def', id: 3 },
            ] as any[];
            aiHistoryRepo.find.mockResolvedValue(histories);
            const result = await service.findByUuid('def');
            expect(result).toEqual([{ message: 'Just a message', response: '' }]);
        });
    });

    describe('update', () => {
        it('should update history and user', async () => {
            const oldHistory = { id: 1, history: 'old', user: { id: 1 } } as any;
            const newUser = { id: 2 } as User;
            jest.spyOn(service, 'findOne').mockResolvedValue(oldHistory);
            userRepo.findOneBy.mockResolvedValue(newUser);
            aiHistoryRepo.save.mockResolvedValue({ ...oldHistory, history: 'new', user: newUser });

            const result = await service.update(1, { history: 'new', userId: 2 } as any);
            expect(service.findOne).toHaveBeenCalledWith(1);
            expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: 2 });
            expect(aiHistoryRepo.save).toHaveBeenCalledWith({ ...oldHistory, history: 'new', user: newUser });
            expect(result).toEqual({ ...oldHistory, history: 'new', user: newUser });
        });

        it('should throw NotFoundException if new user not found', async () => {
            const oldHistory = { id: 1, history: 'old', user: { id: 1 } } as any;
            jest.spyOn(service, 'findOne').mockResolvedValue(oldHistory);
            userRepo.findOneBy.mockResolvedValue(null);

            await expect(service.update(1, { userId: 3 } as any)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete ai history if found', async () => {
            aiHistoryRepo.findOne.mockResolvedValue({ id: 1 });
            aiHistoryRepo.delete.mockResolvedValue(undefined);
            await service.remove(1);
            expect(aiHistoryRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(aiHistoryRepo.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if not found', async () => {
            aiHistoryRepo.findOne.mockResolvedValue(null);
            await expect(service.remove(2)).rejects.toThrow(NotFoundException);
        });
    });

    describe('appendToHistory', () => {
        it('should create new history if none exists', async () => {
            const dto = { userId: 1, history: 'User: hi AI: hello' };
            const user = { id: 1 } as User;
            const aiHistory = { history: dto.history, user } as AiHistory;
            userRepo.findOneBy.mockResolvedValue(user);
            aiHistoryRepo.findOne.mockResolvedValue(null);
            aiHistoryRepo.create.mockReturnValue(aiHistory);
            aiHistoryRepo.save.mockResolvedValue(aiHistory);

            const result = await service.appendToHistory(dto as any);
            expect(aiHistoryRepo.create).toHaveBeenCalledWith({ history: dto.history, user });
            expect(aiHistoryRepo.save).toHaveBeenCalledWith(aiHistory);
            expect(result).toBe(aiHistory);
        });

        it('should append to existing history', async () => {
            const dto = { userId: 1, history: 'User: hi AI: hello' };
            const user = { id: 1 } as User;
            const existing = { history: 'old', user } as any;
            userRepo.findOneBy.mockResolvedValue(user);
            aiHistoryRepo.findOne.mockResolvedValue(existing);
            aiHistoryRepo.save.mockResolvedValue({ ...existing, history: 'old\nUser: hi AI: hello' });

            const result = await service.appendToHistory(dto as any);
            expect(existing.history).toBe('old\nUser: hi AI: hello');
            expect(aiHistoryRepo.save).toHaveBeenCalledWith(existing);
            expect(result).toEqual({ ...existing, history: 'old\nUser: hi AI: hello' });
        });

        it('should throw NotFoundException if user not found', async () => {
            userRepo.findOneBy.mockResolvedValue(null);
            await expect(service.appendToHistory({ userId: 2, history: 'test' } as any)).rejects.toThrow(NotFoundException);
        });
    });
});