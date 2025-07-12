// File: prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clear existing data
  await prisma.userSkillOffered.deleteMany({});
  await prisma.userSkillWanted.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.user.deleteMany({});

  // Create some common skills
  const skillsToCreate = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Graphic Design',
    'Photoshop', 'Video Editing', 'Content Writing', 'SEO', 'Public Speaking'
  ];

  const createdSkills = await Promise.all(
    skillsToCreate.map(skillName => prisma.skill.create({ data: { name: skillName } }))
  );
  console.log(`Created ${createdSkills.length} skills.`);

  // Create a few users
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      location: 'San Francisco, CA',
      availability: 'Weekends',
      isPublic: true,
      image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alice',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob Williams',
      email: 'bob@example.com',
      location: 'New York, NY',
      availability: 'Evenings',
      isPublic: true,
      image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Bob',
    },
  });

  // Assign skills to users
  // Alice offers React and wants Python
  await prisma.userSkillOffered.create({ data: { userId: user1.id, skillId: createdSkills[2].id } });
  await prisma.userSkillWanted.create({ data: { userId: user1.id, skillId: createdSkills[1].id } });
  
  // Bob offers Graphic Design and Photoshop, wants Content Writing
  await prisma.userSkillOffered.create({ data: { userId: user2.id, skillId: createdSkills[4].id } });
  await prisma.userSkillOffered.create({ data: { userId: user2.id, skillId: createdSkills[5].id } });
  await prisma.userSkillWanted.create({ data: { userId: user2.id, skillId: createdSkills[7].id } });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });