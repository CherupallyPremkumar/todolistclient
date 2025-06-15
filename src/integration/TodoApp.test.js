import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoApp from '../App';
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

    await act(async () => {
      render(<TodoApp />);
    });

    // Wait for error message
    await waitFor(() => {
      const errorMessages = screen.getAllByText('Failed to fetch tasks');
      expect(errorMessages.length).toBeGreaterThan(0);
      expect(errorMessages[0]).toBeInTheDocument();
    });

    // Click add button to open dialog
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add/i }));
    });

    // Fill in the form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/task title/i), {
        target: { value: 'New Task' }
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'New Description' }
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    });

    // Verify error handling
    await waitFor(() => {
      const errorMessages = screen.getAllByText('Failed to add task');
      expect(errorMessages.length).toBeGreaterThan(0);
      expect(errorMessages[0]).toBeInTheDocument();
    });
  });

  // Test Case 2: Successful task creation
  it('should create a new task successfully', async () => {
    const newTask = {
      _id: '3',
      title: 'New Task',
      description: 'New Description',
      completed: false
    };

    // Mock successful POST request
    axios.post.mockResolvedValue({ data: newTask });

    await act(async () => {
      render(<TodoApp />);
    });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Click add button to open dialog
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add/i }));
    });

    // Fill in the form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/task title/i), {
        target: { value: 'New Task' }
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'New Description' }
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    });

    // Verify the new task appears
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
      expect(screen.getByText('New Description')).toBeInTheDocument();
    });
  });
}); 