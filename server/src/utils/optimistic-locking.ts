import { Model, ModelStatic } from 'sequelize';
import { Response } from 'express';

/**
 * @param model 
 * @param id 
 * @param version 
 * @param updateData 
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
  
  Object.assign(record, updateData);
  await record.save();
  
  return record as T;
}

/**
 * @param model 
 * @param id 
 * @param version 
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
 * @param error 
 * @param res 
 * @returns 
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