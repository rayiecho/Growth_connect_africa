import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { checkRateLimit } from "@/lib/engine/rateLimit";

type RateLimitConfig = {
  key: string | ((req: NextRequest) => string | Promise<string>);
  maxRequests: number;
  windowSeconds: number;
  message?: string;
  buildResponse?: (message: string) => NextResponse;
};

type RouteHandler<Context> = (req: NextRequest, context: Context) => Promise<NextResponse> | NextResponse;

export function withRateLimit<Context = unknown>(config: RateLimitConfig) {
  return function (handler: RouteHandler<Context>): RouteHandler<Context> {
    return async (req: NextRequest, context: Context): Promise<NextResponse> => {
      const cfContext = await getCloudflareContext();
      const kv = (cfContext?.env as any)?.TOKEN_CACHE;

      const resolvedKey =
        typeof config.key === "function"
          ? await config.key(req)
          : `${config.key}:${req.headers.get("cf-connecting-ip") || "unknown"}`;

      const limit = await checkRateLimit(kv, resolvedKey, config.maxRequests, config.windowSeconds);
      if (!limit.allowed) {
        const message = config.message || "Too many requests. Please try again later.";
        return config.buildResponse ? config.buildResponse(message) : NextResponse.json({ error: message }, { status: 429 });
      }

      return handler(req, context);
    };
  };
}
