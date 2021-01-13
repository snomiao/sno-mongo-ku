"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.本地日志测试 = void 0;
const mongodb = __importStar(require("mongodb"));
if (module === require.main)
    (async () => {
        await 本地日志测试();
    })().then(console.log).catch(console.error);
async function 本地日志测试() {
    const 本地库 = snoMongoKu('mongodb://localhost:27017/');
    (async () => {
        const 日志 = 本地库('测试')('日志');
        await 日志.增({ 消息: `连接成功`, 刻: +new Date() });
        console.log(await 日志.查列({}));
    })().finally(() => 本地库.断开());
    /** avaliable functions
     增, 增补, 增列, 增补列,
     删,
     查, 查找, 查数, 查列,
     改, 聚合,
     映射,
     */
}
exports.本地日志测试 = 本地日志测试;
function snoMongoKu(URI, 库名) {
    const _连接 = mongodb.MongoClient.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const 连接 = function (库名) {
        const 合集 = (集合名) => {
            const _集合 = (async () => (await _连接).db(库名).collection(集合名))();
            const 增 = async (表, 选项) => (await _集合).insertOne(表, 选项);
            const 增补 = async (表, 索引键列 = ['_id'], 选项) => await (await _集合).updateOne(Object.fromEntries(索引键列.map(键 => [键, 表[键]])), { $set: 表 }, { upsert: true });
            const 增列 = async (表列, 选项) => (await _集合).insertMany(表列, 选项);
            const 增补列 = async (表列, 索引键列 = ['_id'], 选项) => (await _集合).bulkWrite(表列.map((表) => ({ updateOne: { filter: Object.fromEntries(索引键列.map(键 => [键, 表[键]])), update: { $set: 表 }, upsert: true } })), 选项);
            const 删 = async (查询表, 选项) => (await _集合).deleteOne(查询表, 选项);
            const 查 = async (查询表, 选项) => (await _集合).find(查询表, 选项);
            const 查找 = async (查询表, 选项) => await (await _集合).findOne(查询表, 选项);
            const 查数 = async (查询表, 选项) => await (await _集合).find(查询表, 选项).count();
            const 查列 = async (查询表, 选项) => await (await _集合).find(查询表, 选项).toArray();
            const 改 = async (查询表, 操作, 选项) => await (await _集合).updateOne(查询表, 操作, 选项);
            const 聚合 = async (操作列, 选项) => (await _集合).aggregate(操作列, 选项);
            const 映射 = async (函数, 查询表, 查询选项, 索引键列 = ["_id"], 增补选项) => (await 增补列(await Promise.all((await 查列(查询表, 查询选项)).map(函数)), 索引键列, 增补选项));
            const 索引 = async (索引表, 选项) => (await _集合).createIndex(索引表, 选项);
            return {
                增, 增补, 增列, 增补列,
                删,
                查, 查找, 查数, 查列,
                改, 聚合,
                索引,
                映射,
                _集合, _连接,
            };
        };
        return 合集;
    };
    连接.断开 = async () => await (await _连接).close();
    return 连接;
}
exports.default = snoMongoKu;
