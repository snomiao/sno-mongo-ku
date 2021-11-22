// ES Module 加载并运行
import snoMongoKu from "sno-mongo-ku";
(await import("dotenv")).default.config();
const { MONGO_URI } = process.env;
if (MONGO_URI) {
    const db = await snoMongoKu(MONGO_URI);
    await db.日志.单增({
        创建于: new Date(),
        内容: "测试/(20210304)",
        标记: "asdf",
    });
    console.table(await db.日志.多查列({}));
    await db.日志.单补(
        { 修改于: new Date(), 内容: "测试2333", 标记: "asdf" },
        { 标记: 1 }
    );
    console.table(await db.日志.多查列({}));
    await db._client.close(); // not needed actually because it's a pool
}
console.log('test done');