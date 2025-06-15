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
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon, Add as AddIcon } from '@mui/icons-material';
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
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'

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
    if (dialogMode === 'edit' && editingTask) {
      setEditingTask(prev => ({ ...prev, [name]: value }));
    } else {
      setNewTask(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenDialog = (mode = 'add', task = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && task) {
      setEditingTask({ ...task });
      setNewTask({ title: task.title, description: task.description || '' });
    } else {
      setEditingTask(null);
      setNewTask({ title: '', description: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTask({ title: '', description: '' });
    setEditingTask(null);
    setDialogMode('add');
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
      handleCloseDialog();
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
    handleOpenDialog('edit', task);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    try {
      setActionLoading({ id: editingTask._id, action: 'edit' });
      // Optimistic update
      setTasks(prev => prev.map(t => 
        t._id === editingTask._id ? { ...t, title: editingTask.title, description: editingTask.description } : t
      ));

      const response = await axios.patch(`${API_URL}/${editingTask._id}`, {
        title: editingTask.title,
        description: editingTask.description
      });

      // Update with server response
      setTasks(prev => prev.map(t => 
        t._id === editingTask._id ? response.data : t
      ));

      handleCloseDialog();
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        align="center" 
        gutterBottom
        sx={{ 
          mb: 4,
          fontWeight: 'bold',
          color: 'primary.main'
        }}
      >
        Todo List
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2
          }}
        >
          {error}
        </Alert>
      )}

      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tasks.map((task) => (
          <ListItem
            key={task._id}
            component={Paper}
            elevation={2}
            sx={{ 
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3
              }
            }}
          >
            <Checkbox
              edge="start"
              checked={task.completed}
              onChange={() => handleToggleComplete(task._id)}
              disabled={actionLoading.id === task._id}
              sx={{
                '&.Mui-checked': {
                  color: 'primary.main'
                }
              }}
            />
            <ListItemText
              primary={
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'text.secondary' : 'text.primary',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {task.title}
                </Typography>
              }
              secondary={
                <Typography
                  variant="body2"
                  sx={{
                    color: task.completed ? 'text.secondary' : 'text.primary',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {task.description}
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEdit(task)}
                disabled={actionLoading.id === task._id || task.completed}
                sx={{ 
                  mr: 1,
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white'
                  }
                }}
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
                disabled={actionLoading.id === task._id || task.completed}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'white'
                  }
                }}
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

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenDialog('add')}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          '&:hover': {
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease'
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Task' : 'Edit Task'}
        </DialogTitle>
        <form onSubmit={dialogMode === 'add' ? handleSubmit : handleSaveEdit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Task Title"
              name="title"
              value={dialogMode === 'add' ? newTask.title : (editingTask?.title || '')}
              onChange={handleInputChange}
              margin="normal"
              required
              autoFocus
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Description (optional)"
              name="description"
              value={dialogMode === 'add' ? newTask.description : (editingTask?.description || '')}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="secondary">
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              variant="contained"
              disabled={actionLoading.id === (dialogMode === 'add' ? 'new' : editingTask?._id)}
              startIcon={actionLoading.id === (dialogMode === 'add' ? 'new' : editingTask?._id) ? <CircularProgress size={20} /> : null}
            >
              {dialogMode === 'add' ? 'Add Task' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TodoList; 