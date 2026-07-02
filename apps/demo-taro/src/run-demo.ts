import { 创建Demo快照 } from "./index.js"

const 快照 = await 创建Demo快照()

console.log(JSON.stringify(快照, null, 2))
