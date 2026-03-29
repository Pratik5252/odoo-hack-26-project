import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../utils/password";

/**
 * Seed script to create Manjeet (admin) and test team
 * Usage: npx ts-node src/db/seeds/seed-manjeet.ts
 */
async function main() {
  try {
    console.log("🌱 Starting seed...");

    // Check if Manjeet already exists
    const existingManjeet = await prisma.user.findUnique({
      where: { email: "singhmanjeet5976@gmail.com" },
    });

    if (existingManjeet) {
      console.log("✓ Manjeet already exists");
      
      // Ensure Manjeet has the right company and role
      if (existingManjeet.role !== "ADMIN") {
        console.log("⚠️  Updating Manjeet's role to ADMIN...");
        await prisma.user.update({
          where: { id: existingManjeet.id },
          data: { role: "ADMIN" },
        });
      }
      
      const company = existingManjeet.companyId;
      console.log(`✓ Manjeet is in company: ${company}`);

      // Seed team users
      await seedTeamUsers(company || "", existingManjeet.id);
    } else {
      // Create new company for Manjeet
      const company = await prisma.company.create({
        data: {
          name: "Manjeet's Company",
          country: "India",
          baseCurrency: "INR",
          currencySymbol: "₹",
        },
      });

      console.log("✓ Created company:", company.id);

      // Create Manjeet as admin
      const hashedPassword = await hashPassword("password123");
      const manjeet = await prisma.user.create({
        data: {
          email: "singhmanjeet5976@gmail.com",
          name: "Manjeet Singh",
          password: hashedPassword,
          role: "ADMIN",
          companyId: company.id,
        },
      });

      console.log("✓ Created Manjeet (ADMIN):", manjeet.email);

      // Seed team users
      await seedTeamUsers(company.id, manjeet.id);
    }

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedTeamUsers(companyId: string, adminId: string) {
  // Check for existing manager
  let manager = await prisma.user.findFirst({
    where: {
      email: "emp1@example.com",
      companyId,
    },
  });

  if (!manager) {
    const hashedPassword = await hashPassword("password123");
    manager = await prisma.user.create({
      data: {
        email: "emp1@example.com",
        name: "John Employee",
        password: hashedPassword,
        role: "MANAGER",
        companyId,
      },
    });
    console.log("✓ Created Manager:", manager.email);
  } else {
    console.log("✓ Manager already exists:", manager.email);
    
    // Ensure correct role
    if (manager.role !== "MANAGER") {
      await prisma.user.update({
        where: { id: manager.id },
        data: { role: "MANAGER" },
      });
      console.log("  - Updated role to MANAGER");
    }
  }

  // Check for first employee
  let emp1 = await prisma.user.findFirst({
    where: {
      email: "john5432@example.com",
      companyId,
    },
  });

  if (!emp1) {
    const hashedPassword = await hashPassword("password123");
    emp1 = await prisma.user.create({
      data: {
        email: "john5432@example.com",
        name: "John Doe",
        password: hashedPassword,
        role: "EMPLOYEE",
        companyId,
        managerId: manager.id,
      },
    });
    console.log("✓ Created Employee 1:", emp1.email);
  } else {
    console.log("✓ Employee 1 already exists:", emp1.email);
    
    // Ensure correct role and manager
    if (emp1.role !== "EMPLOYEE" || emp1.managerId !== manager.id) {
      await prisma.user.update({
        where: { id: emp1.id },
        data: { role: "EMPLOYEE", managerId: manager.id },
      });
      console.log("  - Updated role and manager");
    }
  }

  // Check for second employee
  let emp2 = await prisma.user.findFirst({
    where: {
      email: "pratik@gmail.com",
      companyId,
    },
  });

  if (!emp2) {
    const hashedPassword = await hashPassword("password123");
    emp2 = await prisma.user.create({
      data: {
        email: "pratik@gmail.com",
        name: "Pratik Kumar",
        password: hashedPassword,
        role: "EMPLOYEE",
        companyId,
        managerId: manager.id,
      },
    });
    console.log("✓ Created Employee 2:", emp2.email);
  } else {
    console.log("✓ Employee 2 already exists:", emp2.email);
    
    // Ensure correct role and manager
    if (emp2.role !== "EMPLOYEE" || emp2.managerId !== manager.id) {
      await prisma.user.update({
        where: { id: emp2.id },
        data: { role: "EMPLOYEE", managerId: manager.id },
      });
      console.log("  - Updated role and manager");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
