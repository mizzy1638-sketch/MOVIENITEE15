import React from 'react';
import { App as MovieNiteComponent } from './main.js';

/**
 * Top-level MovieNite Application Component
 * Encapsulates the complete MovieNite UI, ThemeProvider, Player, R2 Uploader, and Admin Panel.
 */
export const App: React.FC = () => {
  return <MovieNiteComponent />;
};

export default App;
