import { render, screen, waitFor } from '@testing-library/react';
import { KanbanBoard } from '../../src/components/KanbanBoard';

// Mock the Next.js fetch API calls
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
            {
                id: 'task-1',
                title: 'Test Task 1',
                description: 'Testing description',
                status: 'BACKLOG',
                labels: ['test'],
                deadline: '2026-03-10'
            },
            {
                id: 'task-2',
                title: 'Test In Progress Task',
                status: 'IN_PROGRESS',
            }
        ]),
    })
) as jest.Mock;

describe('KanbanBoard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        render(<KanbanBoard />);
        expect(screen.getByText('Loading board...')).toBeInTheDocument();
    });

    it('fetches and displays tasks in correct columns', async () => {
        render(<KanbanBoard />);

        // Wait for the tasks to be fetched and rendered
        await waitFor(() => {
            expect(screen.getByText('Test Task 1')).toBeInTheDocument();
            expect(screen.getByText('Test In Progress Task')).toBeInTheDocument();
        });

        // Check if column headers exist
        expect(screen.getByText('Backlog (To Do)')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText('Done')).toBeInTheDocument();
    });
});
