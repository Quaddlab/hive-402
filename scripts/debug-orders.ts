import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      skill: true,
    },
  });

  console.log("--- ALL ORDERS ---");
  orders.forEach((o) => {
    console.log(`  Skill: ${o.skill.title}`);
    console.log(`  Buyer: ${o.buyerAddress}`);
    console.log(`  Status: ${o.status}`);
    console.log("------------------");
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
