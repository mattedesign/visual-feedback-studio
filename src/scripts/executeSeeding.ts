import { executeDatabaseSeeding } from './seedProblemStatementData';

// Execute the seeding immediately
console.log('🌱 Executing database seeding...');

executeDatabaseSeeding()
  .then((result) => {
    console.log('✅ Seeding completed:', result);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
  });