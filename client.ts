// client.ts
import { FetchHttpClient } from "@effect/platform"
import { RpcClient, RpcSerialization } from "@effect/rpc"
import { Chunk, Effect, Layer, Option, Stream } from "effect"
import { UserRpcs } from "./request.js"

// Choose which protocol to use
const p0 = RpcClient.layerProtocolHttp({
  url: "http://localhost:3009/rpc"
})
const ProtocolLive = p0.pipe(
  Layer.provide([
    // use fetch for http requests
    FetchHttpClient.layer,
    // use ndjson for serialization
    RpcSerialization.layerNdjson
  ])
)

// Use the client
// const program = Effect.gen(function* () {
//   const client = yield* RpcClient.make(UserRpcs)
//   let users = yield* Stream.runCollect(client.UserList({}))
//   if (Option.isNone(Chunk.findFirst(users, (user) => user.id === "3"))) {
//     console.log(`Creating user "Charlie"`)
//     yield* client.UserCreate({ name: "Charlie" })
//     users = yield* Stream.runCollect(client.UserList({}))
//   } else {
//     console.log(`User "Charlie" already exists`)
//   }
//   return users
// }).pipe(Effect.scoped)
const program2 = Effect.gen(function* () {
  const client = yield* RpcClient.make(UserRpcs)
  const now = yield* client.Now();
  return now;
}).pipe(Effect.scoped)

program2.pipe(Effect.provide(ProtocolLive), Effect.runPromise).then(console.log)
