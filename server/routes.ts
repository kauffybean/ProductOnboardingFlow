import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  criticalStandardsSchema, 
  advancedStandardsSchema, 
  fullStandardsSchema 
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user's company standards
  app.get("/api/standards", async (req, res) => {
    // In a real app, we would get the userId from the session
    // For demo purposes, we'll use a fixed userId
    const userId = 1;
    
    const standards = await storage.getCompanyStandards(userId);
    
    if (!standards) {
      return res.status(404).json({ message: "Standards not found" });
    }
    
    return res.json(standards);
  });
  
  // Save company standards
  app.post("/api/standards", async (req, res) => {
    try {
      // In a real app, we'd get the userId from the session
      const userId = 1;
      
      // Validate input using Zod schema
      const validatedData = fullStandardsSchema.parse(req.body);
      
      // Check if standards already exist for this user
      const existingStandards = await storage.getCompanyStandards(userId);
      
      if (existingStandards) {
        // Update existing standards
        const updatedStandards = await storage.updateCompanyStandards(userId, {
          ...validatedData,
          userId
        });
        
        return res.json(updatedStandards);
      } else {
        // Create new standards
        const newStandards = await storage.createCompanyStandards({
          ...validatedData,
          userId
        });
        
        return res.status(201).json(newStandards);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: "Failed to save standards" });
    }
  });
  
  // Get onboarding progress
  app.get("/api/onboarding-progress", async (req, res) => {
    // In a real app, we would get the userId from the session
    const userId = 1;
    
    const progress = await storage.getOnboardingProgress(userId);
    
    if (!progress) {
      // Create initial progress for this user
      const initialProgress = await storage.createOnboardingProgress({
        userId,
        standardsSetupComplete: false,
        historicPricingUploaded: false,
        firstEstimateCreated: false,
        estimateValidated: false,
        firstBidSubmitted: false
      });
      
      return res.json(initialProgress);
    }
    
    return res.json(progress);
  });
  
  // Update onboarding progress
  app.patch("/api/onboarding-progress", async (req, res) => {
    try {
      // In a real app, we'd get the userId from the session
      const userId = 1;
      
      const updateSchema = z.object({
        standardsSetupComplete: z.boolean().optional(),
        historicPricingUploaded: z.boolean().optional(),
        firstEstimateCreated: z.boolean().optional(),
        estimateValidated: z.boolean().optional(),
        firstBidSubmitted: z.boolean().optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Check if progress exists for this user
      const existingProgress = await storage.getOnboardingProgress(userId);
      
      if (existingProgress) {
        // Update existing progress
        const updatedProgress = await storage.updateOnboardingProgress(userId, validatedData);
        return res.json(updatedProgress);
      } else {
        // Create new progress
        const newProgress = await storage.createOnboardingProgress({
          userId,
          ...validatedData,
          standardsSetupComplete: validatedData.standardsSetupComplete ?? false,
          historicPricingUploaded: validatedData.historicPricingUploaded ?? false,
          firstEstimateCreated: validatedData.firstEstimateCreated ?? false,
          estimateValidated: validatedData.estimateValidated ?? false,
          firstBidSubmitted: validatedData.firstBidSubmitted ?? false
        });
        
        return res.status(201).json(newProgress);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: "Failed to update onboarding progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
