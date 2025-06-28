
import React from 'react';
import { MigrationRunner } from '@/components/admin/MigrationRunner';
import { Header } from '@/components/layout/Header';

export default function MigrationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Knowledge Base Migration
            </h1>
            <p className="text-gray-600">
              Migrate your existing knowledge entries to the new hierarchical category structure.
            </p>
          </div>
          
          <MigrationRunner />
        </div>
      </main>
    </div>
  );
}
