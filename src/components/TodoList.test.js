import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
    // Mock successful API response for initial load
    axios.get.mockResolvedValue({ data: mockTasks });
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Test Case 1: Initial render and data loading
  it('should render and load tasks successfully', async () => {
    await act(async () => {
      render(<TodoList />);
    });
    
    // Check if title is rendered
    expect(screen.getByRole('heading', { name: /todo list/i })).toBeInTheDocument();
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });

    // Verify API call
    expect(axios.get).toHaveBeenCalledWith('https://todolist-avu8.onrender.com/api/tasks');
  });

  // Test Case 2: Add new task
  it('should add a new task successfully', async () => {
    const newTask = {
      _id: '3',
      title: 'New Task',
      description: 'New Description',
      completed: false
    };

    // Mock POST request
    axios.post.mockResolvedValue({ data: newTask });

    await act(async () => {
      render(<TodoList />);
    });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
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

    // Verify API call
    expect(axios.post).toHaveBeenCalledWith(
      'https://todolist-avu8.onrender.com/api/tasks',
      {
        title: 'New Task',
        description: 'New Description'
      }
    );

    // Wait for the new task to appear
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  // Test Case 3: Toggle task completion
  it('should toggle task completion status', async () => {
    const updatedTask = {
      ...mockTasks[0],
      completed: true
    };

    // Mock PATCH request
    axios.patch.mockResolvedValue({ data: updatedTask });

    await act(async () => {
      render(<TodoList />);
    });

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Find and click the checkbox for the first task
    const taskItem = screen.getByText('Test Task 1').closest('li');
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    await act(async () => {
      fireEvent.click(checkbox);
    });

    // Verify API call
    expect(axios.patch).toHaveBeenCalledWith(
      `https://todolist-avu8.onrender.com/api/tasks/${mockTasks[0]._id}`,
      { completed: true }
    );

    // Wait for the update
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  // Test Case 4: Delete task
  it('should delete a task successfully', async () => {
    // Mock DELETE request
    axios.delete.mockResolvedValue({ data: { message: 'Task deleted' } });

    await act(async () => {
      render(<TodoList />);
    });

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Find and click delete button for the first task
    const taskItem = screen.getByText('Test Task 1').closest('li');
    const deleteButton = taskItem.querySelector('button[aria-label="delete"]');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Verify API call
    expect(axios.delete).toHaveBeenCalledWith(
      `https://todolist-avu8.onrender.com/api/tasks/${mockTasks[0]._id}`
    );

    // Wait for the task to be removed
    await waitFor(() => {
      expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument();
    });
  });

  // Test Case 5: Error handling
  it('should handle API errors gracefully', async () => {
    // Mock failed API request
    axios.get.mockRejectedValue(new Error('Failed to fetch tasks'));

    await act(async () => {
      render(<TodoList />);
    });

    // Wait for error message
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts[0]).toHaveTextContent('Failed to fetch tasks');
    });
  });

  // Test Case 6: Form validation
  it('should not submit empty task title', async () => {
    await act(async () => {
      render(<TodoList />);
    });

    // Try to submit empty form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    });

    // Verify no API call was made
    expect(axios.post).not.toHaveBeenCalled();
  });

  // Test Case 7: Loading state
  it('should show loading indicator while fetching tasks', async () => {
    // Delay the API response
    axios.get.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: mockTasks }), 100)));

    await act(async () => {
      render(<TodoList />);
    });

    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
}); 