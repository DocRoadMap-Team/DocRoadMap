import { Test, TestingModule } from '@nestjs/testing';
import { AiHistoryController } from './ai_history.controller';
import { AiHistoryService } from './ai_history.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiHistory } from './entities/ai_history.entity';
import { User } from '../users/entities/user.entity';
import { Process } from '../process/entities/process.entity';
import { NotFoundException } from '@nestjs/common';
import { AiHistoryResponseDto } from './dto/ai_history.response.dto';

const mockAiHistoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    appendToHistory: jest.fn(),
    findByUuid: jest.fn(),
};

const mockUserRepo = {
    findOne: jest.fn(),
};

const mockProcessRepo = {
    findOne: jest.fn(),
};

describe('AiHistoryController', () => {
    let controller: AiHistoryController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AiHistoryController],
            providers: [
                { provide: AiHistoryService, useValue: mockAiHistoryService },
                { provide: getRepositoryToken(User), useValue: mockUserRepo },
                { provide: getRepositoryToken(Process), useValue: mockProcessRepo },
            ],
        }).compile();

        controller = module.get<AiHistoryController>(AiHistoryController);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create ai history', async () => {
            const dto = { userId: 1, history: 'User: hi AI: hello' };
            const aiHistory = { id: 1, ...dto };
            mockAiHistoryService.create.mockResolvedValue(aiHistory);
            const result = await controller.create(dto as any);
            expect(mockAiHistoryService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(aiHistory);
        });
    });

    describe('findAll', () => {
        it('should return all ai histories', async () => {
            const histories = [{ id: 1 }, { id: 2 }];
            mockAiHistoryService.findAll.mockResolvedValue(histories);
            const result = await controller.findAll();
            expect(mockAiHistoryService.findAll).toHaveBeenCalled();
            expect(result).toEqual(histories);
        });
    });

    describe('findOne', () => {
        it('should return ai history for user', async () => {
            const history = { id: 1 } as AiHistory;
            mockAiHistoryService.findOne.mockResolvedValue(history);
            const result = await controller.findOne('1');
            expect(mockAiHistoryService.findOne).toHaveBeenCalledWith(1);
            expect(result).toEqual(history);
        });

        it('should throw if not found', async () => {
            mockAiHistoryService.findOne.mockRejectedValue(new NotFoundException());
            await expect(controller.findOne('2')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update ai history', async () => {
            const updated = { id: 1, history: 'new' };
            mockAiHistoryService.update.mockResolvedValue(updated);
            const result = await controller.update('1', { history: 'new' } as any);
            expect(mockAiHistoryService.update).toHaveBeenCalledWith(1, { history: 'new' });
            expect(result).toEqual(updated);
        });
    });

    describe('remove', () => {
        it('should remove ai history', async () => {
            mockAiHistoryService.remove.mockResolvedValue(undefined);
            const result = await controller.remove('1');
            expect(mockAiHistoryService.remove).toHaveBeenCalledWith(1);
            expect(result).toBeUndefined();
        });
    });

    describe('appendToHistory', () => {
        it('should append to ai history', async () => {
            const dto = { userId: 1, history: 'User: hi AI: hello' };
            const aiHistory = { id: 1, ...dto };
            mockAiHistoryService.appendToHistory.mockResolvedValue(aiHistory);
            const result = await controller.appendToHistory(dto as any);
            expect(mockAiHistoryService.appendToHistory).toHaveBeenCalledWith(dto);
            expect(result).toEqual(aiHistory);
        });
    });

    describe('getDonnaHistory', () => {
        it('should return user chat history', async () => {
            const req = { user: { sub: 1 } };
            const user = { id: 1, uuid: 'user-uuid' };
            const history: AiHistoryResponseDto[] = [
                { message: 'Hello', response: 'Hi!' },
            ];
            mockUserRepo.findOne.mockResolvedValue(user);
            mockAiHistoryService.findByUuid.mockResolvedValue(history);

            const result = await controller.getDonnaHistory(req);
            expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockAiHistoryService.findByUuid).toHaveBeenCalledWith('user-uuid');
            expect(result).toEqual(history);
        });

        it('should throw if user not found', async () => {
            const req = { user: { sub: 1 } };
            mockUserRepo.findOne.mockResolvedValue(null);
            await expect(controller.getDonnaHistory(req)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getRoadmapHistory', () => {
        it('should return process chat history', async () => {
            const process = { id: 2, uuid: 'process-uuid' };
            const history: AiHistoryResponseDto[] = [
                { message: 'Step?', response: 'Add step.' },
            ];
            mockProcessRepo.findOne.mockResolvedValue(process);
            mockAiHistoryService.findByUuid.mockResolvedValue(history);

            const result = await controller.getRoadmapHistory(2);
            expect(mockProcessRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(mockAiHistoryService.findByUuid).toHaveBeenCalledWith('process-uuid');
            expect(result).toEqual(history);
        });

        it('should throw if process not found', async () => {
            mockProcessRepo.findOne.mockResolvedValue(null);
            await expect(controller.getRoadmapHistory(2)).rejects.toThrow(NotFoundException);
        });
    });
});