/*
 * Copyright (c) 2023-2024 - Restate Software, Inc., Restate GmbH
 *
 * This file is part of the Restate SDK for Node.js/TypeScript,
 * which is released under the MIT license.
 *
 * You can find a copy of the license in file LICENSE in the root
 * directory of this repository or package, or at
 * https://github.com/restatedev/sdk-typescript/blob/main/LICENSE
 */

import type { TestGreeter, TestRequest } from "./testdriver.js";
import { TestDriver, TestResponse } from "./testdriver.js";
import type * as restate from "../src/public_api.js";
import { greetRequest, inputMessage, startMessage } from "./protoutils.js";
import { describe, it } from "vitest";

const greeter: TestGreeter = {
  // eslint-disable-next-line @typescript-eslint/require-await
  greet: async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ctx: restate.ObjectContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    req: TestRequest
  ): Promise<TestResponse> => {
    return TestResponse.create({ greeting: `Hello` });
  },
};

const greeterFoo = {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  greet(ctx: restate.ObjectContext, req: TestRequest): Promise<TestResponse> {
    return this.foo(ctx, req);
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  async foo(
    ctx: restate.ObjectContext,
    req: TestRequest
  ): Promise<TestResponse> {
    return TestResponse.create({ greeting: `Hello` });
  },
};

describe("BindService", () => {
  it("should bind object literals", async () => {
    await new TestDriver(greeter, [
      startMessage({ knownEntries: 1 }),
      inputMessage(greetRequest("Pete")),
    ]).run();
  });

  it("should bind and preserve `this`", async () => {
    await new TestDriver(greeterFoo, [
      startMessage({ knownEntries: 1 }),
      inputMessage(greetRequest("Pete")),
    ]).run();
  });
});
