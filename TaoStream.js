import {Events} from './events.js'

const metaOpen = '['
const metaClose = ']'
const metaOp = '`'
export const TaoStream = () => {
  let depth = 0, buffer = [], isOp = false
  const debugInfo = (symbol) => JSON.stringify({
    depth,
    buffer, 
    ...(symbol === undefined? {done: true}: {symbol}),
  })
  return {
    done: () => {
      if (isOp) {
        throw Error(`Unexpected stream end after op! ${debugInfo()}`)
      } else if (depth > 0) {
        throw Error(`Unexpected end of stream before close! ${debugInfo()}`)
      }
      const ret = {event: Events.finish, buffer}
      buffer = []
      return ret
    },
    next: (symbol) => {
      if (isOp) {
        isOp = false
        const ret = {event: Events.op, symbol, buffer}
        buffer = []
        return ret
      } else if (symbol === metaOpen) {
        depth += 1
        const ret = {event: Events.open, buffer}
        buffer = []
        return ret
      } else if (symbol === metaClose) {
        if (depth > 0) {
          depth -= 1
          const ret = {event: Events.close, buffer}
          buffer = []
          return ret
        } else {
          throw Error(`Unexpected top-level close! ${debugInfo(symbol)}`)
        }
      } else if (symbol === metaOp) {
        isOp = true
      } else {
        buffer.push(symbol)
      }
    }
  }
}