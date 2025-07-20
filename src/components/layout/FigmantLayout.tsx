import React from 'react';
import { FigmantSidebar } from './FigmantSidebar';
import { FigmantHeader } from './FigmantHeader';

interface FigmantLayoutProps {
  children: React.ReactNode;
}

export const FigmantLayout = ({ children }: FigmantLayoutProps) => {
  return (
    <div style={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      gap: '16px',
      overflow: 'hidden' 
    }}>
      <FigmantSidebar />
      <div style={{ 
        flex: '1', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        minWidth: 0 
      }}>
        <FigmantHeader />
        <div style={{ 
          flex: '1', 
          overflow: 'auto',
          padding: '24px'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};