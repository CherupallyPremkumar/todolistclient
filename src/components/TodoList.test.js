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

  // Test Case 3: Edit task
  it('should edit a task successfully', async () => {
    const updatedTask = {
      ...mockTasks[0],
      title: 'Updated Task',
      description: 'Updated Description'
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

    // Click edit button
    const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
    await act(async () => {
      fireEvent.click(editButton);
    });

    // Fill in the edit form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/task title/i), {
        target: { value: 'Updated Task' }
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Updated Description' }
      });
    });

    // Click save button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    });

    // Verify API call
    expect(axios.patch).toHaveBeenCalledWith(
      `https://todolist-avu8.onrender.com/api/tasks/${mockTasks[0]._id}`,
      {
        title: 'Updated Task',
        description: 'Updated Description'
      }
    );

    // Wait for the update
    await waitFor(() => {
      expect(screen.getByText('Updated Task')).toBeInTheDocument();
    });
  });

  // Test Case 4: Toggle task completion
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
    const checkbox = screen.getAllByRole('checkbox')[0];
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

  // Test Case 5: Delete task
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
    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
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

  // Test Case 6: Error handling
  it('should handle API errors gracefully', async () => {
    // Mock failed API request
    axios.get.mockRejectedValue(new Error('Failed to fetch tasks'));

    await act(async () => {
      render(<TodoList />);
    });

    // Wait for error message
    await waitFor(() => {
      const errorMessages = screen.getAllByText('Failed to fetch tasks');
      expect(errorMessages.length).toBeGreaterThan(0);
      expect(errorMessages[0]).toBeInTheDocument();
    });
  });

  // Test Case 7: Form validation
  it('should not submit empty task title', async () => {
    await act(async () => {
      render(<TodoList />);
    });

    // Click add button to open dialog
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add/i }));
    });

    // Try to submit empty form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    });

    // Verify no API call was made
    expect(axios.post).not.toHaveBeenCalled();
  });

  // Test Case 8: Loading state
  it('should show loading indicator while fetching tasks', async () => {
    // Delay the API response
    axios.get.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: mockTasks }), 100)));

    await act(async () => {
      render(<TodoList />);
    });

    // Check for loading indicator
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });
}); 