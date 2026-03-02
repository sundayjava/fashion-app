/**
 * Sync Service - Handles syncing offline data to backend
 * 
 * This service will be used to sync measurements and templates
 * from the local SQLite database to your backend API when online.
 */

import { dbService } from './database';

export interface SyncResult {
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
}

class SyncService {
    private isSyncing = false;

    /**
     * Sync all unsynced data to backend
     * Call this when the app comes online or periodically
     */
    async syncAll(): Promise<SyncResult> {
        if (this.isSyncing) {
            throw new Error('Sync already in progress');
        }

        this.isSyncing = true;
        const result: SyncResult = {
            success: true,
            synced: 0,
            failed: 0,
            errors: [],
        };

        try {
            // Sync measurements
            const measurementResult = await this.syncMeasurements();
            result.synced += measurementResult.synced;
            result.failed += measurementResult.failed;
            result.errors.push(...measurementResult.errors);

            // Sync templates
            const templateResult = await this.syncTemplates();
            result.synced += templateResult.synced;
            result.failed += templateResult.failed;
            result.errors.push(...templateResult.errors);

            result.success = result.failed === 0;
        } catch (error: any) {
            result.success = false;
            result.errors.push(error.message);
        } finally {
            this.isSyncing = false;
        }

        return result;
    }

    /**
     * Sync measurements to backend
     */
    private async syncMeasurements(): Promise<SyncResult> {
        const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };

        try {
            const unsynced = await dbService.getUnsyncedMeasurements();

            for (const measurement of unsynced) {
                try {
                    // TODO: Replace with your actual API endpoint
                    // const response = await fetch('YOUR_API_URL/measurements', {
                    //     method: 'POST',
                    //     headers: { 'Content-Type': 'application/json' },
                    //     body: JSON.stringify({
                    //         clientName: measurement.clientName,
                    //         unit: measurement.unit,
                    //         fields: measurement.fields,
                    //         createdAt: measurement.createdAt,
                    //         updatedAt: measurement.updatedAt,
                    //     }),
                    // });
                    // const data = await response.json();
                    // await dbService.markMeasurementSynced(measurement.id, data.id);

                    // For now, just log (remove when implementing actual API)
                    console.log('Would sync measurement:', measurement.id);
                    result.synced++;
                } catch (error: any) {
                    result.failed++;
                    result.errors.push(`Measurement ${measurement.id}: ${error.message}`);
                }
            }
        } catch (error: any) {
            result.errors.push(`Failed to fetch unsynced measurements: ${error.message}`);
        }

        result.success = result.failed === 0;
        return result;
    }

    /**
     * Sync templates to backend
     */
    private async syncTemplates(): Promise<SyncResult> {
        const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };

        try {
            const unsynced = await dbService.getUnsyncedTemplates();

            for (const template of unsynced) {
                try {
                    // TODO: Replace with your actual API endpoint
                    // const response = await fetch('YOUR_API_URL/templates', {
                    //     method: 'POST',
                    //     headers: { 'Content-Type': 'application/json' },
                    //     body: JSON.stringify({
                    //         name: template.name,
                    //         fields: template.fields,
                    //         isDefault: template.isDefault,
                    //         createdAt: template.createdAt,
                    //         updatedAt: template.updatedAt,
                    //     }),
                    // });
                    // const data = await response.json();
                    // await dbService.markTemplateSynced(template.id, data.id);

                    // For now, just log (remove when implementing actual API)
                    console.log('Would sync template:', template.id);
                    result.synced++;
                } catch (error: any) {
                    result.failed++;
                    result.errors.push(`Template ${template.id}: ${error.message}`);
                }
            }
        } catch (error: any) {
            result.errors.push(`Failed to fetch unsynced templates: ${error.message}`);
        }

        result.success = result.failed === 0;
        return result;
    }

    /**
     * Check if there's any data pending sync
     */
    async hasPendingSync(): Promise<boolean> {
        try {
            const measurements = await dbService.getUnsyncedMeasurements();
            const templates = await dbService.getUnsyncedTemplates();
            return measurements.length > 0 || templates.length > 0;
        } catch (error) {
            console.error('Failed to check pending sync:', error);
            return false;
        }
    }

    /**
     * Get count of items pending sync
     */
    async getPendingSyncCount(): Promise<{ measurements: number; templates: number }> {
        try {
            const measurements = await dbService.getUnsyncedMeasurements();
            const templates = await dbService.getUnsyncedTemplates();
            return {
                measurements: measurements.length,
                templates: templates.length,
            };
        } catch (error) {
            console.error('Failed to get pending sync count:', error);
            return { measurements: 0, templates: 0 };
        }
    }
}

// Export singleton instance
export const syncService = new SyncService();

/**
 * Usage example:
 * 
 * // Manual sync
 * const result = await syncService.syncAll();
 * if (result.success) {
 *     console.log(`Synced ${result.synced} items`);
 * } else {
 *     console.error('Sync errors:', result.errors);
 * }
 * 
 * // Check pending sync
 * const hasPending = await syncService.hasPendingSync();
 * const counts = await syncService.getPendingSyncCount();
 * 
 * // Auto-sync when app comes online
 * NetInfo.addEventListener(state => {
 *     if (state.isConnected) {
 *         syncService.syncAll().catch(console.error);
 *     }
 * });
 */
