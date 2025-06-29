
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import KnowledgeBasePopulation from '@/pages/KnowledgeBasePopulation';
import VectorTest from '@/pages/VectorTest';

export const KnowledgeRoutes = () => {
  return (
    <Routes>
      <Route path="/knowledge-population" element={<KnowledgeBasePopulation />} />
      <Route path="/vector-test" element={<VectorTest />} />
    </Routes>
  );
};
