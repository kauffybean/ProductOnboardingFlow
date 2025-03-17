import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Company Standards schema
export const companyStandards = pgTable("company_standards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Reference to the user who created these standards
  
  // Critical Standards (Required)
  drywallWasteFactor: integer("drywall_waste_factor").notNull(), // Stored as integer percentage (e.g. 10 for 10%)
  flooringWasteFactor: integer("flooring_waste_factor").notNull(),
  standardCeilingHeight: integer("standard_ceiling_height").notNull(), // Stored in inches
  flooringInstallationMethod: text("flooring_installation_method").notNull(),
  preferredHvacBrand: text("preferred_hvac_brand").notNull(),
  
  // Advanced Standards (Optional)
  drywallFinishLevel: text("drywall_finish_level"),
  paintFinishStandard: text("paint_finish_standard"),
  wallFramingStandard: text("wall_framing_standard"),
  doorMaterialStandard: text("door_material_standard"),
  ceilingTileBrand: text("ceiling_tile_brand"),
  restroomFixtureBrand: text("restroom_fixture_brand"),
  
  // Metadata
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

export const insertCompanyStandardsSchema = createInsertSchema(companyStandards)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertCompanyStandards = z.infer<typeof insertCompanyStandardsSchema>;
export type CompanyStandards = typeof companyStandards.$inferSelect;

// Onboarding Progress schema
export const onboardingProgress = pgTable("onboarding_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  standardsSetupComplete: boolean("standards_setup_complete").notNull().default(false),
  historicPricingUploaded: boolean("historic_pricing_uploaded").notNull().default(false),
  firstEstimateCreated: boolean("first_estimate_created").notNull().default(false),
  estimateValidated: boolean("estimate_validated").notNull().default(false),
  firstBidSubmitted: boolean("first_bid_submitted").notNull().default(false),
});

export const insertOnboardingProgressSchema = createInsertSchema(onboardingProgress)
  .omit({ id: true });

export type InsertOnboardingProgress = z.infer<typeof insertOnboardingProgressSchema>;
export type OnboardingProgress = typeof onboardingProgress.$inferSelect;

// Form schemas for the standards wizard
export const criticalStandardsSchema = z.object({
  drywallWasteFactor: z.number().min(0).max(100),
  flooringWasteFactor: z.number().min(0).max(100),
  standardCeilingHeight: z.number().min(7).max(30),
  flooringInstallationMethod: z.enum(["adhesive", "floating", "nailed", "glue-down"]),
  preferredHvacBrand: z.enum(["carrier", "trane", "lennox", "daikin"]),
});

export const advancedStandardsSchema = z.object({
  drywallFinishLevel: z.enum(["level3", "level4", "level5"]).optional(),
  paintFinishStandard: z.enum(["flat", "eggshell", "satin", "semi-gloss", "gloss"]).optional(),
  wallFramingStandard: z.enum(["wood-16oc", "metal-16oc", "metal-24oc"]).optional(),
  doorMaterialStandard: z.enum(["hollow", "solid", "fire-rated"]).optional(),
  ceilingTileBrand: z.enum(["armstrong", "usg", "certainteed"]).optional(),
  restroomFixtureBrand: z.enum(["kohler", "toto", "american-standard"]).optional(),
});

export type CriticalStandards = z.infer<typeof criticalStandardsSchema>;
export type AdvancedStandards = z.infer<typeof advancedStandardsSchema>;

export const fullStandardsSchema = criticalStandardsSchema.merge(advancedStandardsSchema);
export type FullStandards = z.infer<typeof fullStandardsSchema>;
