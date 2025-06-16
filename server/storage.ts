import { 
  users, 
  contactSubmissions,
  newsletterSubscriptions,
  otpVerifications,
  posts,
  jobOrders,
  jobApplications,
  jobInquiries,
  jobMessages,
  likes,
  comments,
  type User, 
  type InsertUser,
  type ContactSubmission,
  type InsertContactSubmission,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
  type OtpVerification,
  type InsertOtpVerification,
  type Post,
  type InsertPost,
  type JobOrder,
  type InsertJobOrder,
  type JobApplication,
  type InsertJobApplication,
  type JobInquiry,
  type InsertJobInquiry,
  type JobMessage,
  type InsertJobMessage,
  type Like,
  type InsertLike,
  type Comment,
  type InsertComment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, or, ilike, inArray, desc, ne, count, sql } from "drizzle-orm";

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
  deletePost(postId: number, userId: number): Promise<boolean>;
  likePost(userId: number, postId: number): Promise<Like>;
  unlikePost(userId: number, postId: number): Promise<boolean>;
  isPostLiked(userId: number, postId: number): Promise<boolean>;
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<any[]>;
  deleteComment(commentId: number, userId: number): Promise<boolean>;
  createJobOrder(jobOrder: InsertJobOrder): Promise<JobOrder>;
  getJobOrdersByBusiness(businessOwnerId: number): Promise<JobOrder[]>;
  getJobOrderById(id: number): Promise<JobOrder | undefined>;
  updateJobOrder(id: number, updates: Partial<JobOrder>): Promise<JobOrder | undefined>;
  deleteJobOrder(id: number, businessOwnerId: number): Promise<boolean>;
  getJobOrdersByStatus(businessOwnerId: number, status: string): Promise<JobOrder[]>;
  getJobOrderWithCounts(id: number): Promise<any | undefined>;
  getJobOrdersWithCounts(businessOwnerId: number): Promise<any[]>;
  // Job Applications
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getJobApplicationsByJobOrder(jobOrderId: number): Promise<any[]>;
  getJobApplicationById(id: number): Promise<JobApplication | undefined>;
  updateJobApplicationStatus(id: number, status: string): Promise<JobApplication | undefined>;
  // Job Inquiries
  createJobInquiry(inquiry: InsertJobInquiry): Promise<JobInquiry>;
  getJobInquiriesByJobOrder(jobOrderId: number): Promise<any[]>;
  getJobInquiryById(id: number): Promise<JobInquiry | undefined>;
  updateJobInquiryStatus(id: number, status: string): Promise<JobInquiry | undefined>;
  // Job Messages
  createJobMessage(message: InsertJobMessage): Promise<JobMessage>;
  getJobMessagesByJobOrder(jobOrderId: number): Promise<any[]>;
  markJobMessageAsRead(id: number): Promise<JobMessage | undefined>;
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

  async deletePost(postId: number, userId: number): Promise<boolean> {
    const result = await db.delete(posts).where(and(eq(posts.id, postId), eq(posts.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async likePost(userId: number, postId: number): Promise<Like> {
    // Check if already liked
    const existingLike = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    if (existingLike.length > 0) {
      throw new Error("Post already liked");
    }

    const [like] = await db.insert(likes).values({ userId, postId }).returning();
    
    // Update post likes count
    const likesCountResult = await db.select({ count: count(likes.id) }).from(likes).where(eq(likes.postId, postId));
    const likesCount = Number(likesCountResult[0]?.count || 0);
    
    await db.update(posts).set({ likesCount }).where(eq(posts.id, postId));

    return like;
  }

  async unlikePost(userId: number, postId: number): Promise<boolean> {
    const result = await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    
    if ((result.rowCount || 0) > 0) {
      // Update post likes count
      const likesCountResult = await db.select({ count: count(likes.id) }).from(likes).where(eq(likes.postId, postId));
      const likesCount = Number(likesCountResult[0]?.count || 0);
      
      await db.update(posts).set({ likesCount }).where(eq(posts.id, postId));
    }

    return (result.rowCount || 0) > 0;
  }

  async isPostLiked(userId: number, postId: number): Promise<boolean> {
    const [like] = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    return !!like;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    
    // Update post comments count
    const commentsCountResult = await db.select({ count: count(comments.id) }).from(comments).where(eq(comments.postId, insertComment.postId));
    const commentsCount = Number(commentsCountResult[0]?.count || 0);
    
    await db.update(posts).set({ commentsCount }).where(eq(posts.id, insertComment.postId));

    return comment;
  }

  async getCommentsByPost(postId: number): Promise<any[]> {
    return await db.select({
      id: comments.id,
      userId: comments.userId,
      postId: comments.postId,
      content: comments.content,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        userType: users.userType,
        companyName: users.companyName,
        businessType: users.businessType
      }
    }).from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  async deleteComment(commentId: number, userId: number): Promise<boolean> {
    const result = await db.delete(comments).where(and(eq(comments.id, commentId), eq(comments.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async createJobOrder(insertJobOrder: InsertJobOrder): Promise<JobOrder> {
    const [jobOrder] = await db.insert(jobOrders).values(insertJobOrder).returning();
    return jobOrder;
  }

  async getJobOrdersByBusiness(businessOwnerId: number): Promise<JobOrder[]> {
    return await db.select().from(jobOrders)
      .where(eq(jobOrders.businessOwnerId, businessOwnerId))
      .orderBy(desc(jobOrders.createdAt));
  }

  async getJobOrderById(id: number): Promise<JobOrder | undefined> {
    const [jobOrder] = await db.select().from(jobOrders).where(eq(jobOrders.id, id));
    return jobOrder;
  }

  async updateJobOrder(id: number, updates: Partial<JobOrder>): Promise<JobOrder | undefined> {
    const [jobOrder] = await db.update(jobOrders)
      .set(updates)
      .where(eq(jobOrders.id, id))
      .returning();
    return jobOrder;
  }

  async deleteJobOrder(id: number, businessOwnerId: number): Promise<boolean> {
    const [jobOrder] = await db.select().from(jobOrders).where(eq(jobOrders.id, id));
    
    if (!jobOrder || jobOrder.businessOwnerId !== businessOwnerId) {
      return false;
    }
    
    await db.delete(jobOrders).where(eq(jobOrders.id, id));
    return true;
  }

  async getJobOrdersByStatus(businessOwnerId: number, status: string): Promise<JobOrder[]> {
    return await db.select().from(jobOrders)
      .where(and(
        eq(jobOrders.businessOwnerId, businessOwnerId),
        eq(jobOrders.status, status)
      ))
      .orderBy(desc(jobOrders.createdAt));
  }

  async getJobOrderWithCounts(id: number): Promise<any | undefined> {
    const [jobOrder] = await db.select({
      id: jobOrders.id,
      businessOwnerId: jobOrders.businessOwnerId,
      title: jobOrders.title,
      description: jobOrders.description,
      budgetRange: jobOrders.budgetRange,
      projectSize: jobOrders.projectSize,
      deadline: jobOrders.deadline,
      location: jobOrders.location,
      requiredSkills: jobOrders.requiredSkills,
      status: jobOrders.status,
      createdAt: jobOrders.createdAt,
      updatedAt: jobOrders.updatedAt,
      applicationsCount: sql<number>`count(distinct ${jobApplications.id})`.as('applicationsCount'),
      inquiriesCount: sql<number>`count(distinct ${jobInquiries.id})`.as('inquiriesCount'),
      messagesCount: sql<number>`count(distinct ${jobMessages.id})`.as('messagesCount')
    }).from(jobOrders)
      .leftJoin(jobApplications, eq(jobOrders.id, jobApplications.jobOrderId))
      .leftJoin(jobInquiries, eq(jobOrders.id, jobInquiries.jobOrderId))
      .leftJoin(jobMessages, eq(jobOrders.id, jobMessages.jobOrderId))
      .where(eq(jobOrders.id, id))
      .groupBy(jobOrders.id);
    return jobOrder || undefined;
  }

  async getJobOrdersWithCounts(businessOwnerId: number): Promise<any[]> {
    return await db.select({
      id: jobOrders.id,
      businessOwnerId: jobOrders.businessOwnerId,
      title: jobOrders.title,
      description: jobOrders.description,
      budgetRange: jobOrders.budgetRange,
      projectSize: jobOrders.projectSize,
      deadline: jobOrders.deadline,
      location: jobOrders.location,
      requiredSkills: jobOrders.requiredSkills,
      status: jobOrders.status,
      createdAt: jobOrders.createdAt,
      updatedAt: jobOrders.updatedAt,
      applicationsCount: sql<number>`count(distinct ${jobApplications.id})`.as('applicationsCount'),
      inquiriesCount: sql<number>`count(distinct ${jobInquiries.id})`.as('inquiriesCount'),
      messagesCount: sql<number>`count(distinct ${jobMessages.id})`.as('messagesCount')
    }).from(jobOrders)
      .leftJoin(jobApplications, eq(jobOrders.id, jobApplications.jobOrderId))
      .leftJoin(jobInquiries, eq(jobOrders.id, jobInquiries.jobOrderId))
      .leftJoin(jobMessages, eq(jobOrders.id, jobMessages.jobOrderId))
      .where(eq(jobOrders.businessOwnerId, businessOwnerId))
      .groupBy(jobOrders.id)
      .orderBy(desc(jobOrders.createdAt));
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [jobApplication] = await db.insert(jobApplications).values(application).returning();
    return jobApplication;
  }

  async getJobApplicationsByJobOrder(jobOrderId: number): Promise<any[]> {
    return await db.select({
      id: jobApplications.id,
      jobOrderId: jobApplications.jobOrderId,
      contractorId: jobApplications.contractorId,
      coverLetter: jobApplications.coverLetter,
      proposedBudget: jobApplications.proposedBudget,
      estimatedDuration: jobApplications.estimatedDuration,
      status: jobApplications.status,
      createdAt: jobApplications.createdAt,
      updatedAt: jobApplications.updatedAt,
      contractor: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        location: users.location,
        skills: users.skills,
        bio: users.bio
      }
    }).from(jobApplications)
      .leftJoin(users, eq(jobApplications.contractorId, users.id))
      .where(eq(jobApplications.jobOrderId, jobOrderId))
      .orderBy(desc(jobApplications.createdAt));
  }

  async getJobApplicationById(id: number): Promise<JobApplication | undefined> {
    const [jobApplication] = await db.select().from(jobApplications).where(eq(jobApplications.id, id));
    return jobApplication || undefined;
  }

  async updateJobApplicationStatus(id: number, status: string): Promise<JobApplication | undefined> {
    const [jobApplication] = await db.update(jobApplications)
      .set({ status })
      .where(eq(jobApplications.id, id))
      .returning();
    return jobApplication || undefined;
  }

  async createJobInquiry(inquiry: InsertJobInquiry): Promise<JobInquiry> {
    const [jobInquiry] = await db.insert(jobInquiries).values(inquiry).returning();
    return jobInquiry;
  }

  async getJobInquiriesByJobOrder(jobOrderId: number): Promise<any[]> {
    return await db.select({
      id: jobInquiries.id,
      jobOrderId: jobInquiries.jobOrderId,
      contractorId: jobInquiries.contractorId,
      subject: jobInquiries.subject,
      message: jobInquiries.message,
      status: jobInquiries.status,
      createdAt: jobInquiries.createdAt,
      updatedAt: jobInquiries.updatedAt,
      contractor: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        location: users.location,
        skills: users.skills,
        bio: users.bio
      }
    }).from(jobInquiries)
      .leftJoin(users, eq(jobInquiries.contractorId, users.id))
      .where(eq(jobInquiries.jobOrderId, jobOrderId))
      .orderBy(desc(jobInquiries.createdAt));
  }

  async getJobInquiryById(id: number): Promise<JobInquiry | undefined> {
    const [jobInquiry] = await db.select().from(jobInquiries).where(eq(jobInquiries.id, id));
    return jobInquiry || undefined;
  }

  async updateJobInquiryStatus(id: number, status: string): Promise<JobInquiry | undefined> {
    const [jobInquiry] = await db.update(jobInquiries)
      .set({ status })
      .where(eq(jobInquiries.id, id))
      .returning();
    return jobInquiry || undefined;
  }

  async createJobMessage(message: InsertJobMessage): Promise<JobMessage> {
    const [jobMessage] = await db.insert(jobMessages).values(message).returning();
    return jobMessage;
  }

  async getJobMessagesByJobOrder(jobOrderId: number): Promise<any[]> {
    return await db.select({
      id: jobMessages.id,
      jobOrderId: jobMessages.jobOrderId,
      senderId: jobMessages.senderId,
      receiverId: jobMessages.receiverId,
      message: jobMessages.message,
      isRead: jobMessages.isRead,
      createdAt: jobMessages.createdAt,
      sender: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        userType: users.userType
      }
    }).from(jobMessages)
      .leftJoin(users, eq(jobMessages.senderId, users.id))
      .where(eq(jobMessages.jobOrderId, jobOrderId))
      .orderBy(desc(jobMessages.createdAt));
  }

  async markJobMessageAsRead(id: number): Promise<JobMessage | undefined> {
    const [jobMessage] = await db.update(jobMessages)
      .set({ isRead: true })
      .where(eq(jobMessages.id, id))
      .returning();
    return jobMessage || undefined;
  }
}

export const storage = new DatabaseStorage();
