import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  criticalStandardsSchema, 
  advancedStandardsSchema, 
  fullStandardsSchema,
  documentUploadSchema,
  estimateCreationSchema,
  insertEstimateItemSchema,
  validationResolutionSchema,
  insertValidationIssueSchema
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

  // Configure multer for file uploads
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  const upload = multer({ 
    storage: multerStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
      // Accept common document types
      const allowedFileTypes = [
        'application/pdf', 
        'image/jpeg', 
        'image/png', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/msword', // .doc
        'application/vnd.ms-excel', // .xls
        'application/vnd.ms-powerpoint', // .ppt
        'application/vnd.oasis.opendocument.text', // .odt
        'application/vnd.oasis.opendocument.spreadsheet', // .ods
        'application/zip',
        'application/x-zip-compressed',
        'application/octet-stream'
      ];
      
      if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File type not supported'));
      }
    }
  });

  // Document upload endpoint
  app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // In a real app, get userId from session
      const userId = 1;
      
      // Validate document metadata
      const validatedData = documentUploadSchema.parse(req.body);
      
      // Create document record
      const document = await storage.createDocument({
        userId,
        filename: req.file.filename,
        originalFilename: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        type: validatedData.type,
        description: validatedData.description || null,
        processed: false
      });
      
      // Update onboarding progress if this is a historic pricing document
      if (validatedData.type === 'pricing') {
        const progress = await storage.getOnboardingProgress(userId);
        if (progress) {
          await storage.updateOnboardingProgress(userId, {
            historicPricingUploaded: true
          });
        }
      }
      
      // We would typically start a background job to process the document here
      // For demo purposes, we'll just return success
      
      return res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Failed to upload document' });
    }
  });
  
  // Get documents endpoint
  app.get('/api/documents', async (req, res) => {
    try {
      // In a real app, get userId from session
      const userId = 1;
      
      // Get document type from query params
      const type = req.query.type as string | undefined;
      
      const documents = await storage.getDocuments(userId, type);
      return res.json(documents);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve documents' });
    }
  });
  
  // Delete document endpoint
  app.delete('/api/documents/:id', async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: 'Invalid document ID' });
      }
      
      // Get the document to check if it exists and get the file path
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Delete the document from storage
      const deleted = await storage.deleteDocument(documentId);
      
      // Delete the file from disk
      if (deleted && document.filePath) {
        try {
          fs.unlinkSync(document.filePath);
        } catch (fileError) {
          console.error('Error deleting file:', fileError);
          // Continue even if file deletion fails
        }
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete document' });
    }
  });
  
  // Materials endpoints
  app.get('/api/materials', async (req, res) => {
    try {
      // In a real app, get userId from session
      const userId = 1;
      
      // Get category from query params
      const category = req.query.category as string | undefined;
      
      const materials = await storage.getMaterials(userId, category);
      return res.json(materials);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve materials' });
    }
  });
  
  app.post('/api/materials', async (req, res) => {
    try {
      // In a real app, get userId from session
      const userId = 1;
      
      const materialSchema = z.object({
        name: z.string(),
        category: z.string(),
        unit: z.string(),
        unitPrice: z.number().nullable().optional(),
        supplier: z.string().nullable().optional(),
        notes: z.string().nullable().optional()
      });
      
      const validatedData = materialSchema.parse(req.body);
      
      const material = await storage.createMaterial({
        ...validatedData,
        userId,
        unitPrice: validatedData.unitPrice ?? null,
        supplier: validatedData.supplier ?? null,
        notes: validatedData.notes ?? null
      });
      
      return res.status(201).json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: 'Failed to create material' });
    }
  });
  
  // Estimates endpoints
  app.get('/api/estimates', async (req, res) => {
    try {
      // In a real app, get userId from session
      const userId = 1;
      
      // Get status from query params
      const status = req.query.status as string | undefined;
      
      const estimates = await storage.getEstimates(userId, status);
      return res.json(estimates);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve estimates' });
    }
  });
  
  app.get('/api/estimates/:id', async (req, res) => {
    try {
      const estimateId = parseInt(req.params.id);
      if (isNaN(estimateId)) {
        return res.status(400).json({ message: 'Invalid estimate ID' });
      }
      
      const estimate = await storage.getEstimate(estimateId);
      if (!estimate) {
        return res.status(404).json({ message: 'Estimate not found' });
      }
      
      // Get estimate items
      const items = await storage.getEstimateItems(estimateId);
      
      // Get validation issues
      const issues = await storage.getValidationIssues(estimateId);
      
      return res.json({
        estimate,
        items,
        issues
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve estimate details' });
    }
  });
  
  app.post('/api/estimates', async (req, res) => {
    try {
      // In a real app, get userId from session
      const userId = 1;
      
      const validatedData = estimateCreationSchema.parse(req.body);
      
      // Create the estimate
      const estimate = await storage.createEstimate({
        userId,
        name: validatedData.name,
        status: 'draft',
        projectType: validatedData.projectType,
        totalArea: validatedData.totalArea,
        totalCost: 0, // Will be calculated as items are added
        notes: validatedData.notes || null,
        confidenceScore: null // Will be set during validation
      });
      
      // Create estimate items if materials are provided
      if (validatedData.materials && validatedData.materials.length > 0) {
        for (const materialData of validatedData.materials) {
          await storage.createEstimateItem({
            estimateId: estimate.id,
            materialId: materialData.materialId,
            quantity: materialData.quantity,
            unitPrice: materialData.unitPrice,
            notes: materialData.notes || null
          });
        }
      }
      
      return res.status(201).json(estimate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: 'Failed to create estimate' });
    }
  });
  
  app.patch('/api/estimates/:id', async (req, res) => {
    try {
      const estimateId = parseInt(req.params.id);
      if (isNaN(estimateId)) {
        return res.status(400).json({ message: 'Invalid estimate ID' });
      }
      
      const estimate = await storage.getEstimate(estimateId);
      if (!estimate) {
        return res.status(404).json({ message: 'Estimate not found' });
      }
      
      const updateSchema = z.object({
        name: z.string().optional(),
        status: z.string().optional(),
        projectType: z.string().optional(),
        totalArea: z.number().optional(),
        notes: z.string().nullable().optional(),
        confidenceScore: z.number().nullable().optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      const updatedEstimate = await storage.updateEstimate(estimateId, validatedData);
      
      return res.json(updatedEstimate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: 'Failed to update estimate' });
    }
  });
  
  // Estimate items endpoints
  app.post('/api/estimates/:id/items', async (req, res) => {
    try {
      const estimateId = parseInt(req.params.id);
      if (isNaN(estimateId)) {
        return res.status(400).json({ message: 'Invalid estimate ID' });
      }
      
      const estimate = await storage.getEstimate(estimateId);
      if (!estimate) {
        return res.status(404).json({ message: 'Estimate not found' });
      }
      
      const validatedData = insertEstimateItemSchema.parse({
        ...req.body,
        estimateId
      });
      
      const item = await storage.createEstimateItem(validatedData);
      
      return res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: 'Failed to add estimate item' });
    }
  });
  
  app.patch('/api/estimate-items/:id', async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid item ID' });
      }
      
      const item = await storage.getEstimateItem(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Estimate item not found' });
      }
      
      const updateSchema = z.object({
        quantity: z.number().optional(),
        unitPrice: z.number().optional(),
        notes: z.string().nullable().optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      const updatedItem = await storage.updateEstimateItem(itemId, validatedData);
      
      return res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: 'Failed to update estimate item' });
    }
  });
  
  app.delete('/api/estimate-items/:id', async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid item ID' });
      }
      
      const deleted = await storage.deleteEstimateItem(itemId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Estimate item not found' });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete estimate item' });
    }
  });
  
  // Validation endpoints
  app.post('/api/estimates/:id/validate', async (req, res) => {
    try {
      const estimateId = parseInt(req.params.id);
      if (isNaN(estimateId)) {
        return res.status(400).json({ message: 'Invalid estimate ID' });
      }
      
      const estimate = await storage.getEstimate(estimateId);
      if (!estimate) {
        return res.status(404).json({ message: 'Estimate not found' });
      }
      
      // Get user's standards to validate against
      const userId = estimate.userId;
      const standards = await storage.getCompanyStandards(userId);
      
      if (!standards) {
        return res.status(400).json({ 
          message: 'Cannot validate estimate without company standards' 
        });
      }
      
      // Get estimate items
      const items = await storage.getEstimateItems(estimateId);
      
      if (items.length === 0) {
        return res.status(400).json({ 
          message: 'Cannot validate empty estimate' 
        });
      }
      
      // In a real app, we would run sophisticated validation based on the standards
      // For demo purposes, we'll create some sample validation issues
      
      // Calculate a confidence score (0-100)
      const confidenceScore = Math.floor(Math.random() * 30) + 70; // Between 70-99
      
      // Update the estimate with the confidence score and status
      await storage.updateEstimate(estimateId, {
        confidenceScore,
        status: 'validating'
      });
      
      // Create some validation issues
      const issueTypes = ['ambiguity', 'standards_deviation', 'pricing_anomaly'];
      const issueStatuses = ['open', 'pending_review'];
      
      const issueCount = Math.floor(Math.random() * 3) + 1; // 1-3 issues
      
      const issues = [];
      for (let i = 0; i < issueCount; i++) {
        const type = issueTypes[Math.floor(Math.random() * issueTypes.length)];
        const status = issueStatuses[Math.floor(Math.random() * issueStatuses.length)];
        
        let description = '';
        if (type === 'ambiguity') {
          description = 'Unclear specification for material quantity calculation';
        } else if (type === 'standards_deviation') {
          description = 'Selected material does not meet company quality standards';
        } else {
          description = 'Unit price is 15% higher than historical pricing data';
        }
        
        const issue = await storage.createValidationIssue({
          estimateId,
          type,
          status,
          description,
          resolution: null,
          assignedTo: null
        });
        
        issues.push(issue);
      }
      
      return res.json({
        estimateId,
        confidenceScore,
        issues
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to validate estimate' });
    }
  });
  
  app.post('/api/validation-issues/:id/resolve', async (req, res) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: 'Invalid issue ID' });
      }
      
      const issue = await storage.getValidationIssue(issueId);
      if (!issue) {
        return res.status(404).json({ message: 'Validation issue not found' });
      }
      
      const validatedData = validationResolutionSchema.parse(req.body);
      
      const updatedIssue = await storage.updateValidationIssue(issueId, {
        status: 'resolved',
        resolution: validatedData.resolution,
        assignedTo: validatedData.assignedTo || null
      });
      
      // Check if all issues for this estimate are resolved
      const estimateId = issue.estimateId;
      const openIssues = await storage.getValidationIssues(estimateId, 'open');
      const pendingIssues = await storage.getValidationIssues(estimateId, 'pending_review');
      
      // If all issues are resolved, update the estimate status
      if (openIssues.length === 0 && pendingIssues.length === 0) {
        await storage.updateEstimate(estimateId, {
          status: 'validated'
        });
      }
      
      return res.json(updatedIssue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: 'Failed to resolve validation issue' });
    }
  });
  
  // Submit estimate endpoint
  app.post('/api/estimates/:id/submit', async (req, res) => {
    try {
      const estimateId = parseInt(req.params.id);
      if (isNaN(estimateId)) {
        return res.status(400).json({ message: 'Invalid estimate ID' });
      }
      
      const estimate = await storage.getEstimate(estimateId);
      if (!estimate) {
        return res.status(404).json({ message: 'Estimate not found' });
      }
      
      // Check if the estimate has been validated
      if (estimate.status !== 'validated') {
        return res.status(400).json({ 
          message: 'Estimate must be validated before submission' 
        });
      }
      
      // Update the estimate status to submitted
      const updatedEstimate = await storage.updateEstimate(estimateId, {
        status: 'submitted'
      });
      
      return res.json(updatedEstimate);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to submit estimate' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
