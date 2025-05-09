import { Model, ModelStatic } from 'sequelize';
import { Response } from 'express';

/**
 * Performs optimistic update of a record
 * @param model The Sequelize model class
 * @param id The id of the record to update
 * @param version The expected version of the record
 * @param updateData The data to update
 */
export async function optimisticUpdate<T extends Model>(
  model: ModelStatic<any>,
  id: string | number,
  version: number,
  updateData: any
): Promise<T> {
  const record = await (model as any).findByPk(id);
  
  if (!record) {
    throw new Error('Record not found');
  }
  
  if (record.version !== version) {
    const error = new Error('Record has been modified by another user');
    (error as any).isOptimisticLockError = true;
    (error as any).currentVersion = record.version;
    throw error;
  }
  
  // Update the record with the new data
  Object.assign(record, updateData);
  await record.save();
  
  return record as T;
}

/**
 * Performs optimistic delete of a record
 * @param model The Sequelize model class
 * @param id The id of the record to delete
 * @param version The expected version of the record
 */
export async function optimisticDelete(
  model: ModelStatic<any>,
  id: string | number,
  version: number
): Promise<void> {
  const record = await (model as any).findByPk(id);
  
  if (!record) {
    throw new Error('Record not found');
  }
  
  if (record.version !== version) {
    const error = new Error('Record has been modified by another user');
    (error as any).isOptimisticLockError = true;
    (error as any).currentVersion = record.version;
    throw error;
  }
  
  await record.destroy();
}

/**
 * Handles optimistic lock errors, sending appropriate response
 * @param error The error to handle
 * @param res Express response object
 * @returns true if error was handled, false otherwise
 */
export function handleOptimisticLockError(error: any, res: Response): boolean {
  if (error.isOptimisticLockError) {
    res.status(409).json({
      message: 'Record has been modified by another user. Please refresh and try again.',
      currentVersion: error.currentVersion
    });
    return true;
  }
  return false;
}