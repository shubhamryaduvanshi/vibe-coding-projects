const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const recipes = await prisma.recipe.findMany({ include: { ingredients: true } });
  console.log('Total recipes:', recipes.length);
  const withIngredients = recipes.filter(r => r.ingredients.length > 0);
  console.log('Recipes with ingredients:', withIngredients.length);
  if (withIngredients.length > 0) {
    console.log('First with ingredients:', JSON.stringify(withIngredients[0], null, 2));
  }
}
main().finally(() => prisma.$disconnect());
