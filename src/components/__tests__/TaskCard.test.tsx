import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { TaskCard, Task } from '../TaskCard';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

const renderWithDnD = (ui: React.ReactElement) => {
    return render(
        <DragDropContext onDragEnd={() => { }}>
            <Droppable droppableId="board">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {ui}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

describe('TaskCard Component', () => {
    const mockTask: Task = {
        id: 'task-1',
        title: 'Learn Next.js',
        description: 'Complete the official tutorial',
        status: 'BACKLOG',
        labels: ['urgent', 'work'],
        deadline: '2026-12-31T00:00:00.000Z',
        goalTitle: 'Frontend Mastery'
    };

    it('renders task details correctly', () => {
        renderWithDnD(<TaskCard task={mockTask} index={0} onClick={() => { }} />);

        expect(screen.getByText('Learn Next.js')).toBeInTheDocument();
        expect(screen.getByText('Complete the official tutorial')).toBeInTheDocument();
        expect(screen.getByText('urgent')).toBeInTheDocument();
        expect(screen.getByText('work')).toBeInTheDocument();
        expect(screen.getByText('Frontend Mastery')).toBeInTheDocument();
    });

    it('renders without optional fields', () => {
        const minimalTask: Task = {
            id: 'task-2',
            title: 'Minimal Task',
            status: 'BACKLOG',
        };

        renderWithDnD(<TaskCard task={minimalTask} index={0} />);

        expect(screen.getByText('Minimal Task')).toBeInTheDocument();
        // Since there are no labels, etc., those shouldn't crash it
        expect(screen.queryByTestId('task-description')).not.toBeInTheDocument();
    });
});
