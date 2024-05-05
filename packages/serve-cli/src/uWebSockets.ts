import { registerTerminateHandler } from '@graphql-mesh/utils';
import { ServerOptions } from './types.js';

export async function startuWebSocketsServer({
  handler,
  logger,
  protocol,
  host,
  port,
  sslCredentials,
}: ServerOptions): Promise<void> {
  return import('uWebSockets.js').then(uWS => {
    const app = sslCredentials ? uWS.SSLApp(sslCredentials) : uWS.App();
    app.any('/*', handler);
    logger.info(`Starting server on ${protocol}://${host}:${port}`);
    return new Promise<void>((resolve, reject) => {
      app.listen(host, port, function listenCallback(listenSocket) {
        if (listenSocket) {
          registerTerminateHandler(eventName => {
            logger.info(`Closing ${protocol}://${host}:${port} for ${eventName}`);
            app.close();
          });
          resolve();
        } else {
          reject(new Error(`Failed to start server on ${protocol}://${host}:${port}!`));
        }
      });
    });
  });
}
