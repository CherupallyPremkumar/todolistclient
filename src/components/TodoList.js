import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  Paper,
  Typography,
  CircularProgress,
  Container,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import TodoItem from './TodoItem';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api/tasks';

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tasks');
      setLoading(false);
      showSnackbar('Failed to fetch tasks', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const response = await axios.post(API_URL, newTask);
      setTasks(prev => [response.data, ...prev]);
      setNewTask({ title: '', description: '' });
      showSnackbar('Task added successfully', 'success');
    } catch (err) {
      setError('Failed to add task');
      showSnackbar('Failed to add task', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(prev => prev.filter(task => task._id !== id));
      showSnackbar('Task deleted successfully', 'success');
    } catch (err) {
      setError('Failed to delete task');
      showSnackbar('Failed to delete task', 'error');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, { completed });
      setTasks(prev => prev.map(task => 
        task._id === id ? response.data : task
      ));
      showSnackbar(`Task marked as ${completed ? 'completed' : 'incomplete'}`, 'success');
    } catch (err) {
      setError('Failed to update task');
      showSnackbar('Failed to update task', 'error');
    }
  };

  const handleEdit = async (id, updatedTask) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, updatedTask);
      setTasks(prev => prev.map(task => 
        task._id === id ? response.data : task
      ));
      showSnackbar('Task updated successfully', 'success');
    } catch (err) {
      setError('Failed to update task');
      showSnackbar('Failed to update task', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Todo List
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Task Title"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            margin="normal"
            required
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description (optional)"
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={2}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<AddIcon />}
            sx={{ mt: 2, py: 1.5 }}
          >
            Add Task
          </Button>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {tasks.map(task => (
          <TodoItem
            key={task._id}
            task={task}
            onDelete={handleDelete}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEdit}
          />
        ))}
      </List>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TodoList; 