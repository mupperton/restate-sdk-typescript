import { describe, expect } from "@jest/globals";
import * as restate from "../src/public_api";
import { TestDriver } from "../src/testdriver";
import {
  inputMessage,
  startMessage,
  invokeMessage,
  completionMessage,
  outputMessage,
  setStateMessage,
  backgroundInvokeMessage,
  greetRequest,
  greetResponse,
} from "./protoutils";
import {
  protoMetadata,
  TestGreeter,
  TestGreeterClientImpl,
  TestRequest,
  TestResponse,
} from "../src/generated/proto/test";
import { Failure } from "../src/generated/proto/protocol";

class ReverseAwaitOrder implements TestGreeter {
  async greet(request: TestRequest): Promise<TestResponse> {
    const ctx = restate.useContext(this);

    const client = new TestGreeterClientImpl(ctx);
    const greetingPromise1 = client.greet(
      TestRequest.create({ name: "Francesco" })
    );
    const greetingPromise2 = client.greet(TestRequest.create({ name: "Till" }));

    const greeting2 = await greetingPromise2;
    console.debug("Greeting 2 is " + greeting2.greeting);
    ctx.set<string>("A2", greeting2.greeting);

    const greeting1 = await greetingPromise1;

    return TestResponse.create({
      greeting: `Hello ${greeting1.greeting}-${greeting2.greeting}`,
    });
  }
}

class BackgroundInvokeGreeter implements TestGreeter {
  async greet(request: TestRequest): Promise<TestResponse> {
    const ctx = restate.useContext(this);

    const client = new TestGreeterClientImpl(ctx);
    await ctx.inBackground(() =>
      client.greet(TestRequest.create({ name: "Francesco" }))
    );

    return TestResponse.create({ greeting: `Hello` });
  }
}

class FailingBackgroundInvokeGreeter implements TestGreeter {
  async greet(request: TestRequest): Promise<TestResponse> {
    const ctx = restate.useContext(this);

    const client = new TestGreeterClientImpl(ctx);
    await ctx.inBackground(async () => ctx.set("state", 13));

    return TestResponse.create({ greeting: `Hello` });
  }
}

describe("ReverseAwaitOrder: None completed", () => {
  it("should call greet", async () => {
    const result = await new TestDriver(
      protoMetadata,
      "TestGreeter",
      new ReverseAwaitOrder(),
      "/dev.restate.TestGreeter/Greet",
      [startMessage(1), inputMessage(greetRequest("Till"))]
    ).run();

    expect(result).toStrictEqual([
      invokeMessage(
        "dev.restate.TestGreeter",
        "Greet",
        greetRequest("Francesco")
      ),
      invokeMessage("dev.restate.TestGreeter", "Greet", greetRequest("Till")),
    ]);
  });
});

describe("ReverseAwaitOrder: A1 and A2 completed later", () => {
  it("should call greet", async () => {
    const result = await new TestDriver(
      protoMetadata,
      "TestGreeter",
      new ReverseAwaitOrder(),
      "/dev.restate.TestGreeter/Greet",
      [
        startMessage(1),
        inputMessage(greetRequest("Till")),
        completionMessage(1, greetResponse("FRANCESCO")),
        completionMessage(2, greetResponse("TILL")),
      ]
    ).run();

    expect(result).toStrictEqual([
      invokeMessage(
        "dev.restate.TestGreeter",
        "Greet",
        greetRequest("Francesco")
      ),
      invokeMessage("dev.restate.TestGreeter", "Greet", greetRequest("Till")),
      setStateMessage("A2", "TILL"),
      outputMessage(greetResponse("Hello FRANCESCO-TILL")),
    ]);
  });
});

describe("ReverseAwaitOrder: A2 and A1 completed later", () => {
  it("should call greet", async () => {
    const result = await new TestDriver(
      protoMetadata,
      "TestGreeter",
      new ReverseAwaitOrder(),
      "/dev.restate.TestGreeter/Greet",
      [
        startMessage(1),
        inputMessage(greetRequest("Till")),
        completionMessage(2, greetResponse("TILL")),
        completionMessage(1, greetResponse("FRANCESCO")),
      ]
    ).run();

    expect(result).toStrictEqual([
      invokeMessage(
        "dev.restate.TestGreeter",
        "Greet",
        greetRequest("Francesco")
      ),
      invokeMessage("dev.restate.TestGreeter", "Greet", greetRequest("Till")),
      setStateMessage("A2", "TILL"),
      outputMessage(greetResponse("Hello FRANCESCO-TILL")),
    ]);
  });
});

describe("ReverseAwaitOrder: replay all invoke messages and setstate ", () => {
  it("should call greet", async () => {
    const result = await new TestDriver(
      protoMetadata,
      "TestGreeter",
      new ReverseAwaitOrder(),
      "/dev.restate.TestGreeter/Greet",
      [
        startMessage(4),
        inputMessage(greetRequest("Till")),
        invokeMessage(
          "dev.restate.TestGreeter",
          "Greet",
          greetRequest("Francesco"),
          greetResponse("FRANCESCO")
        ),
        invokeMessage(
          "dev.restate.TestGreeter",
          "Greet",
          greetRequest("Till"),
          greetResponse("TILL")
        ),
        setStateMessage("A2", "TILL"),
      ]
    ).run();

    expect(result).toStrictEqual([
      outputMessage(greetResponse("Hello FRANCESCO-TILL")),
    ]);
  });
});

describe("ReverseAwaitOrder: Failing A1", () => {
  it("should call greet", async () => {
    const result = await new TestDriver(
      protoMetadata,
      "TestGreeter",
      new ReverseAwaitOrder(),
      "/dev.restate.TestGreeter/Greet",
      [
        startMessage(1),
        inputMessage(greetRequest("Till")),
        completionMessage(
          1,
          undefined,
          undefined,
          Failure.create({ code: 13, message: "Error" })
        ),
        completionMessage(2, greetResponse("TILL")),
      ]
    ).run();

    expect(result).toStrictEqual([
      invokeMessage(
        "dev.restate.TestGreeter",
        "Greet",
        greetRequest("Francesco")
      ),
      invokeMessage("dev.restate.TestGreeter", "Greet", greetRequest("Till")),
      setStateMessage("A2", "TILL"),
      outputMessage(), // failure
    ]);
  });
});

// async calls
describe("BackgroundInvokeGreeter: background call ", () => {
  it("should call greet", async () => {
    const result = await new TestDriver(
      protoMetadata,
      "TestGreeter",
      new BackgroundInvokeGreeter(),
      "/dev.restate.TestGreeter/Greet",
      [startMessage(1), inputMessage(greetRequest("Till"))]
    ).run();

    expect(result).toStrictEqual([
      backgroundInvokeMessage(
        "dev.restate.TestGreeter",
        "Greet",
        greetRequest("Francesco")
      ),
      outputMessage(greetResponse("Hello")),
    ]);
  });
});

// async calls
describe("FailingBackgroundInvokeGreeter: failing background call ", () => {
  it("should call greet", async () => {
    const result = await new TestDriver(
      protoMetadata,
      "TestGreeter",
      new FailingBackgroundInvokeGreeter(),
      "/dev.restate.TestGreeter/Greet",
      [startMessage(1), inputMessage(greetRequest("Till"))]
    ).run();

    expect(result).toStrictEqual([outputMessage()]);
  });
});

// TODO also implement the other tests of the Java SDK.