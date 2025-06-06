import { HttpRouter } from "@effect/platform"
// import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { RpcSerialization, RpcServer } from "@effect/rpc"
import { Layer } from "effect"
import { UsersLive } from "./handlers.ts"
import { UserRpcs } from "./request.ts"
import {createServer} from 'node:http';

// Create the RPC server layer
const RpcLayer = RpcServer.layer(UserRpcs).pipe(Layer.provide(UsersLive))

// Choose the protocol and serialization format
const HttpProtocol = RpcServer.layerProtocolHttp({
  path: "/rpc"
}).pipe(Layer.provide(RpcSerialization.layerNdjson))

// Create the main server layer
const Main = HttpRouter.Default.serve().pipe(
  Layer.provide(RpcLayer),
  Layer.provide(HttpProtocol),
  Layer.provide(NodeHttpServer.layer(() => {
    const httpServer = createServer();
    // log all reqs
    httpServer.on('request', (req, res) => {
      console.log(`${req.method} ${req.url}`);
      res.on('finish', () => {
        console.log(`Response status: ${res.statusCode}`);
      });
    });
    return httpServer;
  }, { port: 3009 }))
)

console.log("Server is running on http://localhost:3009/rpc")
NodeRuntime.runMain(Layer.launch(Main))
