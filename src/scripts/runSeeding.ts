import { executeDatabaseSeeding } from './seedProblemStatementData';

// Execute the seeding
executeDatabaseSeeding()
  .then((result) => {
    if (result.success) {
      console.log('🎉 Database seeding completed successfully!');
    } else {
      console.error('💥 Database seeding failed!');
    }
  })
  .catch((error) => {
    console.error('💥 Seeding execution failed:', error);
  });