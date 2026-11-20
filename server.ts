import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile, appendFile, mkdir } from "node:fs/promises";
import { join, normalize, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const DATA = join(ROOT, "data");
const PORT = Number(process.env.PORT ?? 3000);
const EMAIL = /^[^\s@,;"]+@[^\s@,;"]+\.[^\s@,;"]{2,}$/;

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function send(res: ServerResponse, status: number, body: string | Buffer, type = "application/json; charset=utf-8"): void {
  res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff" });
  res.end(body);
}

function readBody(req: IncomingMessage, limit = 4096): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");

    if (req.method === "GET" && url.pathname === "/api/products") {
      return send(res, 200, await readFile(join(DATA, "products.json"), "utf8"));
    }

    if (req.method === "POST" && url.pathname === "/api/waitlist") {
      const parsed = JSON.parse(await readBody(req)) as { email?: unknown };
      const email = typeof parsed.email === "string" ? parsed.email.trim().toLowerCase() : "";
      if (email.length > 120 || !EMAIL.test(email)) {
        return send(res, 400, JSON.stringify({ ok: false, error: "invalid email" }));
      }
      await mkdir(DATA, { recursive: true });
      await appendFile(join(DATA, "waitlist.csv"), `${email},${new Date().toISOString()}\n`);
      return send(res, 201, JSON.stringify({ ok: true }));
    }

    if (req.method === "GET") {
      const rel = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
      const file = normalize(join(PUBLIC, rel));
      if (!file.startsWith(PUBLIC + sep)) return send(res, 403, "Forbidden", "text/plain");
      const body = await readFile(file);
      return send(res, 200, body, MIME[extname(file)] ?? "application/octet-stream");
    }

    return send(res, 405, JSON.stringify({ ok: false, error: "method not allowed" }));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "EISDIR") return send(res, 404, "Not found", "text/plain");
    if (err instanceof SyntaxError || (err as Error).message === "payload too large") {
      return send(res, 400, JSON.stringify({ ok: false, error: "bad request" }));
    }
    console.error(err);
    return send(res, 500, JSON.stringify({ ok: false, error: "server error" }));
  }
});

server.listen(PORT, () => console.log(`Maison Aurelle on http://localhost:${PORT}`));
