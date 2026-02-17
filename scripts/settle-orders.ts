import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.order.updateMany({
    where: {
      status: "pending",
    },
    data: {
      status: "settled",
    },
  });

  console.log(`✅ Settled ${result.count} pending orders.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
