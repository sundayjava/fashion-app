/**
 * Database Service using expo-sqlite
 * Handles offline storage for measurements and templates
 */

import { MeasurementField } from '@/types';
import * as SQLite from 'expo-sqlite';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MeasurementRecord {
    id: number;
    clientName: string;
    address?: string; // Client address
    unit: string;
    fields: string; // JSON stringified array of MeasurementField[]
    imageUri?: string; // Local file URI for cloth image
    reminderDate?: string; // ISO date string
    isCompleted: boolean;
    completedAt?: string;
    notes?: string;
    sharedWith?: string; // JSON array of user IDs who can access this
    isPublic: boolean; // Whether it's shared publicly
    createdAt: string;
    updatedAt: string;
    syncStatus: 'pending' | 'synced' | 'error';
    remoteId?: string; // ID from backend once synced
}

export interface TemplateRecord {
    id: number;
    name: string;
    fields: string; // JSON stringified array of field names
    isDefault: boolean;
    sharedWith?: string; // JSON array of user IDs who can access this
    isPublic: boolean; // Whether it's shared publicly
    createdAt: string;
    updatedAt: string;
    syncStatus: 'pending' | 'synced' | 'error';
    remoteId?: string;
}

// ─── Database Service ─────────────────────────────────────────────────────────

class DatabaseService {
    private db: SQLite.SQLiteDatabase | null = null;
    private readonly DB_VERSION = 1; // Increment when schema changes

    /**
     * Initialize the database and create tables if they don't exist
     */
    async initialize(): Promise<void> {
        try {
            this.db = await SQLite.openDatabaseAsync('fashionistar.db');
            console.log('📦 Database opened...');

            // Check current database version
            const currentVersion = await this.getDatabaseVersion();
            console.log(`📊 Database version: ${currentVersion} (target: ${this.DB_VERSION})`);
            
            // Check if measurements table exists (for legacy databases without version tracking)
            const tableExists = await this.checkTableExists('measurements');
            console.log(`📋 Measurements table exists: ${tableExists}`);
            
            if (currentVersion === 0 && !tableExists) {
                // Fresh install - create all tables
                console.log('🆕 Fresh install detected - creating tables...');
                await this.createTables();
            } else if (currentVersion < this.DB_VERSION || !tableExists) {
                // Existing database (or legacy database) - run migrations
                console.log(`🔄 Running migrations from version ${currentVersion}...`);
                await this.runMigrations(currentVersion);
            }

            // Update version
            await this.setDatabaseVersion(this.DB_VERSION);

            console.log('✅ Database initialized successfully (version:', this.DB_VERSION, ')');
        } catch (error) {
            console.error('❌ Database initialization error:', error);
            throw error;
        }
    }

    /**
     * Check if a table exists in the database
     */
    private async checkTableExists(tableName: string): Promise<boolean> {
        try {
            const result = await this.db!.getFirstAsync<{ count: number }>(
                "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name=?",
                [tableName]
            );
            return (result?.count ?? 0) > 0;
        } catch (error) {
            console.error('Error checking table existence:', error);
            return false;
        }
    }

    /**
     * Get current database version
     */
    private async getDatabaseVersion(): Promise<number> {
        try {
            // Create version table if it doesn't exist
            await this.db!.execAsync(`
                CREATE TABLE IF NOT EXISTS db_version (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    version INTEGER NOT NULL
                );
            `);

            const result = await this.db!.getFirstAsync<{ version: number }>(
                'SELECT version FROM db_version WHERE id = 1'
            );

            return result?.version ?? 0;
        } catch (error) {
            console.error('Error getting database version:', error);
            return 0;
        }
    }

    /**
     * Set database version
     */
    private async setDatabaseVersion(version: number): Promise<void> {
        await this.db!.execAsync(`
            INSERT OR REPLACE INTO db_version (id, version) VALUES (1, ${version});
        `);
    }

