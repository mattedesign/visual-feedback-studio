import React from 'react';
import { FigmantSidebar } from './FigmantSidebar';
import { FigmantHeader } from './FigmantHeader';

interface FigmantLayoutProps {
  children: React.ReactNode;
}

export const FigmantLayout = ({ children }: FigmantLayoutProps) => {
  return (
    <div 
      className="figmant-layout"
      style={{
        display: 'flex',
        padding: '16px',
        alignItems: 'flex-start',
        gap: '16px',
        borderRadius: '32px',
        border: '4px solid #FFF',
        background: '#1C6D73',
        minHeight: '100vh'
      }}
    >
      <FigmantSidebar />
      <div className="figmant-main">
        <FigmantHeader />
        <div className="figmant-content">
          {children}
        </div>
      </div>
    </div>
  );
};