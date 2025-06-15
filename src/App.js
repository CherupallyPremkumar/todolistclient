import React from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import TodoList from './components/TodoList';
import Header from './components/Header';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Header />
        <TodoList />
      </Container>
    </ThemeProvider>
  );
}

export default App;