    /**
     * Create all tables from scratch
     */
    private async createTables(): Promise<void> {
        // Create measurements table
        await this.db!.execAsync(`
            CREATE TABLE IF NOT EXISTS measurements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                clientName TEXT NOT NULL,
                address TEXT,
                unit TEXT NOT NULL DEFAULT 'in',
                fields TEXT NOT NULL,
                imageUri TEXT,
                reminderDate TEXT,
                isCompleted INTEGER NOT NULL DEFAULT 0,
                completedAt TEXT,
                notes TEXT,
                sharedWith TEXT,
                isPublic INTEGER NOT NULL DEFAULT 0,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                syncStatus TEXT NOT NULL DEFAULT 'pending',
                remoteId TEXT
            );
        `);

        // Create templates table
        await this.db!.execAsync(`
            CREATE TABLE IF NOT EXISTS templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                fields TEXT NOT NULL,
                isDefault INTEGER NOT NULL DEFAULT 0,
                sharedWith TEXT,
                isPublic INTEGER NOT NULL DEFAULT 0,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                syncStatus TEXT NOT NULL DEFAULT 'pending',
                remoteId TEXT
            );
        `);

        // Create indexes
        await this.db!.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_measurements_sync ON measurements(syncStatus);
            CREATE INDEX IF NOT EXISTS idx_measurements_updated ON measurements(updatedAt);
            CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);
        `);
    }

    /**
     * Run database migrations based on current version
     */
    private async runMigrations(fromVersion: number): Promise<void> {
        console.log(`🔧 Running migrations from version ${fromVersion} to ${this.DB_VERSION}`);

        // First, ensure the measurements table exists (for legacy databases)
        const tableExists = await this.checkTableExists('measurements');
        if (!tableExists) {
            console.log('📋 Creating measurements table...');
            await this.createTables();
            return;
        }

        // Migration from version 0, 1, or 2 to version 3: Add new columns to measurements table
        // Version 0 = legacy database without version tracking
        if (fromVersion < 3) {
            try {
                console.log('🔍 Checking measurements table schema...');
                // Check if columns exist before adding them
                const tableInfo = await this.db!.getAllAsync<{ name: string }>(
                    'PRAGMA table_info(measurements)'
                );
                const columnNames = tableInfo.map(col => col.name);
                console.log('📝 Existing columns:', columnNames.join(', '));

                // Add missing columns
                if (!columnNames.includes('reminderDate')) {
                    console.log('➕ Adding reminderDate column...');
                    await this.db!.execAsync('ALTER TABLE measurements ADD COLUMN reminderDate TEXT;');
                    console.log('✓ Added reminderDate column');
                }
                if (!columnNames.includes('isCompleted')) {
                    console.log('➕ Adding isCompleted column...');
                    await this.db!.execAsync('ALTER TABLE measurements ADD COLUMN isCompleted INTEGER NOT NULL DEFAULT 0;');
                    console.log('✓ Added isCompleted column');
                }
                if (!columnNames.includes('completedAt')) {
                    console.log('➕ Adding completedAt column...');
                    await this.db!.execAsync('ALTER TABLE measurements ADD COLUMN completedAt TEXT;');
                    console.log('✓ Added completedAt column');
                }
                if (!columnNames.includes('notes')) {
                    console.log('➕ Adding notes column...');
                    await this.db!.execAsync('ALTER TABLE measurements ADD COLUMN notes TEXT;');
                    console.log('✓ Added notes column');
                }
                if (!columnNames.includes('sharedWith')) {
                    console.log('➕ Adding sharedWith column...');
                    await this.db!.execAsync('ALTER TABLE measurements ADD COLUMN sharedWith TEXT;');
                    console.log('✓ Added sharedWith column');
                }
                if (!columnNames.includes('isPublic')) {
                    console.log('➕ Adding isPublic column...');
                    await this.db!.execAsync('ALTER TABLE measurements ADD COLUMN isPublic INTEGER NOT NULL DEFAULT 0;');
                    console.log('✓ Added isPublic column');
                }
                if (!columnNames.includes('imageUri')) {
                    console.log('➕ Adding imageUri column...');
                    await this.db!.execAsync('ALTER TABLE measurements ADD COLUMN imageUri TEXT;');
                    console.log('✓ Added imageUri column');
                }
                if (!columnNames.includes('address')) {
                    console.log('➕ Adding address column...');
                    await this.db!.execAsync('ALTER TABLE measurements ADD COLUMN address TEXT;');
                    console.log('✓ Added address column');
                }

                console.log('✅ Migration to version 3 completed');
            } catch (error) {
                console.error('❌ Migration error:', error);
                throw error;
            }
        }
    }

    /**
     * Ensure database is initialized before operations
     */
    private ensureDb(): SQLite.SQLiteDatabase {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }

    // ─── Measurements ─────────────────────────────────────────────────────────

    /**
     * Save a new measurement or update existing one
     */
    async saveMeasurement(
        fields: MeasurementField[],
        unit: string,
        clientName: string,
        address?: string,
        reminderDate?: string,
        notes?: string,
        imageUri?: string,
        id?: number
    ): Promise<number> {
        const db = this.ensureDb();
        const now = new Date().toISOString();
        const fieldsJson = JSON.stringify(fields);

        if (id) {
            // Update existing
            await db.runAsync(
                `UPDATE measurements 
                 SET fields = ?, unit = ?, clientName = ?, address = ?, reminderDate = ?, notes = ?, imageUri = ?, updatedAt = ?, syncStatus = ?
                 WHERE id = ?`,
                [fieldsJson, unit, clientName, address || null, reminderDate || null, notes || null, imageUri || null, now, 'pending', id]
            );
            return id;
        } else {
            // Insert new
            const result = await db.runAsync(
                `INSERT INTO measurements (fields, unit, clientName, address, reminderDate, notes, imageUri, createdAt, updatedAt, syncStatus, isCompleted)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [fieldsJson, unit, clientName, address || null, reminderDate || null, notes || null, imageUri || null, now, now, 'pending', 0]
            );
            return result.lastInsertRowId;
        }
    }

    /**
     * Mark a measurement as complete
     */
    async markMeasurementComplete(id: number, isCompleted: boolean = true): Promise<void> {
        const db = this.ensureDb();
        const now = isCompleted ? new Date().toISOString() : null;
        await db.runAsync(
            `UPDATE measurements SET isCompleted = ?, completedAt = ?, updatedAt = ? WHERE id = ?`,
            [isCompleted ? 1 : 0, now, new Date().toISOString(), id]
        );
    }

    /**
     * Get a measurement by ID
     */
    async getMeasurement(id: number): Promise<MeasurementRecord | null> {
        const db = this.ensureDb();
        const result = await db.getFirstAsync<MeasurementRecord>(
            'SELECT * FROM measurements WHERE id = ?',
            [id]
        );
        return result || null;
    }

    /**
     * Get all measurements, ordered by most recent
     */
    async getAllMeasurements(): Promise<MeasurementRecord[]> {
        const db = this.ensureDb();
        const results = await db.getAllAsync<MeasurementRecord>(
            'SELECT * FROM measurements ORDER BY updatedAt DESC'
        );
        return results;
    }

    /**
     * Get measurements that need syncing
     */
    async getUnsyncedMeasurements(): Promise<MeasurementRecord[]> {
        const db = this.ensureDb();
        const results = await db.getAllAsync<MeasurementRecord>(
            "SELECT * FROM measurements WHERE syncStatus IN ('pending', 'error') ORDER BY updatedAt DESC"
        );
        return results;
    }

    /**
     * Delete a measurement
     */
    async deleteMeasurement(id: number): Promise<void> {
        const db = this.ensureDb();
        await db.runAsync('DELETE FROM measurements WHERE id = ?', [id]);
    }

    /**
     * Mark measurement as synced with backend
     */
    async markMeasurementSynced(localId: number, remoteId: string): Promise<void> {
        const db = this.ensureDb();
        await db.runAsync(
            "UPDATE measurements SET syncStatus = 'synced', remoteId = ? WHERE id = ?",
            [remoteId, localId]
        );
    }

    // ─── Templates ────────────────────────────────────────────────────────────

    /**
     * Save a new template
     */
    async saveTemplate(
        name: string,
        fields: MeasurementField[],
        isDefault: boolean = false
    ): Promise<number> {
        const db = this.ensureDb();
        const now = new Date().toISOString();
        const fieldNames = fields.map((f) => f.name);
        const fieldsJson = JSON.stringify(fieldNames);

        try {
            const result = await db.runAsync(
                `INSERT INTO templates (name, fields, isDefault, createdAt, updatedAt, syncStatus)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [name, fieldsJson, isDefault ? 1 : 0, now, now, 'pending']
            );
            return result.lastInsertRowId;
        } catch (error: any) {
            if (error.message?.includes('UNIQUE constraint')) {
                throw new Error('A template with this name already exists');
            }
            throw error;
        }
    }

    /**
     * Update an existing template
     */
    async updateTemplate(
        id: number,
        name: string,
        fields: MeasurementField[]
    ): Promise<void> {
        const db = this.ensureDb();
        const now = new Date().toISOString();
        const fieldNames = fields.map((f) => f.name);
        const fieldsJson = JSON.stringify(fieldNames);

        await db.runAsync(
            `UPDATE templates 
             SET name = ?, fields = ?, updatedAt = ?, syncStatus = ?
             WHERE id = ?`,
            [name, fieldsJson, now, 'pending', id]
        );
    }

    /**
     * Load a template by name
     */
    async getTemplate(name: string): Promise<TemplateRecord | null> {
        const db = this.ensureDb();
        const result = await db.getFirstAsync<TemplateRecord>(
            'SELECT * FROM templates WHERE name = ?',
            [name]
        );
        return result || null;
    }

    /**
     * Get all templates
     */
    async getAllTemplates(): Promise<TemplateRecord[]> {
        const db = this.ensureDb();
        const results = await db.getAllAsync<TemplateRecord>(
            'SELECT * FROM templates ORDER BY isDefault DESC, name ASC'
        );
        return results;
    }

    /**
     * Delete a template
     */
    async deleteTemplate(id: number): Promise<void> {
        const db = this.ensureDb();
        await db.runAsync('DELETE FROM templates WHERE id = ?', [id]);
    }

    /**
     * Get templates that need syncing
     */
    async getUnsyncedTemplates(): Promise<TemplateRecord[]> {
        const db = this.ensureDb();
        const results = await db.getAllAsync<TemplateRecord>(
            "SELECT * FROM templates WHERE syncStatus IN ('pending', 'error') ORDER BY updatedAt DESC"
        );
        return results;
    }

    /**
     * Mark template as synced with backend
     */
    async markTemplateSynced(localId: number, remoteId: string): Promise<void> {
        const db = this.ensureDb();
        await db.runAsync(
            "UPDATE templates SET syncStatus = 'synced', remoteId = ? WHERE id = ?",
            [remoteId, localId]
        );
    }

    /**
     * Set a template as default (only one can be default)
     */
    async setDefaultTemplate(id: number): Promise<void> {
        const db = this.ensureDb();
        // First, remove default from all templates
        await db.runAsync('UPDATE templates SET isDefault = 0');
        // Then set the selected one as default
        await db.runAsync('UPDATE templates SET isDefault = 1 WHERE id = ?', [id]);
    }

    /**
     * Get the default template
     */
    async getDefaultTemplate(): Promise<TemplateRecord | null> {
        const db = this.ensureDb();
        const result = await db.getFirstAsync<TemplateRecord>(
            'SELECT * FROM templates WHERE isDefault = 1'
        );
        return result || null;
    }

    /**
     * Clear all data (for testing or reset purposes)
     */
    async clearAllData(): Promise<void> {
        const db = this.ensureDb();
        await db.execAsync(`
            DELETE FROM measurements;
            DELETE FROM templates;
        `);
        console.log('✅ All data cleared');
    }

    /**
     * Reset database completely - drop all tables and recreate from scratch
     * WARNING: This will delete all data!
     */
    async resetDatabase(): Promise<void> {
        const db = this.ensureDb();
        
        console.log('🗑️ Dropping all tables...');
        await db.execAsync(`
            DROP TABLE IF EXISTS measurements;
            DROP TABLE IF EXISTS templates;
            DROP TABLE IF EXISTS db_version;
        `);
        
        console.log('🔨 Recreating tables...');
        await this.createTables();
        await this.setDatabaseVersion(this.DB_VERSION);
        
        console.log('✅ Database reset complete');
    }

    /**
     * Close the database connection
     */
    async close(): Promise<void> {
        if (this.db) {
            await this.db.closeAsync();
            this.db = null;
            console.log('✅ Database connection closed');
        }
    }
}

// Export singleton instance
export const dbService = new DatabaseService();
