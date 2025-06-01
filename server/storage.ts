import { 
  users, 
  contactSubmissions,
  newsletterSubscriptions,
  otpVerifications,
  type User, 
  type InsertUser,
  type ContactSubmission,
  type InsertContactSubmission,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
  type OtpVerification,
  type InsertOtpVerification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, or, ilike, inArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined>;
  createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification>;
  getValidOtp(email: string, otp: string): Promise<OtpVerification | undefined>;
  markOtpAsUsed(id: number): Promise<void>;
  getBusinesses(filters?: { search?: string; businessType?: string; location?: string; tags?: string[] }): Promise<User[]>;
  getContractors(filters?: { search?: string; skills?: string[]; location?: string; tags?: string[] }): Promise<User[]>;
  getUserProfile(id: number): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db
      .insert(contactSubmissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [subscription] = await db
      .insert(newsletterSubscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }

  async getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email));
    return subscription || undefined;
  }

  async updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isVerified })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createOtpVerification(insertOtp: InsertOtpVerification): Promise<OtpVerification> {
    const [otp] = await db
      .insert(otpVerifications)
      .values(insertOtp)
      .returning();
    return otp;
  }

  async getValidOtp(email: string, otp: string): Promise<OtpVerification | undefined> {
    const [otpRecord] = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.email, email),
          eq(otpVerifications.otp, otp),
          eq(otpVerifications.isUsed, false),
          gt(otpVerifications.expiresAt, new Date())
        )
      );
    return otpRecord || undefined;
  }

  async markOtpAsUsed(id: number): Promise<void> {
    await db
      .update(otpVerifications)
      .set({ isUsed: true })
      .where(eq(otpVerifications.id, id));
  }

  async getBusinesses(filters?: { search?: string; businessType?: string; location?: string; tags?: string[] }): Promise<User[]> {
    let query = db.select().from(users).where(eq(users.userType, "business"));
    
    if (filters) {
      const conditions = [eq(users.userType, "business")];
      
      if (filters.search) {
        conditions.push(
          or(
            ilike(users.firstName, `%${filters.search}%`),
            ilike(users.lastName, `%${filters.search}%`),
            ilike(users.companyName, `%${filters.search}%`),
            ilike(users.bio, `%${filters.search}%`)
          )!
        );
      }
      
      if (filters.businessType) {
        conditions.push(eq(users.businessType, filters.businessType));
      }
      
      if (filters.location) {
        conditions.push(ilike(users.location, `%${filters.location}%`));
      }
      
      query = db.select().from(users).where(and(...conditions));
    }
    
    return await query;
  }

  async getContractors(filters?: { search?: string; skills?: string[]; location?: string; tags?: string[] }): Promise<User[]> {
    let query = db.select().from(users).where(eq(users.userType, "contractor"));
    
    if (filters) {
      const conditions = [eq(users.userType, "contractor")];
      
      if (filters.search) {
        conditions.push(
          or(
            ilike(users.firstName, `%${filters.search}%`),
            ilike(users.lastName, `%${filters.search}%`),
            ilike(users.bio, `%${filters.search}%`)
          )!
        );
      }
      
      if (filters.location) {
        conditions.push(ilike(users.location, `%${filters.location}%`));
      }
      
      query = db.select().from(users).where(and(...conditions));
    }
    
    return await query;
  }

  async getUserProfile(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
}

export const storage = new DatabaseStorage();
