import { z } from "zod";

export const emailInput = z.string().trim().toLowerCase().email().max(254);
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().default("");
const webUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (v) => !v || (/^https?:\/\//i.test(v) && URL.canParse(v)),
    "Use an http or https URL.",
  )
  .optional()
  .default("");
const imageUrl = z
  .string()
  .refine(
    (v) =>
      !v ||
      /^\/media\/[a-f0-9-]+\.webp$/.test(v) ||
      /^\/images\/[a-z0-9-]+\.(svg|webp)$/.test(v),
    "Upload an image first.",
  )
  .optional()
  .default("");
export const categoryInput = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Enter a category name.").max(100),
  description: optionalText(500),
});
export const itemInput = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Enter an item title.").max(150),
  description: optionalText(1000),
  price: z
    .string()
    .regex(
      /^\d{1,8}(\.\d{1,2})?$/,
      "Enter a price from 0 to 99999999.99 with at most two decimal places.",
    ),
  categoryIds: z
    .array(z.string().min(1))
    .min(1, "Choose at least one category.")
    .max(100)
    .refine((v) => new Set(v).size === v.length, "Duplicate category."),
  photoUrl: imageUrl,
  isHidden: z.boolean().optional().default(false),
});
export const pageInput = z.preprocess(
  (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        item === null ? "" : item,
      ]),
    );
  },
  z.object({
    pageTitle: optionalText(150),
    description: optionalText(2000),
    bannerImageUrl: imageUrl,
    address: optionalText(500),
    phone: optionalText(40),
    contactEmail: z
      .union([z.literal(""), emailInput])
      .optional()
      .default(""),
    mapUrl: webUrl,
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .refine((v) => {
        try {
          return Intl.supportedValuesOf("currency").includes(v);
        } catch {
          return ["EGP", "USD", "EUR", "GBP", "AED", "SAR"].includes(v);
        }
      }, "Choose a valid currency."),
  }),
);
export const signupInput = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: emailInput,
    password: z.string().min(12, "Use at least 12 characters.").max(72),
    restaurant: z.string().trim().min(1).max(100).optional(),
    inviteToken: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
  })
  .refine((v) => v.restaurant || v.inviteToken, "Enter a restaurant name.");
export const loginInput = z.object({
  email: emailInput,
  password: z.string().min(1).max(72),
});
export const orderInput = z.object({
  ids: z.array(z.string()).max(2000),
  categoryId: z.string().optional(),
});
export function assertOrder(ids: string[], expected: string[]) {
  if (
    ids.length !== expected.length ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !expected.includes(id))
  )
    throw new Error("The list changed. Refresh and try again.");
}
export function invitationUsable(
  invite: { status: string; expiresAt: Date },
  now = new Date(),
) {
  return invite.status === "PENDING" && invite.expiresAt > now;
}
