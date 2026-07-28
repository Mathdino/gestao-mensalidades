import { pgTable, text, timestamp, boolean, integer, numeric, pgEnum } from 'drizzle-orm/pg-core'

// --- Better Auth required tables ---
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- Enums ---
export const playerTypeEnum = pgEnum('player_type', ['mensalista', 'avulso'])
export const paymentStatusEnum = pgEnum('payment_status', ['pago', 'nao_pago', 'nao_compareceu'])

// --- App tables ---

// Configurações gerais do sistema (uma linha só)
export const config = pgTable('config', {
  id: text('id').primaryKey().default('default'),
  closingDay: integer('closing_day').notNull().default(10),
  pixKey: text('pix_key').notNull().default(''),
  monthlyFee: numeric('monthly_fee', { precision: 10, scale: 2 }).notNull().default('0'),
  pageUrl: text('page_url').notNull().default(''),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Jogadores
export const players = pgTable('players', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: playerTypeEnum('type').notNull().default('mensalista'),
  isPaysMonthly: boolean('is_pays_monthly').notNull().default(true), // se paga mensalidade
  isDiretoria: boolean('is_diretoria').notNull().default(false),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Pagamentos mensais (um registro por jogador por mês)
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull(),
  month: integer('month').notNull(), // 1-12
  year: integer('year').notNull(),
  status: paymentStatusEnum('status').notNull().default('nao_pago'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Gastos mensais
export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  isFixed: boolean('is_fixed').notNull().default(false), // gastos fixos (ex: aluguel da quadra)
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
