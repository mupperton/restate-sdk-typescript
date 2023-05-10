"use strict";

import { ProtocolMode } from "../generated/proto/discovery";
import { incomingConnectionAtPort } from "../connection/http_connection";
import { DurableExecutionStateMachine } from "../state_machine";
import { BaseRestateServer, ServiceOpts } from "./base_restate_server";
import { rlog } from "../utils/logger";

/**
 * Creates a Restate entrypoint based on a HTTP2 server. The entrypoint will listen
 * for requests to the services at a specified port.
 *
 * This is the entrypoint to be used in most scenarios (standalone, Docker, Kubernetes, ...);
 * any deployments that forwards requests to a network endpoint. The prominent exception is
 * AWS Lambda, which uses the {@link restate_lambda_handler#lambdaApiGatewayHandler}
 * function to create an entry point.
 *
 * After creating this endpoint, register services on this entrypoint via {@link RestateServer.bindService }
 * and start it via {@link RestateServer.listen }.
 *
 * @example
 * A typical entry point would look like this:
 * ```
 * import * as restate from "@restatedev/restate-sdk";
 *
 * export const handler = restate
 *   .createServer()
 *   .bindService({
 *      service: "MyService",
 *      instance: new myService.MyServiceImpl(),
 *      descriptor: myService.protoMetadata,
 *    })
 *   .listen(8000);
 * ```
 */
export function createServer(): RestateServer {
  return new RestateServer();
}

/**
 * Restate entrypoint implementation for services. This server receives and
 * decodes the requests, streams events between the service and the Restate runtime,
 * and drives the durable execution of the service invocations.
 */
export class RestateServer extends BaseRestateServer {
  constructor() {
    super(ProtocolMode.BIDI_STREAM);
  }
  /**
   * Adds a gRPC service to be served from this endpoint.
   *
   * The {@link ServiceOpts} passed here need to describe the following properties:
   *
   *   - The 'service' name: the name of the gRPC service (as in the service definition proto file).
   *   - The service 'instance': the implementation of the service logic (must implement the generated
   *     gRPC service interface).
   *   - The gRPC/protobuf 'descriptor': The protoMetadata descriptor that describes the service, methods,
   *     and parameter types. It is usually found as the value 'protoMetadata' in the generated
   *     file '(service-name).ts'
   *
   *     The descriptor is generated by the protobuf compiler and needed by Restate to reflectively discover
   *     the service details, understand payload serialization, perform HTTP/JSON-to-gRPC transcoding, or
   *     to proxy the service.
   *
   * If you define multiple services in the same '.proto' file, you may have only one descriptor that
   * describes all services together. You can pass the same descriptor to multiple calls of '.bindService()'.
   *
   * If you don't find the gRPC/protobuf descriptor, make your you generated the gRPC/ProtoBuf code with
   * the option to generate the descriptor. For example, using the 'ts-proto' plugin, make sure you pass
   * the 'outputSchema=true' option. If you are using Restate's project templates, this should all be
   * pre-configured for you.
   *
   * @example
   * ```
   * endpoint.bindService({
   *   service: "MyService",
   *   instance: new myService.MyServiceImpl(),
   *   descriptor: myService.protoMetadata
   * })
   * ```
   *
   * @param serviceOpts The options describing the service to be bound. See above for a detailed description.
   * @returns An instance of this RestateServer
   */
  public bindService(serviceOpts: ServiceOpts): RestateServer {
    // Implementation note: This override if here mainly to change the return type to the more
    // concrete type RestateServer (from BaseRestateServer).
    super.bindService(serviceOpts);
    return this;
  }

  /**
   * Starts the Restate server and listens at the given port.
   *
   * If the port is undefined, this method will use the port set in the `PORT`
   * environment variable. If that variable is undefined as well, the method will
   * default to port 8080.
   *
   * This method's result promise never completes.
   *
   * @param port The port to listen at. May be undefined (see above).
   */
  public async listen(port?: number) {
    // Infer the port if not specified, or default it
    const actualPort = port ?? parseInt(process.env.PORT ?? "8080");
    rlog.info(`Listening on ${actualPort}...`);

    for await (const connection of incomingConnectionAtPort(
      actualPort,
      this.discovery
    )) {
      const method = this.methodByUrl(connection.url.path);
      if (method === undefined) {
        rlog.error(`No service found for URL ${connection.url.path}`);
        rlog.trace();
        // Respons 404 and end the stream.
        connection.respond404();
      } else {
        connection.respondOk();
        new DurableExecutionStateMachine(
          connection,
          method,
          ProtocolMode.BIDI_STREAM
        );
      }
    }
  }
}
