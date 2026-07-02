import { z } from "zod";

export const createCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Tiêu đề không được để trống").max(255),
    description: z.string().min(1, "Mô tả không được để trống"),
    goalAmount: z
      .number({ invalid_type_error: "Số tiền mục tiêu phải là số" })
      .positive("Số tiền mục tiêu phải lớn hơn 0"),
    categoryId: z.string().regex(/^\d+$/, "categoryId không hợp lệ").optional(),
    startDate: z.coerce.date({ invalid_type_error: "Ngày bắt đầu không hợp lệ" }),
    endDate: z.coerce.date({ invalid_type_error: "Ngày kết thúc không hợp lệ" }).optional(),
  }),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>["body"];
