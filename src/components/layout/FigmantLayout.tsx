import React from 'react';
import { FigmantSidebar } from './FigmantSidebar';
import { FigmantHeader } from './FigmantHeader';

interface FigmantLayoutProps {
  children: React.ReactNode;
}

export const FigmantLayout = ({ children }: FigmantLayoutProps) => {
  return (
    <div className="figmant-layout">
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