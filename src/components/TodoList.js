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
  Snackbar,
  useTheme,
  alpha,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Zoom
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import axios from 'axios';

const BASE_URL = 'https://todolist-avu8.onrender.com';
const API_URL = `${BASE_URL}/api/tasks`;

const TodoList = () => {
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [actionLoading, setActionLoading] = useState({ id: null, action: null });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setTasks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks');
      showSnackbar('Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingTask) {
      setEditingTask({ ...editingTask, [name]: value });
    } else {
      setNewTask({ ...newTask, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const tempId = Date.now().toString();
    try {
      setActionLoading({ id: 'new', action: 'add' });
      // Optimistic update
      const optimisticTask = { ...newTask, _id: tempId, completed: false };
      setTasks(prev => [...prev, optimisticTask]);

      const response = await axios.post(API_URL, newTask);
      
      // Update with real data
      setTasks(prev => prev.map(task => task._id === tempId ? response.data : task));
      setNewTask({ title: '', description: '' });
      showSnackbar('Task added successfully');
    } catch (err) {
      // Revert optimistic update
      setTasks(prev => prev.filter(task => task._id !== tempId));
      setError('Failed to add task');
      showSnackbar('Failed to add task', 'error');
    } finally {
      setActionLoading({ id: null, action: null });
    }
  };

  const handleToggleComplete = async (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    try {
      setActionLoading({ id: taskId, action: 'toggle' });
      // Optimistic update
      setTasks(prev => prev.map(t => 
        t._id === taskId ? { ...t, completed: !t.completed } : t
      ));

      await axios.patch(`${API_URL}/${taskId}`, {
        completed: !task.completed
      });
      showSnackbar('Task updated successfully');
    } catch (err) {
      // Revert optimistic update
      setTasks(prev => prev.map(t => 
        t._id === taskId ? { ...t, completed: task.completed } : t
      ));
      setError('Failed to update task');
      showSnackbar('Failed to update task', 'error');
    } finally {
      setActionLoading({ id: null, action: null });
    }
  };

  const handleDelete = async (taskId) => {
    try {
      setActionLoading({ id: taskId, action: 'delete' });
      // Optimistic update
      setTasks(prev => prev.filter(t => t._id !== taskId));

      await axios.delete(`${API_URL}/${taskId}`);
      showSnackbar('Task deleted successfully');
    } catch (err) {
      // Revert optimistic update
      fetchTasks();
      setError('Failed to delete task');
      showSnackbar('Failed to delete task', 'error');
    } finally {
      setActionLoading({ id: null, action: null });
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setNewTask({ title: task.title, description: task.description });
  };

  const handleSaveEdit = async () => {
    if (!editingTask.title.trim()) return;

    try {
      setActionLoading({ id: editingTask._id, action: 'edit' });
      // Optimistic update
      setTasks(prev => prev.map(t => 
        t._id === editingTask._id ? { ...t, ...editingTask } : t
      ));

      await axios.patch(`${API_URL}/${editingTask._id}`, {
        title: editingTask.title,
        description: editingTask.description
      });

      setEditingTask(null);
      setNewTask({ title: '', description: '' });
      showSnackbar('Task updated successfully');
    } catch (err) {
      // Revert optimistic update
      fetchTasks();
      setError('Failed to update task');
      showSnackbar('Failed to update task', 'error');
    } finally {
      setActionLoading({ id: null, action: null });
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setNewTask({ title: '', description: '' });
  };

  const showSnackbar = (message, severity = 'success') => {
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress data-testid="loading-spinner" />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Todo List
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Task Title"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            margin="normal"
            required
            disabled={!!editingTask}
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
            disabled={!!editingTask}
          />
          <Box mt={2} display="flex" gap={1}>
            {editingTask ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveEdit}
                  disabled={actionLoading.id === editingTask._id}
                  startIcon={actionLoading.id === editingTask._id ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancelEdit}
                  disabled={actionLoading.id === editingTask._id}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={actionLoading.id === 'new'}
                startIcon={actionLoading.id === 'new' ? <CircularProgress size={20} /> : null}
              >
                Add Task
              </Button>
            )}
          </Box>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {tasks.map((task) => (
          <ListItem
            key={task._id}
            component={Paper}
            elevation={2}
            sx={{ mb: 1 }}
          >
            <Checkbox
              edge="start"
              checked={task.completed}
              onChange={() => handleToggleComplete(task._id)}
              disabled={actionLoading.id === task._id}
            />
            <ListItemText
              primary={
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'text.secondary' : 'text.primary'
                  }}
                >
                  {task.title}
                </Typography>
              }
              secondary={task.description}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEdit(task)}
                disabled={actionLoading.id === task._id}
                sx={{ mr: 1 }}
              >
                {actionLoading.id === task._id && actionLoading.action === 'edit' ? (
                  <CircularProgress size={24} />
                ) : (
                  <EditIcon />
                )}
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDelete(task._id)}
                disabled={actionLoading.id === task._id}
              >
                {actionLoading.id === task._id && actionLoading.action === 'delete' ? (
                  <CircularProgress size={24} />
                ) : (
                  <DeleteIcon />
                )}
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TodoList; 