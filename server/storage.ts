import { 
  users, 
  contactSubmissions,
  newsletterSubscriptions,
  otpVerifications,
  posts,
  type User, 
  type InsertUser,
  type ContactSubmission,
  type InsertContactSubmission,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
  type OtpVerification,
  type InsertOtpVerification,
  type Post,
  type InsertPost
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, or, ilike, inArray, desc, ne } from "drizzle-orm";

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
  createPost(post: InsertPost): Promise<Post>;
  getPosts(filters?: { userId?: number; postType?: string; tags?: string[] }): Promise<any[]>;
  getPostsByUser(userId: number): Promise<any[]>;
  getPostById(id: number): Promise<any | undefined>;
  getForYouPosts(currentUserId: number): Promise<any[]>;
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

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async getPosts(filters?: { userId?: number; postType?: string; tags?: string[] }): Promise<any[]> {
    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(eq(posts.userId, filters.userId));
    }
    
    if (filters?.postType) {
      conditions.push(eq(posts.postType, filters.postType));
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      conditions.push(
        or(...filters.tags.map(tag => 
          ilike(posts.tags, `%${tag}%`)
        ))!
      );
    }

    const baseQuery = db.select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      postType: posts.postType,
      mediaUrls: posts.mediaUrls,
      mediaType: posts.mediaType,
      location: posts.location,
      tags: posts.tags,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        userType: users.userType,
        companyName: users.companyName,
        businessType: users.businessType
      }
    }).from(posts).innerJoin(users, eq(posts.userId, users.id));

    if (conditions.length > 0) {
      return await baseQuery.where(and(...conditions)).orderBy(desc(posts.createdAt));
    }
    
    return await baseQuery.orderBy(desc(posts.createdAt));
  }

  async getPostsByUser(userId: number): Promise<any[]> {
    return this.getPosts({ userId });
  }

  async getPostById(id: number): Promise<any | undefined> {
    const [post] = await db.select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      postType: posts.postType,
      mediaUrls: posts.mediaUrls,
      mediaType: posts.mediaType,
      location: posts.location,
      tags: posts.tags,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        userType: users.userType,
        companyName: users.companyName,
        businessType: users.businessType
      }
    }).from(posts).innerJoin(users, eq(posts.userId, users.id)).where(eq(posts.id, id));
    return post || undefined;
  }

  async getForYouPosts(currentUserId: number): Promise<any[]> {
    return await db.select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      postType: posts.postType,
      mediaUrls: posts.mediaUrls,
      mediaType: posts.mediaType,
      location: posts.location,
      tags: posts.tags,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        userType: users.userType,
        companyName: users.companyName,
        businessType: users.businessType
      }
    }).from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(ne(posts.userId, currentUserId))
      .orderBy(desc(posts.createdAt));
  }
}

export const storage = new DatabaseStorage();
