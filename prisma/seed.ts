// File: prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Start Seeding ---');

    await prisma.$transaction(async (tx) => {
        console.log('Clearing old data...');
        await tx.rating.deleteMany({});
        await tx.userSkillOffered.deleteMany({});
        await tx.userSkillWanted.deleteMany({});
        await tx.swapRequest.deleteMany({});
        await tx.skill.deleteMany({});
        await tx.user.deleteMany({});
        console.log('Old data cleared.');

        const skillsToCreate = [
            'JavaScript', 'Python', 'React', 'Node.js', 'Graphic Design',
            'Photoshop', 'Video Editing', 'Content Writing', 'SEO', 'Public Speaking',
            'Data Analysis', 'UX/UI Design', 'Digital Marketing', 'Project Management'
        ];
        const skills = await Promise.all(
            skillsToCreate.map(name => tx.skill.create({ data: { name } }))
        );
        console.log(`Created ${skills.length} skills.`);

        const usersData = [
            {
                name: 'Alice Johnson', email: 'alice@example.com', location: 'San Francisco, CA', availability: 'Weekends',
                image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alice',
                offered: [skills[0], skills[2]], wanted: [skills[1], skills[10]]
            },
            {
                name: 'Bob Williams', email: 'bob@example.com', location: 'New York, NY', availability: 'Evenings',
                image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Bob',
                offered: [skills[4], skills[5]], wanted: [skills[7]]
            },
            {
                name: 'Charlie Brown', email: 'charlie@example.com', location: 'Chicago, IL', availability: 'Weekdays',
                image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Charlie',
                offered: [skills[9], skills[13]], wanted: [skills[8]]
            }
        ];

        console.log('Creating users...');
        for (const userData of usersData) {
            const user = await tx.user.create({ data: { name: userData.name, email: userData.email, location: userData.location, availability: userData.availability, image: userData.image, isPublic: true } });
            for (const skill of userData.offered) {
                await tx.userSkillOffered.create({ data: { userId: user.id, skillId: skill.id } });
            }
            for (const skill of userData.wanted) {
                await tx.userSkillWanted.create({ data: { userId: user.id, skillId: skill.id } });
            }
        }
        console.log(`Created ${usersData.length} users and assigned skills.`);
    });

    console.log('--- Seeding Finished ---');
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });