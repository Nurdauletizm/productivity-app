import { fetcher } from '../fetcher';

describe('fetcher', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return JSON on successful response', async () => {
        const mockData = { id: 1, name: 'Test' };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        const result = await fetcher('/api/test');
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith('/api/test');
    });

    it('should throw an error with info and status on failed response', async () => {
        const mockErrorData = { message: 'Not found' };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => mockErrorData,
        });

        try {
            await fetcher('/api/error');
            fail('Expected fetcher to throw');
        } catch (error: any) {
            expect(error.message).toBe('An error occurred while fetching the data.');
            expect(error.info).toEqual(mockErrorData);
            expect(error.status).toBe(404);
        }
    });
});
