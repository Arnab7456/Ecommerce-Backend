import { Request, Response, NextFunction } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { createOrderSchema } from '../utils/validSchema';

const prisma = new PrismaClient();

export const createOrder = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const validatedData = createOrderSchema.parse({
      ...req.body,
      // @ts-ignore
      userId: req.user!.id
    });

    // Calculate total price
    const orderItems = await Promise.all(
      validatedData.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        };
      })
    );

    const total = orderItems.reduce(
      (sum, item) => sum + (Number(item.price) * item.quantity), 
      0
    );

    // Create order with transaction to ensure stock update
    const order = await prisma.$transaction(async (tx) => {
      // Update product stocks
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { 
            stock: { decrement: item.quantity } 
          }
        });
      }

      // Create order
      return tx.order.create({
        data: {
            // @ts-ignore
          userId: req.user!.id,
          total,
          orderItems: {
            create: orderItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const orders = await prisma.order.findMany({
        // @ts-ignore
      where: { userId: req.user!.id },
      include: { 
        orderItems: { 
          include: { product: true } 
        } 
      }
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const orders = await prisma.order.findMany({
      include: { 
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true 
          } 
        },
        orderItems: { 
          include: { product: true } 
        } 
      }
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
};