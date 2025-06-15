import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from './TodoList';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('TodoList Component', () => {
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
    // Mock successful API response
    axios.get.mockResolvedValue({ data: mockTasks });
  });

  it('renders task list correctly', async () => {
    render(<TodoList />);
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  it('adds a new task', async () => {
    const newTask = {
      _id: '3',
      title: 'New Task',
      description: 'New Description',
      completed: false
    };

    axios.post.mockResolvedValue({ data: newTask });

    render(<TodoList />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: 'New Task' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'New Description' }
    });

    // Submit the form
    fireEvent.click(screen.getByText(/add task/i));

    // Wait for the new task to appear
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });
}); 