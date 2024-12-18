import { defineConfig } from '@mikro-orm/mysql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { SeedManager } from '@mikro-orm/seeder';

export default defineConfig({
  host: process.env.DB_HOST || 'localhost',
  // @ts-expect-error nestjs adapter option
  port: parseInt(process.env.DB_PORT, 10) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME || 'nestjsrealworld',
  entities: ['dist/**/*.entity.js'], // Use compiled entities in production
  entitiesTs: ['src/**/*.entity.ts'], // Use TypeScript entities in development
  debug: process.env.NODE_ENV !== 'production', // Enable debug only in dev
  highlighter: new SqlHighlighter(),
  metadataProvider: TsMorphMetadataProvider,
  // @ts-expect-error nestjs adapter option
  registerRequestContext: false, // Disable request context for stateless apps like NestJS
  extensions: [Migrator, EntityGenerator, SeedManager],
});
