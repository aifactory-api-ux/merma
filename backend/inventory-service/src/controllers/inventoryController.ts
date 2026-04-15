import { Request, Response } from 'express';

export const getInventoryOverview = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Stub: getInventoryOverview' });
};

export const getAllItems = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Stub: getAllItems' });
};

export const createItem = (req: Request, res: Response) => {
  res.status(201).json({ message: 'Stub: createItem' });
};
