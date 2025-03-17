import { 
  users, type User, type InsertUser,
  companyStandards, type CompanyStandards, type InsertCompanyStandards,
  onboardingProgress, type OnboardingProgress, type InsertOnboardingProgress,
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private standards: Map<number, CompanyStandards>; // Indexed by userId
  private progress: Map<number, OnboardingProgress>; // Indexed by userId
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.standards = new Map();
    this.progress = new Map();
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
}

export const storage = new MemStorage();
