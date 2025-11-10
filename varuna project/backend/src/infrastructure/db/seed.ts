import { readFileSync } from 'fs';
import { join } from 'path';
import pool from './connection';

const seedFiles = [
  'routes.sql',
];

async function runSeeds() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database seeding...');
    
    for (const seedFile of seedFiles) {
      const seedPath = join(__dirname, 'seeds', seedFile);
      const sql = readFileSync(seedPath, 'utf-8');
      
      console.log(`Running seed: ${seedFile}`);
      await client.query(sql);
      console.log(`✓ Completed: ${seedFile}`);
    }
    
    console.log('All seeds completed successfully!');
    console.log('R002 (BulkCarrier, LNG, 2024) has been set as the default baseline.');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runSeeds().catch((error) => {
  console.error('Fatal error during seeding:', error);
  process.exit(1);
});
