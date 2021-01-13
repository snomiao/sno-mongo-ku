import * as mongodb from 'mongodb'

if (module === require.main) (async () => {
    await 本地日志测试()
})().then(console.log).catch(console.error)

export async function 本地日志测试() {
    const 本地库 = snoMongoKu('mongodb://localhost:27017/');
    (async () => {
        const 日志 = 本地库('测试')('日志')
        await 日志.增({ 消息: `连接成功`, 刻: +new Date() })
        console.log(await 日志.查列({}))
    })().finally(() => 本地库.断开())
    
    /** avaliable functions
     增, 增补, 增列, 增补列,
     删,
     查, 查找, 查数, 查列,
     改, 聚合,
     映射,
     */
}
export default function snoMongoKu(URI: string, 库名?: string) {
    const _连接: Promise<mongodb.MongoClient> = mongodb.MongoClient.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    const 连接 = function (库名: string) {
        const 合集 = (集合名: string) => {
            const _集合: Promise<mongodb.Collection<any>> = (async () => (await _连接).db(库名).collection(集合名))()
            const 增 = async (表: any, 选项?: mongodb.CollectionInsertOneOptions) => (await _集合).insertOne(表, 选项)
            const 增补 = async (表: { [x: string]: any }, 索引键列: string[] = ['_id'], 选项?: any) => await (await _集合).updateOne(Object.fromEntries(索引键列.map(键 => [键, 表[键]])), { $set: 表 }, { upsert: true })
            const 增列 = async (表列: any[], 选项?: mongodb.CollectionInsertManyOptions) => (await _集合).insertMany(表列, 选项)
            const 增补列 = async (表列: any[], 索引键列: string[] = ['_id'], 选项?: mongodb.CollectionBulkWriteOptions) => (await _集合).bulkWrite(表列.map((表: { [x: string]: any }) => ({ updateOne: { filter: Object.fromEntries(索引键列.map(键 => [键, 表[键]])), update: { $set: 表 }, upsert: true } })), 选项)
            const 删 = async (查询表: mongodb.FilterQuery<any>, 选项: mongodb.CommonOptions & { bypassDocumentValidation?: boolean }) => (await _集合).deleteOne(查询表, 选项)
            const 查 = async (查询表: mongodb.FilterQuery<any>, 选项?: mongodb.FindOneOptions<any>) => (await _集合).find(查询表, 选项)
            const 查找 = async (查询表: mongodb.FilterQuery<any>, 选项?: mongodb.FindOneOptions<any>) => await (await _集合).findOne(查询表, 选项)
            const 查数 = async (查询表: mongodb.FilterQuery<any>, 选项?: mongodb.FindOneOptions<any>) => await (await _集合).find(查询表, 选项).count()
            const 查列 = async (查询表: mongodb.FilterQuery<any>, 选项?: mongodb.FindOneOptions<any>) => await (await _集合).find(查询表, 选项).toArray()
            const 改 = async (查询表: mongodb.FilterQuery<any>, 操作: mongodb.UpdateQuery<any>, 选项?: mongodb.UpdateOneOptions) => await (await _集合).updateOne(查询表, 操作, 选项)
            const 聚合 = async (操作列: object[], 选项: mongodb.CollectionAggregationOptions) => (await _集合).aggregate(操作列, 选项)
            const 映射 = async (函数: (value: any, index: number, array: any[]) => PromiseLike<({ _id: string })>, 查询表: mongodb.FilterQuery<any>, 查询选项?: mongodb.FindOneOptions<any>, 索引键列: string[] = ["_id"], 增补选项?: mongodb.CollectionBulkWriteOptions) => (await 增补列(await Promise.all((await 查列(查询表, 查询选项)).map(函数)), 索引键列, 增补选项))
            const 索引 = async (索引表: any, 选项: mongodb.IndexOptions) => (await _集合).createIndex(索引表, 选项)
            return {
                增, 增补, 增列, 增补列,
                删,
                查, 查找, 查数, 查列,
                改, 聚合,
                索引,
                映射,
                _集合, _连接,
            }
        }
        return 合集
    }
    连接.断开 = async () => await (await _连接).close()
    return 连接
}