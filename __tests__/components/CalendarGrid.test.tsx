import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CalendarGrid } from '../../src/components/CalendarGrid';

// Mock the Next.js fetch API calls
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
            {
                id: 'task-cal-1',
                title: 'Meeting with Team',
                description: 'Sync up',
                status: 'BACKLOG',
                labels: ['meeting'],
                deadline: new Date().toISOString() // Task for today
            }
        ]),
    })
) as jest.Mock;

describe('CalendarGrid Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        render(<CalendarGrid />);
        expect(screen.getByText('Loading calendar...')).toBeInTheDocument();
    });

    it('fetches tasks and displays today\'s date with a task', async () => {
        render(<CalendarGrid />);

        // Wait for data to load
        await waitFor(() => {
            expect(screen.queryByText('Loading calendar...')).not.toBeInTheDocument();
        });

        // Our task "Meeting with team" should appear because it is scheduled for today
        expect(screen.getByText('Meeting with Team')).toBeInTheDocument();

        // The Today button exists
        expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('navigates to the next month', async () => {
        render(<CalendarGrid />);

        await waitFor(() => {
            expect(screen.queryByText('Loading calendar...')).not.toBeInTheDocument();
        });

        const monthNameInitial = screen.getByRole('heading', { level: 2 }).textContent;

        // In lucide-react, icons usually render an SVG. Our buttons wrap them.
        // We can find the next button by grabbing all buttons and finding the last one (next)
        const buttons = screen.getAllByRole('button');
        const nextButton = buttons[2]; // Prev, Today, Next

        fireEvent.click(nextButton);

        const monthNameAfterClick = screen.getByRole('heading', { level: 2 }).textContent;
        expect(monthNameInitial).not.toBe(monthNameAfterClick);
    });
});
