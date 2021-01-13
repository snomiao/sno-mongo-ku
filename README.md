# snoMongoKu

a wrapper to mongodb driver, provide simple method in chinese to handle the mongodb.

Have fun~

```typescript
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
```