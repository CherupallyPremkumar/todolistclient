import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders todo list title', async () => {
  render(<App />);
  
  await waitFor(() => {
    const titleElement = screen.getByRole('heading', { name: /todo list/i });
    expect(titleElement).toBeInTheDocument();
  });
});
