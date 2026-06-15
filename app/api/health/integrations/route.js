export async function GET() {
  const checks = {
    neon: {
      databaseUrlExists: Boolean(process.env.DATABASE_URL),
      postgresUrlExists: Boolean(process.env.POSTGRES_URL),
      postgresPrismaUrlExists: Boolean(process.env.POSTGRES_PRISMA_URL),
      postgresUrlNonPoolingExists: Boolean(process.env.POSTGRES_URL_NON_POOLING),
    },
    firebasePublic: {
      apiKeyExists: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
      authDomainExists: Boolean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
      projectIdExists: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      storageBucketExists: Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
      messagingSenderIdExists: Boolean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
      appIdExists: Boolean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
      measurementIdExists: Boolean(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
    },
  };

  return Response.json({
    ok: true,
    checks,
    timestamp: new Date().toISOString(),
  });
}
