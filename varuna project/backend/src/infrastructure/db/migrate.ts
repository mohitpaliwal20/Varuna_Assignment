import { readFileSync } from 'fs';
import { join } from 'path';
import pool from './connection';

const migrations = [
  '001_create_routes_table.sql',
  '002_create_ship_compliance_table.sql',
  '003_create_bank_entries_table.sql',
  '004_create_pools_table.sql',
  '005_create_pool_members_table.sql',
];

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migrations...');
    
    for (const migration of migrations) {
      const migrationPath = join(__dirname, 'migrations', migration);
      const sql = readFileSync(migrationPath, 'utf-8');
      
      console.log(`Running migration: ${migration}`);
      await client.query(sql);
      console.log(`✓ Completed: ${migration}`);
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((error) => {
  console.error('Fatal error during migration:', error);
  process.exit(1);
});
