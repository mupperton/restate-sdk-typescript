/*
 * Copyright (c) 2023-2023 - Restate Software, Inc., Restate GmbH
 *
 * This file is part of the Restate SDK for Node.js/TypeScript,
 * which is released under the MIT license.
 *
 * You can find a copy of the license in file LICENSE in the root
 * directory of this repository or package, or at
 * https://github.com/restatedev/sdk-typescript/blob/main/LICENSE
 */

/* eslint-disable no-console */

import * as restate from "@restatedev/restate-sdk-clients";

import type { CounterObject, GreeterService } from "./example";

const Greeter: GreeterService = { name: "greeter" };
const Counter: CounterObject = { name: "counter" };

const ingress = restate.connect({ url: "http://localhost:8080" });

const simpleCall = async (name: string) => {
  const greeter = ingress.serviceClient(Greeter);
  const greeting = await greeter.greet(name);

  console.log(greeting);
};

const objectCall = async (name: string) => {
  const counter = ingress.objectClient(Counter, name);
  const count = await counter.count();

  console.log(`The count for ${name} is ${count}`);
};

const idempotentCall = async (name: string, idempotencyKey: string) => {
  const greeter = ingress.serviceClient(Greeter);

  // send the request with the idempotent key, and ask restate
  // to remember that key for 3 seconds.
  const greeting = await greeter.greet(
    name,
    restate.Opts.from({ idempotencyKey })
  );

  console.log(greeting);
};

const customHeadersCall = async (name: string) => {
  const greeter = ingress.serviceClient(Greeter);

  const greeting = await greeter.greet(
    name,
    restate.Opts.from({ headers: { "x-bob": "1234" } })
  );

  console.log(greeting);
};

const globalCustomHeaders = async (name: string) => {
  const ingress = restate.connect({
    url: "http://localhost:8080",
    headers: { Authorization: "Bearer mytoken123" },
  });

  const greeting = await ingress.serviceClient(Greeter).greet(name);

  console.log(greeting);
};

const delayedCall = async (name: string) => {
  const ingress = restate.connect({
    url: "http://localhost:8080",
  });

  const greeting = await ingress
    .serviceSendClient(Greeter)
    .greet(name, restate.SendOpts.from({ delay: 1000 }));

  console.log(greeting);
};

const customInterface = async (name: string) => {
  // This example demonstrates how to invoke a service
  // potentially written in a different language / or we can't
  // import its type definition.
  //
  // To call that service, simply write down the interface
  // and pass it trough
  interface SomeService {
    greet(name: string): Promise<string>;
  }

  const svc = ingress.serviceClient<SomeService>({
    name: "greeter",
  });

  const greeting = await svc.greet(name);

  console.log(greeting);
};

// Before running this example, make sure
// to run and register `greeter` and `counter` services.
//
// to run them, run:
//
// 1. npm run example
// 2. make sure that restate is running
// 3. restate deployment add localhost:9080

Promise.resolve()
  .then(() => simpleCall("bob"))
  .then(() => objectCall("bob"))
  .then(() => objectCall("mop"))
  .then(() => idempotentCall("joe", "idemp-1"))
  .then(() => idempotentCall("joe", "idemp-1"))
  .then(() => customHeadersCall("bob"))
  .then(() => globalCustomHeaders("bob"))
  .then(() => customInterface("bob"))
  .then(() => delayedCall("bob"))
  .catch((e) => console.error(e));