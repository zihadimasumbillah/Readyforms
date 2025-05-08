import { Model, ModelStatic, ValidationError } from 'sequelize';
import { Response } from 'express';

export class OptimisticLockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OptimisticLockError';
  }
}

/**
 * @param model 
 * @param id 
 * @param version
 * @param data 
 * @returns 
 * @throws 
 */
export async function optimisticUpdate<T extends Model>(
  model: ModelStatic<T>,
  id: string,
  version: number | string,
  data: any
): Promise<T> {

  const versionNum = typeof version === 'string' ? parseInt(version, 10) : version;
  
  if (isNaN(versionNum)) {
    throw new Error('Invalid version number');
  }

  const record = await model.findByPk(id);
  
  if (!record) {
    throw new Error('Record not found');
  }
  
  if (record.getDataValue('version') !== versionNum) {
    throw new OptimisticLockError('Record has been modified by another user');
  }
  
  await record.update(data);
  
  return record;
}

/**
 * @param model
 * @param id 
 * @param version 
 * @throws 
 */
export async function optimisticDelete<T extends Model>(
  model: ModelStatic<T>,
  id: string,
  version: number | string
): Promise<void> {
  const versionNum = typeof version === 'string' ? parseInt(version, 10) : version;
  
  if (isNaN(versionNum)) {
    throw new Error('Invalid version number');
  }

  const record = await model.findByPk(id);
  
  if (!record) {
    throw new Error('Record not found');
  }

  if (record.getDataValue('version') !== versionNum) {
    throw new OptimisticLockError('Record has been modified by another user');
  }

  await record.destroy();
}

/**
 * @param error 
 * @param res 
 * @returns 
 */
export function handleOptimisticLockError(error: unknown, res: Response): boolean {
  if (error instanceof OptimisticLockError) {
    res.status(409).json({
      message: 'Conflict: The record has been modified by another user. Please reload and try again.',
      error: 'OptimisticLockError'
    });
    return true;
  }
  
  if (error instanceof ValidationError) {
    res.status(400).json({
      message: 'Validation error',
      errors: error.errors.map(e => ({
        message: e.message,
        path: e.path,
        type: e.type
      }))
    });
    return true;
  }
  
  return false;
}