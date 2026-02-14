const { PrismaClient } = require("@prisma/client");
console.log("PrismaClient properties:", Object.keys(new PrismaClient()));
try {
  const p = new PrismaClient({ datasourceUrl: "test" });
} catch (e) {
  console.log("Error with datasourceUrl:", e.message);
}
try {
  const p = new PrismaClient({ url: "test" });
} catch (e) {
  console.log("Error with url:", e.message);
}
