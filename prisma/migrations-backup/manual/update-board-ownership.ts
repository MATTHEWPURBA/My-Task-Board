// prisma/migrations-backup/manual/update-board-ownership.ts
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateBoardOwnership() {
  try {
    console.log('Starting migration: Updating board ownership...');
    
    // Get all boards without a userId
    const orphanedBoards = await prisma.board.findMany({
      where: { userId: null },
    });
    
    console.log(`Found ${orphanedBoards.length} boards without an owner.`);
    
    if (orphanedBoards.length === 0) {
      console.log('No orphaned boards to update.');
      return;
    }
    
    // Get or create a demo user to own these boards
    let demoUser = await prisma.user.findFirst({
      where: { email: { contains: 'demo' } },
    });
    
    if (!demoUser) {
      console.log('Creating a new demo user for orphaned boards...');
      demoUser = await prisma.user.create({
        data: {
          email: `demo-migration-${Date.now()}@taskboard.demo`,
          name: "Demo User",
          calendarSettings: {
            create: {
              enabled: true,
              syncCompletedTasks: true,
              syncWontDoTasks: false,
            },
          },
        },
      });
    }
    
    console.log(`Using user ${demoUser.id} to claim orphaned boards.`);
    
    // Update all orphaned boards to be owned by this user
    const result = await prisma.board.updateMany({
      where: { userId: null },
      data: { userId: demoUser.id },
    });
    
    console.log(`Updated ${result.count} boards with new owner.`);
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
updateBoardOwnership()
  .then(() => console.log('Done.'))
  .catch(e => console.error(e));