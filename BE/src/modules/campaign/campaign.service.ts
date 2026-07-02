import DOMPurify from "isomorphic-dompurify";
import { CampaignStatus } from "@prisma/client";
import { prisma } from "@/config/prisma.client";
import { BadRequestError } from "@/errors/app.error";
import type { CreateCampaignInput } from "@/modules/campaign/campaign.schema";

export interface CampaignDto {
  id: string;
  title: string;
  description: string;
  goalAmount: string;
  raisedAmount: string;
  status: CampaignStatus;
  organizerId: string;
  categoryId: string | null;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
}

const toCampaignDto = (campaign: {
  id: bigint;
  title: string;
  description: string;
  goalAmount: { toString: () => string };
  raisedAmount: { toString: () => string };
  status: CampaignStatus;
  organizerId: bigint;
  categoryId: bigint | null;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
}): CampaignDto => ({
  id: campaign.id.toString(),
  title: campaign.title,
  description: campaign.description,
  goalAmount: campaign.goalAmount.toString(),
  raisedAmount: campaign.raisedAmount.toString(),
  status: campaign.status,
  organizerId: campaign.organizerId.toString(),
  categoryId: campaign.categoryId ? campaign.categoryId.toString() : null,
  startDate: campaign.startDate,
  endDate: campaign.endDate,
  createdAt: campaign.createdAt,
});

export const createCampaign = async (
  organizerId: string,
  input: CreateCampaignInput
): Promise<CampaignDto> => {
  if (input.endDate && input.endDate <= input.startDate) {
    throw new BadRequestError("Ngày kết thúc phải sau ngày bắt đầu");
  }

  let categoryId: bigint | null = null;
  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: BigInt(input.categoryId) },
      select: { id: true },
    });
    if (!category) {
      throw new BadRequestError("Danh mục không tồn tại");
    }
    categoryId = category.id;
  }

  const cleanDescription = DOMPurify.sanitize(input.description);

  const campaign = await prisma.campaign.create({
    data: {
      title: input.title,
      description: cleanDescription,
      goalAmount: input.goalAmount,
      status: CampaignStatus.DRAFT,
      organizerId: BigInt(organizerId),
      categoryId,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
    },
  });

  return toCampaignDto(campaign);
};
