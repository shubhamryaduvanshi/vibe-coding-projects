const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const recipe = await prisma.recipe.findFirst({ include: { ingredients: true } });
  console.log(JSON.stringify(recipe, null, 2));
}
main().finally(() => prisma.$disconnect());
