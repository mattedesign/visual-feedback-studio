import { supabase } from '@/integrations/supabase/client';

export async function executeSeedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    const { data, error } = await supabase.functions.invoke('seed-database', {
      body: {}
    });

    if (error) {
      throw new Error(`Seeding failed: ${error.message}`);
    }

    console.log('✅ Database seeding completed successfully:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Execute the seeding function
executeSeedDatabase()
  .then(() => {
    console.log('🎉 Seeding script completed successfully');
  })
  .catch((error) => {
    console.error('💥 Seeding script failed:', error);
  });