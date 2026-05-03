/**
 * app/entry.server.tsx — Remix server-side rendering entry
 * Renders the React tree to a readable stream for Oxygen / Cloudflare Workers.
 */

import type { EntryContext } from "@shopify/remix-oxygen";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

const ABORT_DELAY = 5_000; // ms before we force-flush the shell

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";

  const body = await new Promise<ReadableStream>((resolve, reject) => {
    let didError = false;
    const { pipe, abort } = renderToReadableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onError(error: unknown) {
          didError = true;
          reject(error);
        },
        [callbackName]() {
          if (didError) return;
          const stream = new ReadableStream({
            start(controller) {
              pipe({
                write(chunk: Uint8Array) {
                  controller.enqueue(chunk);
                },
                end() {
                  controller.close();
                },
                on(_event: string, _cb: () => void) {
                  // no-op: ReadableStream has no event emitter
                },
              });
            },
          });
          resolve(stream);
        },
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
