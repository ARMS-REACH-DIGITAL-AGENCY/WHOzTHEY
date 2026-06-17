import { neon } from "@neondatabase/serverless";

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  );
}

export async function GET() {
  try {
    const databaseUrl = getDatabaseUrl();

    if (!databaseUrl) {
      return Response.json(
        {
          ok: false,
          error:
            "Missing database URL. Expected DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL_NON_POOLING.",
        },
        { status: 500 }
      );
    }

    const sql = neon(databaseUrl);

    const rows = await sql`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by table_name
    `;

    const visitors = await sql`select session_id, firebase_uid, email, display_name, persona, source, created_at, updated_at from visitors order by created_at desc limit 10`;

    return Response.json({
      ok: true,
      tables: rows.map((row) => row.table_name),
      visitorCount: visitors.length,
      visitors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
