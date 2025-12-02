import { db } from "./db";
import { candidates, timelineEntries, evaluations, documents } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  try {
    // Clear existing data
    await db.delete(documents);
    await db.delete(evaluations);
    await db.delete(timelineEntries);
    await db.delete(candidates);

    // Create candidate 1: Sarah Al-Mansouri
    const [sarah] = await db.insert(candidates).values({
      code: "PASS-001",
      name: "Sarah Al-Mansouri",
      title: "Senior UX Designer",
      email: "sarah.m@example.com",
      phone: "+971 50 123 4567",
      department: "Design",
      location: "Abu Dhabi, UAE",
      status: "Active",
    }).returning();

    // Sarah's timeline
    await db.insert(timelineEntries).values([
      { candidateId: sarah.id, title: "Application Received", date: "Nov 25", status: "completed", order: 1 },
      { candidateId: sarah.id, title: "Screening Call", date: "Nov 26", status: "completed", order: 2 },
      { candidateId: sarah.id, title: "Portfolio Review", date: "Nov 28", status: "completed", order: 3 },
      { candidateId: sarah.id, title: "Final Interview", date: "Today, 2:00 PM", status: "current", order: 4 },
    ]);

    // Sarah's evaluations
    await db.insert(evaluations).values([
      { candidateId: sarah.id, type: "Portfolio Review", score: "95%", notes: "Excellent design work, strong UI/UX skills", evaluator: "Design Team", date: "Nov 28" },
      { candidateId: sarah.id, type: "Technical Assessment", score: "92%", notes: "Proficient in Figma, strong prototyping", evaluator: "Lead Designer", date: "Nov 27" },
    ]);

    // Sarah's documents
    await db.insert(documents).values([
      { candidateId: sarah.id, title: "Resume", type: "CV", url: "#" },
      { candidateId: sarah.id, title: "Portfolio", type: "Portfolio", url: "#" },
    ]);

    // Create candidate 2: Ahmed Hassan
    const [ahmed] = await db.insert(candidates).values({
      code: "PASS-002",
      name: "Ahmed Hassan",
      title: "Full Stack Developer",
      email: "ahmed.h@example.com",
      phone: "+971 55 234 5678",
      department: "Engineering",
      location: "Dubai, UAE",
      status: "Active",
    }).returning();

    // Ahmed's timeline
    await db.insert(timelineEntries).values([
      { candidateId: ahmed.id, title: "Application Received", date: "Nov 20", status: "completed", order: 1 },
      { candidateId: ahmed.id, title: "Technical Screening", date: "Nov 22", status: "completed", order: 2 },
      { candidateId: ahmed.id, title: "Coding Challenge", date: "Nov 24", status: "completed", order: 3 },
      { candidateId: ahmed.id, title: "Team Interview", date: "Nov 30", status: "upcoming", order: 4 },
    ]);

    // Ahmed's evaluations
    await db.insert(evaluations).values([
      { candidateId: ahmed.id, type: "Coding Challenge", score: "88%", notes: "Strong problem-solving, clean code", evaluator: "Tech Lead", date: "Nov 24" },
    ]);

    // Ahmed's documents
    await db.insert(documents).values([
      { candidateId: ahmed.id, title: "Resume", type: "CV", url: "#" },
      { candidateId: ahmed.id, title: "GitHub Profile", type: "Portfolio", url: "#" },
    ]);

    // Create candidate 3: Fatima Al-Nuaimi
    const [fatima] = await db.insert(candidates).values({
      code: "PASS-003",
      name: "Fatima Al-Nuaimi",
      title: "Product Manager",
      email: "fatima.n@example.com",
      phone: "+971 52 345 6789",
      department: "Product",
      location: "Abu Dhabi, UAE",
      status: "Active",
    }).returning();

    // Fatima's timeline
    await db.insert(timelineEntries).values([
      { candidateId: fatima.id, title: "Application Received", date: "Nov 18", status: "completed", order: 1 },
      { candidateId: fatima.id, title: "Phone Screen", date: "Nov 19", status: "completed", order: 2 },
      { candidateId: fatima.id, title: "Case Study", date: "Nov 23", status: "completed", order: 3 },
      { candidateId: fatima.id, title: "Executive Interview", date: "Dec 02", status: "current", order: 4 },
    ]);

    // Fatima's evaluations
    await db.insert(evaluations).values([
      { candidateId: fatima.id, type: "Case Study", score: "Excellent", notes: "Strong strategic thinking, data-driven approach", evaluator: "VP Product", date: "Nov 23" },
    ]);

    // Fatima's documents
    await db.insert(documents).values([
      { candidateId: fatima.id, title: "Resume", type: "CV", url: "#" },
      { candidateId: fatima.id, title: "Case Study Presentation", type: "Document", url: "#" },
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
