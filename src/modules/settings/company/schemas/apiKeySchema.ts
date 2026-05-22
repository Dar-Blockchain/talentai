import { z } from "zod";
import { AVAILABLE_SCOPES } from "@/modules/settings/shared/constants";

export const keyFormSchema = z.object({
  name:        z.string().min(1, "Key name is required"),
  serviceName: z.string().optional().default(""),
  scopes:      z.array(z.string()),
  rateLimit:   z.coerce.number().min(1, "Must be at least 1"),
  expiresAt:   z.string().min(1, "Expiry date is required"),
  ipMode:      z.enum(["all", "custom"]),
  ipList:      z.string(),
});

export type KeyFormState = z.infer<typeof keyFormSchema>;

export const DEFAULT_FORM: KeyFormState = {
  name:        "",
  serviceName: "",
  scopes:      AVAILABLE_SCOPES as string[],
  rateLimit:   5,
  expiresAt:   "2027-12-31",
  ipMode:      "all",
  ipList:      "",
};
