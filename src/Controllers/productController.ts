import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createProductSchema } from '../utils/validSchema';

const prisma = new PrismaClient();

export const createProduct = async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    try {
      const validatedData = createProductSchema.parse(req.body);
  
      const product = await prisma.product.create({
        data: validatedData
      });
  
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };
  
  export const listProducts = async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    try {
      const { category, minPrice, maxPrice } = req.query;
      const products = await prisma.product.findMany({
        where: {
          ...(category && { category: category as string }),
          ...(minPrice && { price: { gte: Number(minPrice) } }),
          ...(maxPrice && { price: { lte: Number(maxPrice) } }),
        }
      });
  
      res.json(products);
    } catch (error) {
      next(error);
    }
  };

export const getProductById = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = createProductSchema.parse(req.body);

    const product = await prisma.product.update({
      where: { id },
      data: validatedData
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};