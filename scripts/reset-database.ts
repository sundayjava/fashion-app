/**
 * Script to reset the database
 * Run this if you're experiencing database schema issues
 * 
 * Usage:
 * 1. In the app, go to Settings (or wherever you want to add this)
 * 2. Add a button that calls: dbService.resetDatabase()
 * 
 * Or you can add a temporary button in your dev environment
 */

import { dbService } from '../services/database';

export async function resetDatabase() {
    try {
        console.log('🔄 Resetting database...');
        await dbService.initialize();
        await dbService.resetDatabase();
        console.log('✅ Database reset successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to reset database:', error);
        return false;
    }
}
