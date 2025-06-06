import { Rpc, RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import {Temporal} from 'temporal-polyfill';

// Define a user with an ID and name
export class User extends Schema.Class<User>("User")({
  id: Schema.String, // User's ID as a string
  name: Schema.String // User's name as a string
}) {}

const TemporalInstantFromSelf = Schema.declare(
  (input: unknown) => input instanceof Temporal.Instant,
)
const TemporalInstantTransform = Schema.transform(
  Schema.String,
  TemporalInstantFromSelf,
  {
    encode: (input: Temporal.Instant) => input.toString(),
    decode: (input: string) => Temporal.Instant.from(input)
  },
);
const decode = Schema.decodeUnknownSync(TemporalInstantFromSelf)



// Define a group of RPCs for user management.
// You can use the `RpcGroup.make` function to create a group of RPCs.
export class UserRpcs extends RpcGroup.make(
  // Request to retrieve a list of users
  Rpc.make("UserList", {
    success: User, // Succeed with a stream of users
    stream: true
  }),
  Rpc.make("Now", {
    success: TemporalInstantTransform,
  }),
  Rpc.make("UserById", {
    success: User,
    error: Schema.String, // Indicates that errors, if any, will be returned as strings
    payload: {
      id: Schema.String
    }
  }),
  Rpc.make("UserCreate", {
    success: User,
    payload: {
      name: Schema.String
    }
  })
) {}