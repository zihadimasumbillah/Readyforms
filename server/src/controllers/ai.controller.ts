import { Request, Response } from 'express';
import { generateForm, improveForm } from '../services/ai.service';

export const generateFormController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ message: 'A prompt string is required' });
      return;
    }

    if (prompt.trim().length > 2000) {
      res.status(400).json({ message: 'Prompt must be under 2000 characters' });
      return;
    }

    const formData = await generateForm(prompt.trim());
    res.status(200).json(formData);
  } catch (error) {
    console.error('Error generating form:', error);
    res.status(500).json({
      message: 'Failed to generate form',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

export const improveFormController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { formData, instructions } = req.body;

    if (!formData || typeof formData !== 'object') {
      res.status(400).json({ message: 'Form data object is required' });
      return;
    }

    const improvedData = await improveForm(formData, instructions);
    res.status(200).json(improvedData);
  } catch (error) {
    console.error('Error improving form:', error);
    res.status(500).json({
      message: 'Failed to improve form',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};
