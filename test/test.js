import snoMongoKu from "../dist/snoMongoKu.mjs";
import "dotenv/config";

describe("Connect", async function () {
    const { MONGO_URI } = process.env;
    let db;
    before("open", async function () {
        console.log('connecting to', MONGO_URI)
        db = await snoMongoKu(MONGO_URI);
    });

    it("Insert", async function () {
        await db.日志.单增({
            创建于: new Date(),
            内容: "测试/(20210304)",
            标记: "asdf",
        });
        console.table(await db.日志.多查列({}));
    });
    it("Upsert", async function () {
        await db.日志.单补(
            { 修改于: new Date(), 内容: "测试2333", 标记: "asdf" },
            { 标记: 1 }
        );
        console.table(await db.日志.多查列({}));
    });

    after("close", async function () {
        await db._client.close(); // not needed actually because it's a pool
        console.log("db closed");
    });
});
