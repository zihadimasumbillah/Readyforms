import { Model, ModelStatic, WhereOptions } from 'sequelize';
import { Response } from 'express';

/**
 * Class representing an optimistic locking error
 */
export class OptimisticLockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OptimisticLockError';
  }
}

/**
 * Updates a record with optimistic locking
 * 
 * @param model The Sequelize model class
 * @param id The primary key of the record to update
 * @param version The current version of the record
 * @param data The data to update
 * @returns The updated record
 * @throws OptimisticLockError if the record has been modified by another transaction
 */
export async function optimisticUpdate<T extends Model>(
  model: ModelStatic<T>,
  id: string | number,
  version: number,
  data: Record<string, any>
): Promise<T> {
  const result = await model.update(
    data,
    {
      where: {
        id,
        version
      } as WhereOptions<any>,
      returning: true
    }
  );
  
  // Check if any rows were affected
  const [affectedCount, affectedRows] = result;
  
  if (affectedCount === 0) {
    throw new OptimisticLockError(
      'Optimistic locking error: The record has been modified by another transaction.'
    );
  }
  
  return affectedRows[0];
}

/**
 * Deletes a record with optimistic locking
 * 
 * @param model The Sequelize model class
 * @param id The primary key of the record to delete
 * @param version The current version of the record
 * @returns The number of deleted records (should be 1)
 * @throws OptimisticLockError if the record has been modified by another transaction
 */
export async function optimisticDelete<T extends Model>(
  model: ModelStatic<T>,
  id: string | number,
  version: number
): Promise<number> {
  const affectedCount = await model.destroy({
    where: {
      id,
      version
    } as WhereOptions<any>
  });
  
  if (affectedCount === 0) {
    throw new OptimisticLockError(
      'Optimistic locking error: The record has been modified by another transaction.'
    );
  }
  
  return affectedCount;
}

/**
 * Handles optimistic locking errors in Express controllers
 * 
 * @param error The error to handle
 * @param res The Express response object
 * @returns true if the error was handled, false otherwise
 */
export function handleOptimisticLockError(error: any, res: Response): boolean {
  if (error instanceof OptimisticLockError) {
    res.status(409).json({
      message: error.message,
      error: 'OPTIMISTIC_LOCK_ERROR'
    });
    return true;
  }
  return false;
}