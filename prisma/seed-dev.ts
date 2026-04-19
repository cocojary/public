import { seedRoles } from "../src/server/actions/seedRoles";
import { seedDevQuestions } from "../src/server/actions/seedDevQuestionsAction";
import db from "../src/server/db";

async function main() {
  console.log("🚀 Bắt đầu quá trình seed dữ liệu SOTA V4...");
  try {
    console.log("1. Seed Roles...");
    await seedRoles();
    
    console.log("2. Seed Questions...");
    const response = await seedDevQuestions();
    response.results.forEach((msg) => console.log(msg));
    
    console.log("✨ Quá trình seed hoàn tất thành công!");
  } catch (error) {
    console.error("❌ Lỗi trong quá trình seed:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
