import { calculateGoalProgress } from '../../src/lib/utils/progress';

describe('Goal Progress Calculation', () => {
    it('should return 0 when there are no tasks', () => {
        expect(calculateGoalProgress([])).toBe(0);
    });

    it('should return 0 when no tasks are DONE', () => {
        const tasks = [
            { status: 'BACKLOG' },
            { status: 'IN_PROGRESS' }
        ];
        expect(calculateGoalProgress(tasks)).toBe(0);
    });

    it('should return 100 when all tasks are DONE', () => {
        const tasks = [
            { status: 'DONE' },
            { status: 'DONE' }
        ];
        expect(calculateGoalProgress(tasks)).toBe(100);
    });

    it('should calculate the correct percentage (50%)', () => {
        const tasks = [
            { status: 'DONE' },
            { status: 'IN_PROGRESS' }
        ];
        expect(calculateGoalProgress(tasks)).toBe(50);
    });

    it('should round to the nearest whole number (33%)', () => {
        const tasks = [
            { status: 'DONE' },
            { status: 'BACKLOG' },
            { status: 'IN_PROGRESS' }
        ];
        expect(calculateGoalProgress(tasks)).toBe(33); // 1/3 ~ 33.333
    });
});
