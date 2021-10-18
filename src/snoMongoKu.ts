/**
 * MongoDB simple wrapper, Provide simple method in chinese to handle the mongodb.
 * author: YiDong Zhuo(snomiao@gmail.com)
 */

import mongodb, { FilterQuery, UpdateOneOptions, UpdateQuery } from "mongodb";
import { type } from "os";
import PQueue from "p-queue";

// ref https://zhuanlan.zhihu.com/p/59434318
const 返回值类型获取 = <T>(_需推断函数: (_: any) => T): T => ({} as T);
const 合集增强虚拟返回值 = 返回值类型获取(合集增强);
type 增强合集 = typeof 合集增强虚拟返回值;

const 雪芒果库虚拟返回值 = 返回值类型获取(snoMongoKu);
// type snoMongoKuPromise = typeof 雪芒果库虚拟返回值;

interface snoMongoKuRaw extends mongodb.Db {
    _client: mongodb.MongoClient;
}
interface snoMongoKuEnhanced {
    [k: string]: 增强合集;
}
// interface snoMongoKu extends snoMongoKuRaw, snoMongoKuEnhanced { }
type snoMongoKu = snoMongoKuRaw & snoMongoKuEnhanced;
export = snoMongoKu;
async function snoMongoKu(uri: string): Promise<snoMongoKu> {
    const client = await mongodb.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    return new Proxy(client.db(), {
        get: (t: any, p) =>
            p === "_client"
                ? client
                : t[p] ?? 合集增强(t.collection(p.toString())),
    });
}

