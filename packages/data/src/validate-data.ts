import {
  内置城市列表,
  内置行政区列表,
  数据来源,
  数据版本,
  校验内置数据,
} from "./index.js"

const 问题列表 = 校验内置数据()

if (问题列表.length > 0) {
  console.error(
    `validate:data failed version=${数据版本.编码} cities=${内置城市列表.length} regions=${内置行政区列表.length}`,
  )
  for (const 问题 of 问题列表) {
    console.error(`${问题.代码}${问题.编码 ? ` ${问题.编码}` : ""}: ${问题.消息}`)
  }
  process.exitCode = 1
} else {
  console.log(
    `validate:data version=${数据版本.编码} cities=${内置城市列表.length} regions=${内置行政区列表.length}`,
  )
  console.log(
    `validate:data levels province=${数据来源.记录数量.省级} city=${数据来源.记录数量.地级} county=${数据来源.记录数量.县级} township=${数据来源.记录数量.乡级} hmt=${数据来源.记录数量.港澳台}`,
  )
  console.log(
    `validate:data source=${数据来源.来源名称} type=${数据来源.来源类型} cutoff=${数据来源.数据截止日期}`,
  )
  console.log("validate:data ok")
}
