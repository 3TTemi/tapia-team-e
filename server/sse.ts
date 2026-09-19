import type { ServerResponse } from "node:http";

export type SSEEvent = { event: string; data: string };

export function writeSSE(res: ServerResponse) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
}

export function sendSSE(res: ServerResponse, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export function parseSSE(buffer: string): { events: SSEEvent[]; rest: string } {
  const events: SSEEvent[] = [];
  let rest = buffer;
  while (true) {
    const split = rest.indexOf("\n\n");
    if (split === -1) break;
    const block = rest.slice(0, split);
    rest = rest.slice(split + 2);
    if (!block.trim()) continue;
    let event = "message";
    const dataLines: string[] = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (dataLines.length) events.push({ event, data: dataLines.join("\n") });
  }
  return { events, rest };
}
