import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { postCampaign } from "@/modules/campaign/campaign.controller";
import { createCampaignSchema } from "@/modules/campaign/campaign.schema";

const router = Router();

router.post("/", authenticate, validate(createCampaignSchema), postCampaign);

export { router as campaignRouter };
