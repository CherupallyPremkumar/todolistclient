import React, { useState } from 'react';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Paper,
  Typography,
  TextField,
  Box,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const TodoItem = ({ task, onDelete, onToggleComplete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onEdit(task._id, editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask({
      title: task.title,
      description: task.description || ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 2,
        backgroundColor: task.completed ? '#f5f5f5' : 'white',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }}
    >
      <ListItem>
        <Checkbox
          edge="start"
          checked={task.completed}
          onChange={() => onToggleComplete(task._id, !task.completed)}
          sx={{ mr: 1 }}
        />
        {isEditing ? (
          <Box sx={{ width: '100%', mr: 2 }}>
            <TextField
              fullWidth
              name="title"
              value={editedTask.title}
              onChange={handleInputChange}
              margin="dense"
              size="small"
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              name="description"
              value={editedTask.description}
              onChange={handleInputChange}
              margin="dense"
              size="small"
              multiline
              rows={2}
            />
          </Box>
        ) : (
          <ListItemText
            primary={
              <Typography
                variant="body1"
                sx={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'text.secondary' : 'text.primary',
                  fontWeight: 'medium'
                }}
              >
                {task.title}
              </Typography>
            }
            secondary={
              task.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    mt: 0.5
                  }}
                >
                  {task.description}
                </Typography>
              )
            }
          />
        )}
        <ListItemSecondaryAction>
          {isEditing ? (
            <Box>
              <Tooltip title="Save">
                <IconButton
                  edge="end"
                  aria-label="save"
                  onClick={handleSave}
                  sx={{ mr: 1 }}
                >
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton
                  edge="end"
                  aria-label="cancel"
                  onClick={handleCancel}
                  sx={{ mr: 1 }}
                >
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Box>
              <Tooltip title="Edit">
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={handleEdit}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onDelete(task._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </ListItemSecondaryAction>
      </ListItem>
    </Paper>
  );
};

export default TodoItem; 