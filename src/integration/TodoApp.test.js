import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('TodoApp Integration Tests', () => {
  const mockTasks = [
    {
      _id: '1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      completed: false
    },
    {
      _id: '2',
      title: 'Test Task 2',
      description: 'Test Description 2',
      completed: true
    }
  ];

  beforeEach(() => {
    // Mock successful API response for initial load
    axios.get.mockResolvedValue({ data: mockTasks });
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Test Case 1: Error handling flow
  it('should handle API errors and show appropriate messages', async () => {
    // Mock failed API requests
    axios.get.mockRejectedValue(new Error('Failed to fetch tasks'));
    axios.post.mockRejectedValue(new Error('Failed to add task'));
    axios.patch.mockRejectedValue(new Error('Failed to update task'));
    axios.delete.mockRejectedValue(new Error('Failed to delete task'));

    render(<App />);

    // Verify initial error message
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts[0]).toHaveTextContent('Failed to fetch tasks');
    });

    // Try to add a task
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/task title/i), {
        target: { value: 'New Task' }
      });
      fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    });

    // Verify error message for failed creation
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts[0]).toHaveTextContent('Failed to add task');
    });
  });
}); 