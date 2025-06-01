import { db } from "./server/db.js";
import { users } from "./shared/schema.js";
import bcrypt from "bcryptjs";

// Common skills for contractors
const contractorSkills = [
  ["Plumbing", "Electrical Work"],
  ["Carpentry", "Framing"],
  ["Roofing", "Gutters"],
  ["HVAC", "Electrical Work"],
  ["Painting", "Drywall"],
  ["Landscaping", "Irrigation"],
  ["Flooring", "Tile Work"],
  ["Kitchen Remodeling", "Cabinetry"],
  ["Bathroom Remodeling", "Plumbing"],
  ["Concrete Work", "Masonry"],
  ["Solar Installation", "Electrical Work"],
  ["Windows", "Doors"],
  ["Insulation", "Energy Efficiency"],
  ["Demolition", "Construction"],
  ["Pool Installation", "Landscaping"],
  ["Fence Installation", "Gates"],
  ["Deck Building", "Outdoor Structures"],
  ["Appliance Installation", "Repair"],
  ["Home Security", "Electrical Work"],
  ["General Contracting", "Project Management"]
];

// Business data
const businessOwners = [
  { firstName: "Sarah", lastName: "Johnson", companyName: "Johnson Construction Co.", location: "Austin, TX", phoneNumber: "(512) 555-0101" },
  { firstName: "Michael", lastName: "Chen", companyName: "Chen Property Development", location: "Seattle, WA", phoneNumber: "(206) 555-0102" },
  { firstName: "Emily", lastName: "Rodriguez", companyName: "Rodriguez Real Estate", location: "Denver, CO", phoneNumber: "(303) 555-0103" },
  { firstName: "David", lastName: "Thompson", companyName: "Thompson Holdings LLC", location: "Phoenix, AZ", phoneNumber: "(602) 555-0104" },
  { firstName: "Jessica", lastName: "Williams", companyName: "Williams Hospitality Group", location: "Las Vegas, NV", phoneNumber: "(702) 555-0105" },
  { firstName: "Robert", lastName: "Davis", companyName: "Davis Commercial Properties", location: "Portland, OR", phoneNumber: "(503) 555-0106" },
  { firstName: "Amanda", lastName: "Miller", companyName: "Miller Restaurant Group", location: "San Diego, CA", phoneNumber: "(619) 555-0107" },
  { firstName: "Christopher", lastName: "Wilson", companyName: "Wilson Manufacturing", location: "Dallas, TX", phoneNumber: "(214) 555-0108" },
  { firstName: "Lisa", lastName: "Anderson", companyName: "Anderson Medical Centers", location: "Houston, TX", phoneNumber: "(713) 555-0109" },
  { firstName: "James", lastName: "Taylor", companyName: "Taylor Tech Solutions", location: "San Francisco, CA", phoneNumber: "(415) 555-0110" },
  { firstName: "Nicole", lastName: "Brown", companyName: "Brown Retail Ventures", location: "Los Angeles, CA", phoneNumber: "(323) 555-0111" },
  { firstName: "Kevin", lastName: "Martinez", companyName: "Martinez Logistics", location: "Miami, FL", phoneNumber: "(305) 555-0112" },
  { firstName: "Rachel", lastName: "Garcia", companyName: "Garcia Fitness Centers", location: "Orlando, FL", phoneNumber: "(407) 555-0113" },
  { firstName: "Steven", lastName: "Lee", companyName: "Lee Auto Group", location: "Atlanta, GA", phoneNumber: "(404) 555-0114" },
  { firstName: "Jennifer", lastName: "White", companyName: "White Event Planning", location: "Nashville, TN", phoneNumber: "(615) 555-0115" },
  { firstName: "Mark", lastName: "Harris", companyName: "Harris Construction", location: "Charlotte, NC", phoneNumber: "(704) 555-0116" },
  { firstName: "Stephanie", lastName: "Clark", companyName: "Clark Beauty Salons", location: "Raleigh, NC", phoneNumber: "(919) 555-0117" },
  { firstName: "Paul", lastName: "Lewis", companyName: "Lewis Security Services", location: "Virginia Beach, VA", phoneNumber: "(757) 555-0118" },
  { firstName: "Michelle", lastName: "Walker", companyName: "Walker Catering", location: "Richmond, VA", phoneNumber: "(804) 555-0119" },
  { firstName: "Brian", lastName: "Hall", companyName: "Hall Property Management", location: "Baltimore, MD", phoneNumber: "(410) 555-0120" }
];

