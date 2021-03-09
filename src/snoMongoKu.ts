/**
 * MongoDB simple wrapper, Provide simple method in chinese to handle the mongodb.
 * author: YiDong Zhuo(snomiao@gmail.com)
 */

import mongodb, { FilterQuery, UpdateOneOptions, UpdateQuery } from 'mongodb'
import PQueue from 'p-queue';

// 这个等号很重要


// unit test
if (require.main === module) (async () => {
    require('dotenv').config()
    const { MONGO_URI } = process.env;
    const db = await snoMongoKu(MONGO_URI || 'mongodb://localhost:27017/测试')
    await db.日志.单增({ 创建于: new Date(), 内容: '测试/(20210304)', 标记: 'asdf' })
    console.table(await db.日志.多查列({}))
    await db.日志.单补({ 修改于: new Date(), 内容: '测试2333', 标记: 'asdf' }, { 标记: 1 })
    console.table(await db.日志.多查列({}))
    await db._client.close()
})().then(console.log).catch(console.error)

export = snoMongoKu
async function snoMongoKu(uri: string) {
    const client = await mongodb.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    return new Proxy(client.db(), { get: (t, p) => p === '_client' ? client : t[p] ?? 合集增强(t.collection(p.toString())) }
    ) as (mongodb.Db & { _client: mongodb.MongoClient, _demoCollection: 增强合集, _示例合集: 增强合集 } & { [k: string]: 增强合集 })
}

type 表 = { _id?: mongodb.ObjectID | any, [x: string]: any; }
const 合集增强 = (合集: mongodb.Collection) => Object.assign(合集, {
    单增: 合集.insertOne,
    单删: 合集.deleteOne,
    单改: 合集.updateOne,
    单查: 合集.findOne,
    单查替: 合集.findOneAndReplace,
    单查改: 合集.findOneAndUpdate,
    单查删: 合集.findOneAndDelete,
    单补: (表: 表, 索引: 表 = { _id: 1 }, 选项?: mongodb.UpdateOneOptions) => 合集.updateOne(Object.fromEntries(Object.keys(索引).map(键 => [键, 表[键]])), { $set: 表 }, { upsert: true, ...选项 }),
    单增改: ((查询: any, 更新: any, options: any, cb?: any) => 合集.updateOne(查询, 更新, { upsert: true, ...options }, cb)) as typeof 合集.updateOne,
    upsertOne: ((查询: any, 更新: any, options: any, cb?: any) => 合集.updateOne(查询, 更新, { upsert: true, ...options }, cb)) as typeof 合集.updateOne,
    多增: 合集.insertMany,
    多删: 合集.deleteMany,
    多改: 合集.updateMany,
    多查: 合集.find,
    多查数: (查询表: mongodb.FilterQuery<any> = {}, 选项?: mongodb.FindOneOptions<any>) => 合集.find(查询表, 选项).count(),
    多查列: (查询表: mongodb.FilterQuery<any> = {}, 选项?: mongodb.FindOneOptions<any>) => 合集.find(查询表, 选项).toArray(),
    多补: (表列: 表[], 索引: 表 = { _id: 1 }, 选项?: mongodb.CollectionBulkWriteOptions) => 合集.bulkWrite(表列.map((表: 表) => ({ updateOne: { filter: Object.fromEntries(Object.keys(索引).map(键 => [键, 表[键]])), update: { $set: 表 }, upsert: true } })), 选项),
    多增改: ((查询: any, 更新: any, options: any, cb?: any) => 合集.updateMany(查询, 更新, { upsert: true, ...options }, cb)) as typeof 合集.updateMany,
    upsertMany: ((查询: any, 更新: any, options: any, cb?: any) => 合集.updateMany(查询, 更新, { upsert: true, ...options }, cb)) as typeof 合集.updateMany,
    聚合: 合集.aggregate,
    索引: 合集.createIndex,
    索引删: 合集.dropIndex,
    复索引: 合集.createIndexes,
    复索引删: 合集.dropIndexes,
    状态: 合集.stats,
    数量估计: 合集.estimatedDocumentCount,
    监视: 合集.watch,
    改名: 合集.rename,
    名称: 合集.collectionName,
    去重: 合集.distinct,
    销毁: 合集.drop,
    并行各改: async (
        func: (doc: any, index: number, count: number) => Promise<UpdateQuery<any> | void> | void,
        { $match, $sample, $limit, $sort, $project }: {
            $match?: FilterQuery<any>, $sample?: { size: number },
            $limit?: number, $sort?: any, $project?: any
        } = {},
        { 并行数 = 1, 止于错 = true, 错归集 = true, 先计数 = true } = {}
    ) => {
        let index = 0, count = 先计数 && await 合集.countDocuments($match) || null
        const q = new PQueue({ concurrency: 并行数 })
        const 错误列 = []
        for await (const doc of 合集.aggregate([
            $match && { $match },
            $sample && { $sample },
            $sort && { $sort }, // sort 要在limit之前
            $project && { $project }, //出于索引性能的原因 project要放在sort之后
            $limit && { $limit },
        ].filter(e => e))) {
            await q.onEmpty(); q.add(async () => {
                const UpdateQuery = await func(doc, index, count)
                UpdateQuery && await 合集.updateOne({ _id: doc._id }, UpdateQuery)
            }).catch((err) => { if (止于错) throw err; 错误列.push(err) })
            index++
        }
        if (错归集 && 错误列.length) throw AggregateError(错误列)
        return count
    }
})
// ref https://zhuanlan.zhihu.com/p/59434318
const 返回值类型获取 = <T>(_需推断函数: (_: any) => T): T => ({} as T)
const 合集增强虚拟返回值 = 返回值类型获取(合集增强);
type 增强合集 = typeof 合集增强虚拟返回值;
