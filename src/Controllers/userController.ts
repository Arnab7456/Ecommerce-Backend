import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { createuserSchema } from "../utils/validSchema";
const prisma = new PrismaClient();

export const registerUser = async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    try {
      const validatedData = createuserSchema.parse(req.body);
  
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });
  
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
  
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
  
      const user = await prisma.user.create({
        data: {
          ...validatedData,
          password: hashedPassword
        },
        select: { 
          id: true, 
          email: true, 
          name: true 
        }
      });
  
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };


export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validedData = createuserSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({
      where: { email: validedData.email },
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(validedData.password, 12);
    const user = await prisma.user.create({
      data: {
        ...validedData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
};

export const updateUserProfile = async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    try {
      const { name, email } = req.body;
  
      const updatedUser = await prisma.user.update({
        // @ts-ignore
        where: { id: req.user!.id },
        data: { 
          ...(name && { name }),
          ...(email && { email }) 
        },
        select: { 
          id: true, 
          email: true, 
          name: true 
        }
      });
  
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  };
  
  export const listUsers = async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    try {
      const users = await prisma.user.findMany({
        select: { 
          id: true, 
          email: true, 
          name: true,
          role: true,
          createdAt: true 
        }
      });
  
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    next(error);
  }
};
