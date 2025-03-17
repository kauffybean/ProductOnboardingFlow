import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
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
  projectType: text("project_type").notNull(), // 'commercial', 'residential', 'renovation'
  
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
  
  // Commercial-specific standards
  commercialFireRating: text("commercial_fire_rating"),
  commercialAccessibilityStandard: text("commercial_accessibility_standard"),
  commercialFlooringType: text("commercial_flooring_type"),
  
  // Residential-specific standards
  residentialInsulationRValue: integer("residential_insulation_r_value"),
  residentialWindowType: text("residential_window_type"),
  residentialFlooringType: text("residential_flooring_type"),
  
  // Renovation-specific standards
  demolitionWasteFactor: integer("demolition_waste_factor"),
  hazardousMaterialHandling: text("hazardous_material_handling"),
  
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

// Documents schema (for schematic and pricing uploads)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'schematic', 'pricing', 'material_list'
  filePath: text("file_path").notNull(), 
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  processed: boolean("processed").notNull().default(false),
  uploadedAt: text("uploaded_at").notNull(), // ISO date string
  description: text("description"),
  filename: text("filename"),
  originalFilename: text("original_filename"),
});

export const insertDocumentSchema = createInsertSchema(documents)
  .omit({ id: true, processed: true });

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Materials schema
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(), // e.g. 'drywall', 'flooring', 'paint', etc.
  name: text("name").notNull(),
  unit: text("unit").notNull(), // e.g. 'sqft', 'sheet', 'gallon', etc.
  unitPrice: integer("unit_price"), // In cents
  supplier: text("supplier"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

export const insertMaterialSchema = createInsertSchema(materials)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;

// Estimates schema
export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  projectType: text("project_type").notNull(), // e.g. 'commercial', 'residential', 'renovation'
  totalArea: integer("total_area").notNull(), // In square feet
  totalCost: integer("total_cost").notNull(), // In cents
  status: text("status").notNull(), // 'draft', 'in_progress', 'validated', 'submitted'
  confidenceScore: integer("confidence_score"), // 0-100
  notes: text("notes"),
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

export const insertEstimateSchema = createInsertSchema(estimates);

export type InsertEstimate = z.infer<typeof insertEstimateSchema>;
export type Estimate = typeof estimates.$inferSelect;

// Estimate Items (Bill of Materials)
export const estimateItems = pgTable("estimate_items", {
  id: serial("id").primaryKey(),
  estimateId: integer("estimate_id").notNull(),
  materialId: integer("material_id").notNull(),
  materialName: text("material_name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  unitPrice: integer("unit_price").notNull(), // In cents
  totalPrice: integer("total_price").notNull(), // In cents (quantity * unitPrice)
  wasteFactor: integer("waste_factor"), // In percentage
  description: text("description"),
  priceSource: text("price_source"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

export const insertEstimateItemSchema = createInsertSchema(estimateItems)
  .omit({ id: true });

export type InsertEstimateItem = z.infer<typeof insertEstimateItemSchema>;
export type EstimateItem = typeof estimateItems.$inferSelect;

// Validation Issues
export const validationIssues = pgTable("validation_issues", {
  id: serial("id").primaryKey(),
  estimateId: integer("estimate_id").notNull(),
  type: text("type").notNull(), // 'ambiguity', 'missing_info', 'pricing_discrepancy', 'material_selection'
  description: text("description").notNull(),
  status: text("status").notNull(), // 'open', 'resolved', 'delegated'
  resolution: text("resolution"),
  assignedTo: text("assigned_to"), // SME username if delegated
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

export const insertValidationIssueSchema = createInsertSchema(validationIssues)
  .omit({ id: true });

export type InsertValidationIssue = z.infer<typeof insertValidationIssueSchema>;
export type ValidationIssue = typeof validationIssues.$inferSelect;

// Form schemas for the standards wizard
export const criticalStandardsSchema = z.object({
  projectType: z.enum(["commercial", "residential", "renovation"]),
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

// Commercial-specific standards schema
export const commercialStandardsSchema = z.object({
  commercialFireRating: z.enum(["1-hour", "2-hour", "3-hour", "4-hour"]).optional(),
  commercialAccessibilityStandard: z.enum(["ada", "ansi-a117", "ibc"]).optional(),
  commercialFlooringType: z.enum(["carpet-tile", "vct", "luxury-vinyl", "polished-concrete"]).optional(),
});

// Residential-specific standards schema
export const residentialStandardsSchema = z.object({
  residentialInsulationRValue: z.number().min(0).max(60).optional(),
  residentialWindowType: z.enum(["single-pane", "double-pane", "triple-pane", "low-e"]).optional(),
  residentialFlooringType: z.enum(["hardwood", "laminate", "carpet", "tile"]).optional(),
});

// Renovation-specific standards schema
export const renovationStandardsSchema = z.object({
  demolitionWasteFactor: z.number().min(0).max(100).optional(),
  hazardousMaterialHandling: z.enum(["containment", "removal", "encapsulation", "abatement"]).optional(),
});

// Form schema for document upload
export const documentUploadSchema = z.object({
  name: z.string().min(1, "File name is required"),
  type: z.enum(["schematic", "pricing", "material_list"]),
  description: z.string().optional(),
});

// Form schema for estimate creation
export const estimateCreationSchema = z.object({
  name: z.string().min(1, "Estimate name is required"),
  projectType: z.enum(["commercial", "residential", "renovation"]),
  totalArea: z.number().min(1, "Area is required"),
  totalCost: z.number().optional(),
  status: z.string().optional(),
  confidenceScore: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  notes: z.string().optional(),
});

// Form schema for validation issue resolution
export const validationResolutionSchema = z.object({
  resolution: z.string().min(1, "Resolution is required"),
  status: z.enum(["resolved", "delegated"]),
  assignedTo: z.string().optional(),
});

export type CriticalStandards = z.infer<typeof criticalStandardsSchema>;
export type AdvancedStandards = z.infer<typeof advancedStandardsSchema>;
export type CommercialStandards = z.infer<typeof commercialStandardsSchema>;
export type ResidentialStandards = z.infer<typeof residentialStandardsSchema>;
export type RenovationStandards = z.infer<typeof renovationStandardsSchema>;

export const fullCommercialStandardsSchema = criticalStandardsSchema
  .merge(advancedStandardsSchema)
  .merge(commercialStandardsSchema);

export const fullResidentialStandardsSchema = criticalStandardsSchema
  .merge(advancedStandardsSchema)
  .merge(residentialStandardsSchema);

export const fullRenovationStandardsSchema = criticalStandardsSchema
  .merge(advancedStandardsSchema)
  .merge(renovationStandardsSchema);

// For backwards compatibility
export const fullStandardsSchema = criticalStandardsSchema.merge(advancedStandardsSchema);
export type FullStandards = z.infer<typeof fullStandardsSchema>;

// Project-type specific full standards
export type FullCommercialStandards = z.infer<typeof fullCommercialStandardsSchema>;
export type FullResidentialStandards = z.infer<typeof fullResidentialStandardsSchema>;
export type FullRenovationStandards = z.infer<typeof fullRenovationStandardsSchema>;
