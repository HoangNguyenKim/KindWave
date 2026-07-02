import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "@/errors/app.error";
import { createCampaign } from "@/modules/campaign/campaign.service";
import type { CreateCampaignInput } from "@/modules/campaign/campaign.schema";

export const postCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Chưa xác thực");
    }
    const campaign = await createCampaign(req.user.id, req.body as CreateCampaignInput);
    res.status(201).json({
      success: true,
      data: campaign,
      message: "Tạo chiến dịch thành công, đang chờ duyệt",
    });
  } catch (error) {
    next(error);
  }
};
