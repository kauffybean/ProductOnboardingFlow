import { 
  users, type User, type InsertUser,
  companyStandards, type CompanyStandards, type InsertCompanyStandards,
  onboardingProgress, type OnboardingProgress, type InsertOnboardingProgress,
  documents, type Document, type InsertDocument,
  materials, type Material, type InsertMaterial,
  estimates, type Estimate, type InsertEstimate,
  estimateItems, type EstimateItem, type InsertEstimateItem,
  validationIssues, type ValidationIssue, type InsertValidationIssue,
  type FullStandards
} from "@shared/schema";

// Interface for storage methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Company Standards methods
  getCompanyStandards(userId: number): Promise<CompanyStandards | undefined>;
  createCompanyStandards(standards: InsertCompanyStandards): Promise<CompanyStandards>;
  updateCompanyStandards(userId: number, standards: Partial<InsertCompanyStandards>): Promise<CompanyStandards | undefined>;
  
  // Onboarding Progress methods
  getOnboardingProgress(userId: number): Promise<OnboardingProgress | undefined>;
  createOnboardingProgress(progress: InsertOnboardingProgress): Promise<OnboardingProgress>;
  updateOnboardingProgress(userId: number, progress: Partial<InsertOnboardingProgress>): Promise<OnboardingProgress | undefined>;
  
  // Document methods
  getDocuments(userId: number, type?: string): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Material methods
  getMaterials(userId: number, category?: string): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material | undefined>;
  deleteMaterial(id: number): Promise<boolean>;
  
  // Estimate methods
  getEstimates(userId: number, status?: string): Promise<Estimate[]>;
  getEstimate(id: number): Promise<Estimate | undefined>;
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  updateEstimate(id: number, estimate: Partial<InsertEstimate>): Promise<Estimate | undefined>;
  deleteEstimate(id: number): Promise<boolean>;
  
  // Estimate Items methods
  getEstimateItems(estimateId: number): Promise<EstimateItem[]>;
  getEstimateItem(id: number): Promise<EstimateItem | undefined>;
  createEstimateItem(item: InsertEstimateItem): Promise<EstimateItem>;
  updateEstimateItem(id: number, item: Partial<InsertEstimateItem>): Promise<EstimateItem | undefined>;
  deleteEstimateItem(id: number): Promise<boolean>;
  
  // Validation Issues methods
  getValidationIssues(estimateId: number, status?: string): Promise<ValidationIssue[]>;
  getValidationIssue(id: number): Promise<ValidationIssue | undefined>;
  createValidationIssue(issue: InsertValidationIssue): Promise<ValidationIssue>;
  updateValidationIssue(id: number, issue: Partial<InsertValidationIssue>): Promise<ValidationIssue | undefined>;
  deleteValidationIssue(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private standards: Map<number, CompanyStandards>; // Indexed by userId
  private progress: Map<number, OnboardingProgress>; // Indexed by userId
  private documents: Map<number, Document>;
  private materials: Map<number, Material>;
  private estimates: Map<number, Estimate>;
  private estimateItems: Map<number, EstimateItem>;
  private validationIssues: Map<number, ValidationIssue>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.standards = new Map();
    this.progress = new Map();
    this.documents = new Map();
    this.materials = new Map();
    this.estimates = new Map();
    this.estimateItems = new Map();
    this.validationIssues = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Company Standards methods
  async getCompanyStandards(userId: number): Promise<CompanyStandards | undefined> {
    return Array.from(this.standards.values()).find(
      (standard) => standard.userId === userId,
    );
  }

  async createCompanyStandards(insertStandards: InsertCompanyStandards): Promise<CompanyStandards> {
    const id = this.currentId++;
    const now = new Date().toISOString();
    const standards: CompanyStandards = {
      ...insertStandards,
      id,
      createdAt: now,
      updatedAt: now,
      // Ensure all nullable fields are explicitly set
      drywallFinishLevel: insertStandards.drywallFinishLevel ?? null,
      preferredLightFixtureBrand: insertStandards.preferredLightFixtureBrand ?? null,
      restroomFixtureBrand: insertStandards.restroomFixtureBrand ?? null
    };
    this.standards.set(id, standards);
    
    // Update onboarding progress
    const progress = await this.getOnboardingProgress(insertStandards.userId);
    if (progress) {
      await this.updateOnboardingProgress(insertStandards.userId, {
        standardsSetupComplete: true
      });
    } else {
      await this.createOnboardingProgress({
        userId: insertStandards.userId,
        standardsSetupComplete: true,
        historicPricingUploaded: false,
        firstEstimateCreated: false,
        estimateValidated: false,
        firstBidSubmitted: false
      });
    }
    
    return standards;
  }

  async updateCompanyStandards(userId: number, updateStandards: Partial<InsertCompanyStandards>): Promise<CompanyStandards | undefined> {
    const existingStandards = await this.getCompanyStandards(userId);
    if (!existingStandards) return undefined;

    const updatedStandards: CompanyStandards = {
      ...existingStandards,
      ...updateStandards,
      updatedAt: new Date().toISOString(),
    };

    this.standards.set(existingStandards.id, updatedStandards);
    return updatedStandards;
  }

  // Onboarding Progress methods
  async getOnboardingProgress(userId: number): Promise<OnboardingProgress | undefined> {
    return Array.from(this.progress.values()).find(
      (progress) => progress.userId === userId,
    );
  }

  async createOnboardingProgress(insertProgress: InsertOnboardingProgress): Promise<OnboardingProgress> {
    const id = this.currentId++;
    const progress: OnboardingProgress = {
      ...insertProgress,
      id,
      standardsSetupComplete: insertProgress.standardsSetupComplete ?? false,
      historicPricingUploaded: insertProgress.historicPricingUploaded ?? false,
      firstEstimateCreated: insertProgress.firstEstimateCreated ?? false,
      estimateValidated: insertProgress.estimateValidated ?? false,
      firstBidSubmitted: insertProgress.firstBidSubmitted ?? false
    };
    this.progress.set(id, progress);
    return progress;
  }

  async updateOnboardingProgress(
    userId: number,
    updateProgress: Partial<InsertOnboardingProgress>
  ): Promise<OnboardingProgress | undefined> {
    const existingProgress = await this.getOnboardingProgress(userId);
    if (!existingProgress) return undefined;

    const updatedProgress: OnboardingProgress = {
      ...existingProgress,
      ...updateProgress,
    };

    this.progress.set(existingProgress.id, updatedProgress);
    return updatedProgress;
  }

  // Document methods
  async getDocuments(userId: number, type?: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId && (!type || doc.type === type)
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const now = new Date().toISOString();
    const document: Document = {
      ...insertDocument,
      id,
      processed: false,
      uploadedAt: now
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, updateDocument: Partial<InsertDocument>): Promise<Document | undefined> {
    const existingDocument = await this.getDocument(id);
    if (!existingDocument) return undefined;

    const updatedDocument: Document = {
      ...existingDocument,
      ...updateDocument,
    };

    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    if (!this.documents.has(id)) return false;
    return this.documents.delete(id);
  }

  // Material methods
  async getMaterials(userId: number, category?: string): Promise<Material[]> {
    return Array.from(this.materials.values()).filter(
      (material) => material.userId === userId && (!category || material.category === category)
    );
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const id = this.currentId++;
    const now = new Date().toISOString();
    const material: Material = {
      ...insertMaterial,
      id,
      createdAt: now,
      updatedAt: now,
      unitPrice: insertMaterial.unitPrice ?? null,
      supplier: insertMaterial.supplier ?? null,
      notes: insertMaterial.notes ?? null
    };
    this.materials.set(id, material);
    return material;
  }

  async updateMaterial(id: number, updateMaterial: Partial<InsertMaterial>): Promise<Material | undefined> {
    const existingMaterial = await this.getMaterial(id);
    if (!existingMaterial) return undefined;

    const updatedMaterial: Material = {
      ...existingMaterial,
      ...updateMaterial,
      updatedAt: new Date().toISOString()
    };

    this.materials.set(id, updatedMaterial);
    return updatedMaterial;
  }

  async deleteMaterial(id: number): Promise<boolean> {
    if (!this.materials.has(id)) return false;
    return this.materials.delete(id);
  }

  // Estimate methods
  async getEstimates(userId: number, status?: string): Promise<Estimate[]> {
    return Array.from(this.estimates.values()).filter(
      (estimate) => estimate.userId === userId && (!status || estimate.status === status)
    );
  }

  async getEstimate(id: number): Promise<Estimate | undefined> {
    return this.estimates.get(id);
  }

  async createEstimate(insertEstimate: InsertEstimate): Promise<Estimate> {
    const id = this.currentId++;
    const now = new Date().toISOString();
    const estimate: Estimate = {
      ...insertEstimate,
      id,
      createdAt: now,
      updatedAt: now,
      notes: insertEstimate.notes ?? null,
      confidenceScore: insertEstimate.confidenceScore ?? null
    };
    this.estimates.set(id, estimate);
    
    // Update onboarding progress
    const userId = insertEstimate.userId;
    const progress = await this.getOnboardingProgress(userId);
    if (progress) {
      await this.updateOnboardingProgress(userId, {
        firstEstimateCreated: true
      });
    }
    
    return estimate;
  }

  async updateEstimate(id: number, updateEstimate: Partial<InsertEstimate>): Promise<Estimate | undefined> {
    const existingEstimate = await this.getEstimate(id);
    if (!existingEstimate) return undefined;

    const updatedEstimate: Estimate = {
      ...existingEstimate,
      ...updateEstimate,
      updatedAt: new Date().toISOString()
    };

    this.estimates.set(id, updatedEstimate);
    
    // Check if status is updated to 'validated' and update onboarding progress
    if (updateEstimate.status === 'validated') {
      const userId = existingEstimate.userId;
      const progress = await this.getOnboardingProgress(userId);
      if (progress) {
        await this.updateOnboardingProgress(userId, {
          estimateValidated: true
        });
      }
    }
    
    // Check if status is updated to 'submitted' and update onboarding progress
    if (updateEstimate.status === 'submitted') {
      const userId = existingEstimate.userId;
      const progress = await this.getOnboardingProgress(userId);
      if (progress) {
        await this.updateOnboardingProgress(userId, {
          firstBidSubmitted: true
        });
      }
    }
    
    return updatedEstimate;
  }

  async deleteEstimate(id: number): Promise<boolean> {
    if (!this.estimates.has(id)) return false;
    return this.estimates.delete(id);
  }

  // Estimate Items methods
  async getEstimateItems(estimateId: number): Promise<EstimateItem[]> {
    return Array.from(this.estimateItems.values()).filter(
      (item) => item.estimateId === estimateId
    );
  }

  async getEstimateItem(id: number): Promise<EstimateItem | undefined> {
    return this.estimateItems.get(id);
  }

  async createEstimateItem(insertItem: InsertEstimateItem): Promise<EstimateItem> {
    const id = this.currentId++;
    const now = new Date().toISOString();
    
    // Calculate total price
    const totalPrice = insertItem.quantity * insertItem.unitPrice;
    
    const item: EstimateItem = {
      ...insertItem,
      id,
      totalPrice,
      createdAt: now,
      updatedAt: now,
      notes: insertItem.notes ?? null
    };
    this.estimateItems.set(id, item);
    
    // Update estimate total cost
    const estimate = await this.getEstimate(insertItem.estimateId);
    if (estimate) {
      const items = await this.getEstimateItems(estimate.id);
      const newTotalCost = items.reduce((sum, item) => sum + item.totalPrice, 0) + totalPrice;
      await this.updateEstimate(estimate.id, { totalCost: newTotalCost });
    }
    
    return item;
  }

  async updateEstimateItem(id: number, updateItem: Partial<InsertEstimateItem>): Promise<EstimateItem | undefined> {
    const existingItem = await this.getEstimateItem(id);
    if (!existingItem) return undefined;

    // Recalculate total price if quantity or unit price changed
    let totalPrice = existingItem.totalPrice;
    if (updateItem.quantity !== undefined || updateItem.unitPrice !== undefined) {
      const quantity = updateItem.quantity ?? existingItem.quantity;
      const unitPrice = updateItem.unitPrice ?? existingItem.unitPrice;
      totalPrice = quantity * unitPrice;
    }

    const updatedItem: EstimateItem = {
      ...existingItem,
      ...updateItem,
      totalPrice,
      updatedAt: new Date().toISOString()
    };

    this.estimateItems.set(id, updatedItem);
    
    // Update estimate total cost
    const estimate = await this.getEstimate(existingItem.estimateId);
    if (estimate) {
      const items = await this.getEstimateItems(estimate.id);
      const newTotalCost = items.reduce((sum, item) => sum + (item.id === id ? totalPrice : item.totalPrice), 0);
      await this.updateEstimate(estimate.id, { totalCost: newTotalCost });
    }
    
    return updatedItem;
  }

  async deleteEstimateItem(id: number): Promise<boolean> {
    const item = await this.getEstimateItem(id);
    if (!item) return false;
    
    const removed = this.estimateItems.delete(id);
    
    // Update estimate total cost
    if (removed) {
      const estimate = await this.getEstimate(item.estimateId);
      if (estimate) {
        const items = await this.getEstimateItems(estimate.id);
        const newTotalCost = items.reduce((sum, item) => sum + item.totalPrice, 0);
        await this.updateEstimate(estimate.id, { totalCost: newTotalCost });
      }
    }
    
    return removed;
  }

  // Validation Issues methods
  async getValidationIssues(estimateId: number, status?: string): Promise<ValidationIssue[]> {
    return Array.from(this.validationIssues.values()).filter(
      (issue) => issue.estimateId === estimateId && (!status || issue.status === status)
    );
  }

  async getValidationIssue(id: number): Promise<ValidationIssue | undefined> {
    return this.validationIssues.get(id);
  }

  async createValidationIssue(insertIssue: InsertValidationIssue): Promise<ValidationIssue> {
    const id = this.currentId++;
    const now = new Date().toISOString();
    const issue: ValidationIssue = {
      ...insertIssue,
      id,
      createdAt: now,
      updatedAt: now,
      resolution: insertIssue.resolution ?? null,
      assignedTo: insertIssue.assignedTo ?? null
    };
    this.validationIssues.set(id, issue);
    return issue;
  }

  async updateValidationIssue(id: number, updateIssue: Partial<InsertValidationIssue>): Promise<ValidationIssue | undefined> {
    const existingIssue = await this.getValidationIssue(id);
    if (!existingIssue) return undefined;

    const updatedIssue: ValidationIssue = {
      ...existingIssue,
      ...updateIssue,
      updatedAt: new Date().toISOString()
    };

    this.validationIssues.set(id, updatedIssue);
    return updatedIssue;
  }

  async deleteValidationIssue(id: number): Promise<boolean> {
    if (!this.validationIssues.has(id)) return false;
    return this.validationIssues.delete(id);
  }
}

export const storage = new MemStorage();
