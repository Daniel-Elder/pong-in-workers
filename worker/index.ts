export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

interface ScoreRow {
  id: number;
  initials: string;
  score: number;
  created_at: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/scores" && request.method === "GET") {
      const results = await env.DB.prepare(
        "SELECT id, initials, score, created_at FROM scores ORDER BY score DESC LIMIT 10"
      ).all<ScoreRow>();

      const scores = (results.results || []).map((row) => ({
        id: row.id,
        initials: row.initials,
        score: row.score,
        createdAt: row.created_at,
      }));

      return Response.json(scores);
    }

    if (url.pathname === "/api/scores" && request.method === "POST") {
      try {
        const body = await request.json() as { initials?: string; score?: number };

        const initials = (body.initials || "").toUpperCase().slice(0, 3);
        if (!initials || initials.length < 1) {
          return Response.json(
            { message: "Initials are required", field: "initials" },
            { status: 400 }
          );
        }

        const score = body.score;
        if (typeof score !== "number" || score < 0 || !Number.isInteger(score)) {
          return Response.json(
            { message: "Score must be a non-negative integer", field: "score" },
            { status: 400 }
          );
        }

        const result = await env.DB.prepare(
          "INSERT INTO scores (initials, score, created_at) VALUES (?, ?, datetime('now')) RETURNING id, initials, score, created_at"
        )
          .bind(initials, score)
          .first<ScoreRow>();

        if (!result) {
          return Response.json({ message: "Failed to create score" }, { status: 500 });
        }

        return Response.json(
          {
            id: result.id,
            initials: result.initials,
            score: result.score,
            createdAt: result.created_at,
          },
          { status: 201 }
        );
      } catch {
        return Response.json({ message: "Invalid request body" }, { status: 400 });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