// Contractor data
const contractors = [
  { firstName: "Carlos", lastName: "Ramirez", location: "Austin, TX", phoneNumber: "(512) 555-0201", bio: "Experienced plumber with 15+ years in residential and commercial projects." },
  { firstName: "Emma", lastName: "Thompson", location: "Seattle, WA", phoneNumber: "(206) 555-0202", bio: "Licensed electrician specializing in smart home installations." },
  { firstName: "Jake", lastName: "Morrison", location: "Denver, CO", phoneNumber: "(303) 555-0203", bio: "Master carpenter with expertise in custom furniture and home renovations." },
  { firstName: "Sofia", lastName: "Patel", location: "Phoenix, AZ", phoneNumber: "(602) 555-0204", bio: "HVAC specialist with certification in energy-efficient systems." },
  { firstName: "Tyler", lastName: "Brooks", location: "Las Vegas, NV", phoneNumber: "(702) 555-0205", bio: "Professional painter with 12 years experience in residential and commercial painting." },
  { firstName: "Maya", lastName: "Singh", location: "Portland, OR", phoneNumber: "(503) 555-0206", bio: "Landscape designer creating beautiful outdoor spaces for over 10 years." },
  { firstName: "Alex", lastName: "Johnson", location: "San Diego, CA", phoneNumber: "(619) 555-0207", bio: "Flooring specialist with expertise in hardwood, tile, and luxury vinyl." },
  { firstName: "Zoe", lastName: "Carter", location: "Dallas, TX", phoneNumber: "(214) 555-0208", bio: "Kitchen remodeling expert with a passion for modern design." },
  { firstName: "Ryan", lastName: "Foster", location: "Houston, TX", phoneNumber: "(713) 555-0209", bio: "Bathroom renovation specialist creating spa-like experiences." },
  { firstName: "Ava", lastName: "Reed", location: "San Francisco, CA", phoneNumber: "(415) 555-0210", bio: "Concrete and masonry contractor with 20+ years of experience." },
  { firstName: "Nathan", lastName: "Cooper", location: "Los Angeles, CA", phoneNumber: "(323) 555-0211", bio: "Solar installation expert helping homeowners go green." },
  { firstName: "Lily", lastName: "Hughes", location: "Miami, FL", phoneNumber: "(305) 555-0212", bio: "Window and door specialist providing energy-efficient solutions." },
  { firstName: "Ethan", lastName: "Price", location: "Orlando, FL", phoneNumber: "(407) 555-0213", bio: "Insulation contractor focused on energy efficiency and comfort." },
  { firstName: "Grace", lastName: "Bell", location: "Atlanta, GA", phoneNumber: "(404) 555-0214", bio: "Demolition and construction specialist with proper licensing and insurance." },
  { firstName: "Lucas", lastName: "Ward", location: "Nashville, TN", phoneNumber: "(615) 555-0215", bio: "Pool installation expert creating backyard oases for families." },
  { firstName: "Chloe", lastName: "Torres", location: "Charlotte, NC", phoneNumber: "(704) 555-0216", bio: "Fence and gate installer with expertise in security and privacy solutions." },
  { firstName: "Owen", lastName: "Parker", location: "Raleigh, NC", phoneNumber: "(919) 555-0217", bio: "Deck building specialist creating beautiful outdoor living spaces." },
  { firstName: "Mia", lastName: "Evans", location: "Virginia Beach, VA", phoneNumber: "(757) 555-0218", bio: "Appliance installation and repair technician with factory certifications." },
  { firstName: "Jack", lastName: "Collins", location: "Richmond, VA", phoneNumber: "(804) 555-0219", bio: "Home security specialist installing modern security systems." },
  { firstName: "Isabella", lastName: "Stewart", location: "Baltimore, MD", phoneNumber: "(410) 555-0220", bio: "General contractor managing residential and commercial projects." }
];

async function seedUsers() {
  try {
    console.log("Starting user seeding...");
    
    // Hash the common password
    const hashedPassword = await bcrypt.hash("12345678", 10);
    
    // Create business owners
    console.log("Creating business owners...");
    for (let i = 0; i < businessOwners.length; i++) {
      const business = businessOwners[i];
      const email = `${business.firstName.toLowerCase()}.${business.lastName.toLowerCase()}@business${i + 1}.com`;
      
      await db.insert(users).values({
        email,
        password: hashedPassword,
        firstName: business.firstName,
        lastName: business.lastName,
        userType: "business",
        companyName: business.companyName,
        phoneNumber: business.phoneNumber,
        location: business.location,
        isVerified: true
      });
      
      console.log(`Created business owner: ${business.firstName} ${business.lastName}`);
    }
    
    // Create contractors
    console.log("Creating contractors...");
    for (let i = 0; i < contractors.length; i++) {
      const contractor = contractors[i];
      const email = `${contractor.firstName.toLowerCase()}.${contractor.lastName.toLowerCase()}@contractor${i + 1}.com`;
      
      await db.insert(users).values({
        email,
        password: hashedPassword,
        firstName: contractor.firstName,
        lastName: contractor.lastName,
        userType: "contractor",
        phoneNumber: contractor.phoneNumber,
        location: contractor.location,
        skills: contractorSkills[i],
        bio: contractor.bio,
        isVerified: true
      });
      
      console.log(`Created contractor: ${contractor.firstName} ${contractor.lastName}`);
    }
    
    console.log("User seeding completed successfully!");
    console.log(`Created ${businessOwners.length} business owners and ${contractors.length} contractors`);
    
  } catch (error) {
    console.error("Error seeding users:", error);
  }
}

seedUsers();