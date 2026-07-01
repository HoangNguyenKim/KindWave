import type { Request, Response, NextFunction } from "express";
import { listCategories } from "@/modules/category/category.service";

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await listCategories();
    res.status(200).json({
      success: true,
      data: categories,
      message: "Lấy danh sách danh mục thành công",
    });
  } catch (error) {
    next(error);
  }
};