type 表 = { _id?: mongodb.ObjectID | any; [x: string]: any };
function 合集增强(合集: mongodb.Collection) {
    return Object.assign(合集, {
        单增: 合集.insertOne,
        单删: 合集.deleteOne,
        单改: 合集.updateOne,
        单查: 合集.findOne,
        单查替: 合集.findOneAndReplace,
        单查改: 合集.findOneAndUpdate,
        单查删: 合集.findOneAndDelete,
        单补: (
            表: 表,
            索引: 表 = { _id: 1 },
            选项?: mongodb.UpdateOneOptions
        ) =>
            合集.updateOne(
                Object.fromEntries(Object.keys(索引).map((键) => [键, 表[键]])),
                { $set: 表 },
                { upsert: true, ...选项 }
            ),
        单增改: ((查询: any, 更新: any, options: any, cb?: any) =>
            合集.updateOne(
                查询,
                更新,
                { upsert: true, ...options },
                cb
            )) as typeof 合集.updateOne,
        upsertOne: ((查询: any, 更新: any, options: any, cb?: any) =>
            合集.updateOne(
                查询,
                更新,
                { upsert: true, ...options },
                cb
            )) as typeof 合集.updateOne,
        多增: 合集.insertMany,
        多删: 合集.deleteMany,
        多改: 合集.updateMany,
        多查: 合集.find,
        多查数: (
            查询表: mongodb.FilterQuery<any> = {},
            选项?: mongodb.FindOneOptions<any>
        ) => 合集.find(查询表, 选项).count(),
        多查列: (
            查询表: mongodb.FilterQuery<any> = {},
            选项?: mongodb.FindOneOptions<any>
        ) => 合集.find(查询表, 选项).toArray(),
        多补: (
            表列: 表[],
            索引: 表 = { _id: 1 },
            选项?: mongodb.CollectionBulkWriteOptions
        ) =>
            合集.bulkWrite(
                表列.map((表: 表) => ({
                    updateOne: {
                        filter: Object.fromEntries(
                            Object.keys(索引).map((键) => [键, 表[键]])
                        ),
                        update: { $set: 表 },
                        upsert: true,
                    },
                })),
                选项
            ),
        多增改: ((查询: any, 更新: any, options: any, cb?: any) =>
            合集.updateMany(
                查询,
                更新,
                { upsert: true, ...options },
                cb
            )) as typeof 合集.updateMany,
        upsertMany: ((查询: any, 更新: any, options: any, cb?: any) =>
            合集.updateMany(
                查询,
                更新,
                { upsert: true, ...options },
                cb
            )) as typeof 合集.updateMany,
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
        /**
         * 并行聚合更新，常用于合集扫描操作，
         * @param pipeline MongoDB 标准聚合 pipeline。
         * @param 更新函数，接受参数：扫描到的文档 doc、当前序号 index，如需更新，则返回一个 updateOne 中的更新操作，否则请返回 null 表示不需要更新。
         * @returns 若没有错误发生，则返回成功扫描的数量。
         */
        并行聚合更新: async (
            pipeline: {
                $match?: FilterQuery<any>;
                $sample?: { size: number };
                $limit?: number;
                $sort?: any;
                $project?: any;
                [k: string]: any;
            }[],
            更新函数: (
                doc: any,
                index: number
            ) => Promise<UpdateQuery<any> | void> | UpdateQuery<any> | void,
            { 并行数 = 1, 止于错 = true, 错误输出 = true } = {}
        ) => {
            let index = 0;
            const q = new PQueue({ concurrency: 并行数 });
            const 错误列 = [];
            for await (const doc of 合集.aggregate(pipeline)) {
                if (!doc._id) throw new TypeError("doc._id is required");
                await q.onEmpty();
                q.add(async () => {
                    try {
                        const UpdateQuery = await 更新函数(doc, index);
                        UpdateQuery &&
                            (await 合集
                                .updateOne({ _id: doc._id }, UpdateQuery)
                                .catch((e) => {
                                    throw new Error(
                                        `错误：在${
                                            合集.collectionName
                                        }尝试更新错误: ${JSON.stringify(
                                            UpdateQuery
                                        )}, 具体错误内容${e.message}`
                                    );
                                    // throw e;
                                }));
                    } catch (err) {
                        if (止于错) throw err;
                        else 错误列.push(err);
                    }
                });
                index++;
            }
            await q.onIdle();
            if (错误列.length) {
                错误输出 && console.error(错误列);
                throw AggregateError(错误列);
            }
            return index;
        },
        /**
         * 英文写法的并行聚合更新，常用于合集扫描操作，
         * @param pipeline MongoDB 标准聚合 pipeline。
         * @param 更新函数，接受参数：扫描到的文档 doc、当前序号 index，如需更新，则返回一个 updateOne 中的更新操作，否则请返回 null 表示不需要更新。
         * @returns 若没有错误发生，则返回成功扫描的数量。
         */
        parallelAggregateUpdate: async (
            pipeline: {
                $match?: FilterQuery<any>;
                $sample?: { size: number };
                $limit?: number;
                $sort?: any;
                $project?: any;
                [k: string]: any;
            }[],
            更新函数: (
                doc: any,
                index: number
            ) => Promise<UpdateQuery<any> | void> | UpdateQuery<any> | void,
            { concurrency = 1, stopOnErrors = true, showErrors = true } = {}
        ) => {
            let index = 0;
            const q = new PQueue({ concurrency: concurrency });
            const 错误列 = [];
            for await (const doc of 合集.aggregate(pipeline)) {
                if (!doc._id) throw new TypeError("doc._id is required");
                await q.onEmpty();
                q.add(async () => {
                    try {
                        const UpdateQuery = await 更新函数(doc, index);
                        UpdateQuery &&
                            (await 合集.updateOne(
                                { _id: doc._id },
                                UpdateQuery
                            ));
                    } catch (err) {
                        if (stopOnErrors) throw err;
                        else 错误列.push(err);
                    }
                });
                index++;
            }
            await q.onIdle();
            if (错误列.length) {
                showErrors && console.error(错误列);
                throw AggregateError(错误列);
            }
            return index;
        },
        并行各改: async (
            func: (
                doc: any,
                index: number,
                count: number
            ) => Promise<UpdateQuery<any> | void> | UpdateQuery<any> | void,
            {
                $match,
                $sample,
                $limit,
                $sort,
                $project,
            }: {
                $match?: FilterQuery<any>;
                $sample?: { size: number };
                $limit?: number;
                $sort?: any;
                $project?: any;
            } = {},
            { 并行数 = 1, 止于错 = true, 错误输出 = true, 先计数 = true } = {}
        ) => {
            let index = 0,
                count = (先计数 && (await 合集.countDocuments($match))) || null;
            const q = new PQueue({ concurrency: 并行数 });
            const 错误列 = [];
            for await (const doc of 合集.aggregate(
                [
                    $match && { $match },
                    $sample && { $sample },
                    $sort && { $sort },
                    $project && { $project },
                    $limit && { $limit },
                ].filter((e) => e)
            )) {
                if (!doc._id) throw new TypeError("doc._id is required");
                await q.onEmpty();
                q.add(async () => {
                    try {
                        const UpdateQuery = await func(doc, index, count);
                        UpdateQuery &&
                            (await 合集.updateOne(
                                { _id: doc._id },
                                UpdateQuery
                            ));
                    } catch (err) {
                        if (止于错) throw err;
                        else 错误列.push(err);
                    }
                });
                index++;
            }
            await q.onIdle();
            if (错误列.length) {
                错误输出 && console.error(错误列);
                throw AggregateError(错误列);
            }
            return index;
        },
    });
}
