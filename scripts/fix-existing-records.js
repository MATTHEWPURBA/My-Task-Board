// scripts/fix-existing-records.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixExistingRecords() {
  try {
    console.log('Updating existing user records...');
    
    // Update all users with a proper updatedAt value
    const usersResult = await prisma.user.updateMany({
      where: {},
      data: {
        updatedAt: new Date()
      }
    });
    
    console.log(`Updated ${usersResult.count} user records`);
    
    // Update all boards with proper updatedAt values
    const boardsResult = await prisma.board.updateMany({
      where: {},
      data: {
        updatedAt: new Date()
      }
    });
    
    console.log(`Updated ${boardsResult.count} board records`);
    
    // Update all tasks with proper updatedAt values
    const tasksResult = await prisma.task.updateMany({
      where: {},
      data: {
        updatedAt: new Date()
      }
    });
    
    console.log(`Updated ${tasksResult.count} task records`);
    
    // Try to find boards without users and associate them with users
    const orphanedBoards = await prisma.board.findMany({
      where: { userId: null },
    });
    
    if (orphanedBoards.length > 0) {
      console.log(`Found ${orphanedBoards.length} boards without owners`);
      
      // Find a demo user to own these boards
      let demoUser = await prisma.user.findFirst({
        where: { email: { contains: 'demo' } },
      });
      
      if (!demoUser) {
        console.log('Creating a demo user for orphaned boards');
        demoUser = await prisma.user.create({
          data: {
            email: `demo-fix-${Date.now()}@taskboard.demo`,
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
      
      // Update orphaned boards
      const updateResult = await prisma.board.updateMany({
        where: { userId: null },
        data: { userId: demoUser.id },
      });
      
      console.log(`Associated ${updateResult.count} boards with user ${demoUser.id}`);
    }
    
    console.log('Data cleanup completed successfully!');
  } catch (error) {
    console.error('Error fixing records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
fixExistingRecords()
  .then(() => console.log('Done.'))
  .catch(e => console.error(e));