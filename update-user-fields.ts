import { db } from "./server/db.js";
import { users } from "./shared/schema.js";
import { eq } from "drizzle-orm";

// Business types mapping based on company names
const businessTypeMapping: Record<string, string> = {
  "Johnson Construction Co.": "construction",
  "Chen Property Development": "real_estate",
  "Rodriguez Real Estate": "real_estate", 
  "Thompson Holdings LLC": "investment",
  "Williams Hospitality Group": "hospitality",
  "Davis Commercial Properties": "real_estate",
  "Miller Restaurant Group": "restaurant",
  "Wilson Manufacturing": "manufacturing",
  "Anderson Medical Centers": "healthcare",
  "Taylor Tech Solutions": "technology",
  "Green Energy Solutions": "energy",
  "Pacific Retail Group": "retail",
  "Mountain View Logistics": "logistics",
  "Sunset Entertainment": "entertainment",
  "Northside Auto Group": "automotive"
};

// Tags for business owners based on business type
const businessTags: Record<string, string[]> = {
  "construction": ["commercial", "residential", "licensed", "insured"],
  "real_estate": ["property_management", "development", "commercial", "residential"],
  "investment": ["commercial", "portfolio_management", "acquisitions"],
  "hospitality": ["customer_service", "commercial", "multi_location"],
  "restaurant": ["food_service", "commercial", "health_certified"],
  "manufacturing": ["industrial", "production", "quality_certified"],
  "healthcare": ["medical", "licensed", "patient_care", "regulated"],
  "technology": ["innovation", "commercial", "scalable"],
  "energy": ["renewable", "commercial", "certified", "sustainable"],
  "retail": ["customer_facing", "multi_location", "inventory"],
  "logistics": ["transportation", "warehouse", "commercial"],
  "entertainment": ["events", "customer_service", "licensed"],
  "automotive": ["certified", "commercial", "service"]
};

// Tags for contractors based on skills
const contractorTagsMapping: Record<string, string[]> = {
  "Plumbing": ["licensed", "emergency_service", "residential"],
  "Electrical Work": ["certified", "safety_trained", "residential", "commercial"],
  "Carpentry": ["craftsmanship", "residential", "custom_work"],
  "Framing": ["structural", "residential", "commercial"],
  "Roofing": ["weather_resistant", "insured", "residential"],
  "Gutters": ["exterior", "maintenance", "residential"],
  "HVAC": ["certified", "energy_efficient", "residential", "commercial"],
  "Painting": ["interior", "exterior", "residential", "commercial"],
  "Drywall": ["interior", "residential", "commercial"],
  "Landscaping": ["outdoor", "design", "maintenance"],
  "Irrigation": ["water_systems", "outdoor", "efficient"],
  "Flooring": ["interior", "residential", "commercial"],
  "Tile Work": ["interior", "craftsmanship", "residential"],
  "Kitchen Remodeling": ["interior", "residential", "design"],
  "Cabinetry": ["custom_work", "craftsmanship", "interior"],
  "Bathroom Remodeling": ["interior", "residential", "plumbing"],
  "Concrete Work": ["structural", "outdoor", "commercial"],
  "Masonry": ["structural", "craftsmanship", "outdoor"],
  "Solar Installation": ["renewable_energy", "certified", "electrical"],
  "Windows": ["exterior", "energy_efficient", "residential"],
  "Doors": ["security", "residential", "commercial"],
  "Insulation": ["energy_efficient", "interior", "residential"],
  "Energy Efficiency": ["sustainable", "certified", "cost_saving"],
  "Demolition": ["structural", "commercial", "safety_trained"],
  "Construction": ["structural", "commercial", "residential"],
  "Pool Installation": ["outdoor", "luxury", "maintenance"],
  "Fence Installation": ["security", "outdoor", "residential"],
  "Gates": ["security", "automated", "commercial"],
  "Deck Building": ["outdoor", "craftsmanship", "residential"],
  "Outdoor Structures": ["outdoor", "custom_work", "residential"],
  "Appliance Installation": ["technical", "residential", "warranty"],
  "Repair": ["maintenance", "diagnostic", "reliable"],
  "Home Security": ["security", "technical", "monitoring"],
  "General Contracting": ["project_management", "licensed", "full_service"],
  "Project Management": ["coordination", "timeline_focused", "commercial"]
};

// Certifications for contractors based on skills
const certificationMapping: Record<string, string[]> = {
  "Plumbing": ["Licensed Plumber", "Backflow Certification"],
  "Electrical Work": ["Master Electrician", "OSHA Safety Certified"],
  "HVAC": ["EPA 608 Certified", "NATE Certified"],
  "Solar Installation": ["NABCEP Certified", "Electrical License"],
  "General Contracting": ["General Contractor License", "OSHA 30"],
  "Project Management": ["PMP Certified", "Construction Management"],
  "Home Security": ["Security+ Certified", "Low Voltage License"],
  "Energy Efficiency": ["BPI Certified", "Energy Auditor"],
  "Concrete Work": ["ACI Certified", "Concrete Finisher"],
  "Roofing": ["Roofing License", "Safety Certified"]
};

async function updateUserFields() {
  try {
    console.log("Starting user field updates...");
    
    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users to update`);
    
    for (const user of allUsers) {
      let businessType: string | null = null;
      let tags: string[] = [];
      let certifications: string[] = [];
      
      if (user.userType === "business") {
        // Set business type based on company name
        if (user.companyName && businessTypeMapping[user.companyName]) {
          businessType = businessTypeMapping[user.companyName];
          tags = businessTags[businessType] || ["commercial"];
        } else {
          // Default business type and tags if company not in mapping
          businessType = "other";
          tags = ["commercial", "professional"];
        }
      } else if (user.userType === "contractor") {
        // Generate tags and certifications based on skills
        const userSkills = user.skills || [];
        const tagSet = new Set<string>();
        const certSet = new Set<string>();
        
        userSkills.forEach(skill => {
          // Add tags for this skill
          const skillTags = contractorTagsMapping[skill] || [];
          skillTags.forEach(tag => tagSet.add(tag));
          
          // Add certifications for this skill
          const skillCerts = certificationMapping[skill] || [];
          skillCerts.forEach(cert => certSet.add(cert));
        });
        
        tags = Array.from(tagSet);
        certifications = Array.from(certSet);
        
        // Add some default tags if none found
        if (tags.length === 0) {
          tags = ["professional", "reliable"];
        }
      }
      
      // Update the user
      await db.update(users)
        .set({
          businessType,
          tags,
          certifications
        })
        .where(eq(users.id, user.id));
      
      console.log(`Updated ${user.userType}: ${user.firstName} ${user.lastName} - BusinessType: ${businessType}, Tags: ${tags.length}, Certifications: ${certifications.length}`);
    }
    
    console.log("User field updates completed successfully!");
    
  } catch (error) {
    console.error("Error updating user fields:", error);
  }
}

updateUserFields().then(() => {
  console.log("Script finished");
  process.exit(0);
});