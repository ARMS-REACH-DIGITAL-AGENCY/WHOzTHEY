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

    const columnRows = await sql`
      select table_name, column_name, data_type, is_nullable, column_default
      from information_schema.columns
      where table_schema = 'public'
      order by table_name, ordinal_position
    `;

    const columnsByTable = {};
    for (const row of columnRows) {
      if (!columnsByTable[row.table_name]) columnsByTable[row.table_name] = [];
      columnsByTable[row.table_name].push(row);
    }

    return Response.json({
      ok: true,
      tables: rows.map((row) => row.table_name),
      columns: columnsByTable,
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
