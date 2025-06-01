import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertContactSubmissionSchema, insertNewsletterSubscriptionSchema, insertUserSchema, insertPostSchema } from "@shared/schema";
import { z } from "zod";
import { sendEmail, generateOTP, getOTPEmailTemplate } from "./email";
import bcrypt from "bcryptjs";

// Extend the session data interface
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.json({ success: true, id: submission.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter", async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriptionSchema.parse(req.body);
      
      // Check if email already exists
      const existing = await storage.getNewsletterSubscriptionByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ message: "Email already subscribed" });
      }

      const subscription = await storage.createNewsletterSubscription(validatedData);
      res.json({ success: true, id: subscription.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User signup
  app.post("/api/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existing = await storage.getUserByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const userDataWithHashedPassword = {
        ...validatedData,
        password: hashedPassword
      };

      const user = await storage.createUser(userDataWithHashedPassword);
      
      // Return user without password
      const { password, ...userResponse } = user;
      res.json({ success: true, user: userResponse });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare the provided password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      req.session.userId = user.id;

      // Return user without password
      const { password: _, ...userResponse } = user;
      res.json({ success: true, user: userResponse });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send OTP for email verification
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "User already verified" });
      }

      // Generate OTP and expiration time (10 minutes from now)
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Store OTP in database
      await storage.createOtpVerification({
        email,
        otp,
        expiresAt
      });

      // For development: return OTP in response instead of sending email
      // TODO: Remove this and uncomment email sending when domain is ready
      res.json({ 
        success: true, 
        message: "Verification code generated",
        developmentOtp: otp // Only for development - remove in production
      });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify OTP
  app.post("/api/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }

      // Check if OTP is valid
      const otpRecord = await storage.getValidOtp(email, otp);
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Get user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Mark OTP as used
      await storage.markOtpAsUsed(otpRecord.id);

      // Update user verification status
      const updatedUser = await storage.updateUserVerification(user.id, true);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user verification" });
      }

      // Return updated user without password
      const { password: _, ...userResponse } = updatedUser;
      res.json({ success: true, user: userResponse, message: "Account verified successfully" });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user
  app.get("/api/user", async (req, res) => {
    // For now, we'll implement a simple check
    // In a real app, you'd validate a session or JWT token
    res.status(401).json({ message: "Not authenticated" });
  });

  // Get businesses directory with filtering
  app.get("/api/businesses", async (req, res) => {
    try {
      const { search, businessType, location, tags } = req.query;
      
      const filters: any = {};
      if (search) filters.search = search as string;
      if (businessType) filters.businessType = businessType as string;
      if (location) filters.location = location as string;
      if (tags) filters.tags = Array.isArray(tags) ? tags as string[] : [tags as string];
      
      const businesses = await storage.getBusinesses(filters);
      
      // Remove passwords from response
      const businessesResponse = businesses.map(({ password, ...business }) => business);
      
      res.json({ success: true, businesses: businessesResponse });
    } catch (error) {
      console.error("Get businesses error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get contractors directory with filtering
  app.get("/api/contractors", async (req, res) => {
    try {
      const { search, skills, location, tags } = req.query;
      
      const filters: any = {};
      if (search) filters.search = search as string;
      if (skills) filters.skills = Array.isArray(skills) ? skills as string[] : [skills as string];
      if (location) filters.location = location as string;
      if (tags) filters.tags = Array.isArray(tags) ? tags as string[] : [tags as string];
      
      const contractors = await storage.getContractors(filters);
      
      // Remove passwords from response
      const contractorsResponse = contractors.map(({ password, ...contractor }) => contractor);
      
      res.json({ success: true, contractors: contractorsResponse });
    } catch (error) {
      console.error("Get contractors error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user profile by ID
  app.get("/api/profile/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUserProfile(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userResponse } = user;
      res.json({ success: true, user: userResponse });
    } catch (error) {
      console.error("Get user profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new post
  app.post("/api/posts", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const validatedData = insertPostSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const post = await storage.createPost(validatedData);
      res.json({ success: true, post });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Create post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get posts feed
  app.get("/api/posts", async (req, res) => {
    try {
      const { userId, postType, tags } = req.query;
      
      const filters: any = {};
      if (userId) filters.userId = parseInt(userId as string);
      if (postType) filters.postType = postType as string;
      if (tags) filters.tags = Array.isArray(tags) ? tags as string[] : [tags as string];
      
      const posts = await storage.getPosts(filters);
      res.json({ success: true, posts });
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get posts by user
  app.get("/api/posts/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const posts = await storage.getPostsByUser(userId);
      res.json({ success: true, posts });
    } catch (error) {
      console.error("Get user posts error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single post
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json({ success: true, post });
    } catch (error) {
      console.error("Get post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
