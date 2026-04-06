import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const services = [
    { name: 'ploughing', description: 'Primary tillage to break up and turn over soil', baseRatePerHectare: 900 },
    { name: 'harrowing', description: 'Secondary tillage to break soil clods and level the field', baseRatePerHectare: 800 },
    { name: 'ridging', description: 'Create ridges for planting crops like yam and cassava', baseRatePerHectare: 700 },
    { name: 'planting', description: 'Mechanized seed planting for efficient coverage', baseRatePerHectare: 1000 },
    { name: 'harvesting', description: 'Mechanized harvesting for various crops', baseRatePerHectare: 2000 },
  ];

  console.log('Seeding services...');

  // Try to clean up old services (might fail if foreign keys exist, which is fine, we just want to remove unused ones)
  try {
    await prisma.service.deleteMany({
      where: {
        name: { notIn: services.map(s => s.name) }
      }
    });
  } catch (e) {
    console.log('Could not cleanly delete old services due to existing booking references. They will remain in DB but frontend logic relies on exact matches.');
  }

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: { 
        baseRatePerHectare: service.baseRatePerHectare,
        description: service.description
      },
      create: service,
    });
  }

  console.log('Seeding demo users...');
  
  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashFarmer = await bcrypt.hash('farmer123', 10);
  const passwordHashOperator = await bcrypt.hash('operator123', 10);

  const demoUsers = [
    { name: 'Admin Demo', email: 'admin@tractorlink.com', passwordHash: passwordHashAdmin, role: 'admin', phone: '1111111111' },
    { name: 'Farmer Demo', email: 'farmer@tractorlink.com', passwordHash: passwordHashFarmer, role: 'farmer', phone: '2222222222' },
    { name: 'Kiaan Operator', email: 'operator@tractorlink.com', passwordHash: passwordHashOperator, role: 'operator', phone: '3333333333' }
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  console.log('Seeding demo tractor...');
  const operatorUser = await prisma.user.findUnique({ where: { email: 'operator@tractorlink.com' } });
  if (operatorUser) {
    await prisma.tractor.upsert({
      where: { operatorId: operatorUser.id },
      update: { 
        name: 'Command Unit-01',
        model: 'Mahindra 575 DI',
        status: 'available' 
      },
      create: {
        name: 'Command Unit-01',
        model: 'Mahindra 575 DI',
        status: 'available',
        operatorId: operatorUser.id
      }
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
