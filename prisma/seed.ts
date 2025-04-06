import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a default board
  const defaultBoard = await prisma.board.create({
    data: {
      name: 'My Task Board',
      description: 'Default task board',
      tasks: {
        create: [
          {
            name: 'Task in Progress',
            description: 'This is a task currently in progress',
            icon: '⏳',
            status: 'In Progress',
          },
          {
            name: 'Task Completed',
            description: 'This is a completed task',
            icon: '✅',
            status: 'Completed',
          },
          {
            name: 'Task Won\'t Do',
            description: 'This is a task that won\'t be done',
            icon: '❌',
            status: 'Won\'t do',
          },
        ],
      },
    },
  })

  console.log(`Created default board with ID: ${defaultBoard.id}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })