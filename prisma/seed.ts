import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "better-auth/crypto";
import crypto from "crypto";

const DIRECTORY_EMAIL = "diretoria@fanfarroes.com";
const DIRECTORY_PASSWORD = "fanfarroes123";
const DIRECTORY_NAME = "Diretoria Fanfarrões";

const FAKE_PLAYERS = [
  { name: "João Silva", type: "mensalista", isPaysMonthly: true, isDiretoria: false },
  { name: "Pedro Santos", type: "mensalista", isPaysMonthly: true, isDiretoria: false },
  { name: "Lucas Oliveira", type: "mensalista", isPaysMonthly: true, isDiretoria: false },
  { name: "Bruno Pereira", type: "mensalista", isPaysMonthly: true, isDiretoria: false },
  { name: "Rafael Costa", type: "mensalista", isPaysMonthly: true, isDiretoria: false },
  { name: "Gabriel Almeida", type: "mensalista", isPaysMonthly: true, isDiretoria: false },
  { name: "Matheus Ribeiro", type: "mensalista", isPaysMonthly: true, isDiretoria: false },
  { name: "Felipe Gomes", type: "mensalista", isPaysMonthly: true, isDiretoria: false },
  { name: "Thiago Martins", type: "mensalista", isPaysMonthly: false, isDiretoria: false },
  { name: "Diego Souza", type: "mensalista", isPaysMonthly: true, isDiretoria: false },
  { name: "Rodrigo Carvalho", type: "mensalista", isPaysMonthly: true, isDiretoria: false },
  { name: "Caio Fernandes", type: "avulso", isPaysMonthly: false, isDiretoria: false },
  { name: "Vitor Barbosa", type: "mensalista", isPaysMonthly: true, isDiretoria: true },
  { name: "André Rocha", type: "mensalista", isPaysMonthly: true, isDiretoria: false },
  { name: "Henrique Lima", type: "mensalista", isPaysMonthly: true, isDiretoria: false },
];

const FIXED_EXPENSES = [
  { description: "Aluguel da Quadra", amount: 800, isFixed: true },
  { description: "Água e Luz", amount: 150, isFixed: true },
  { description: "Material de Limpeza", amount: 80, isFixed: true },
];

const VARIABLE_EXPENSES = [
  { description: "Novas Bolas de Futebol", amount: 220, isFixed: false },
  { description: "Manutenção do Gramado", amount: 350, isFixed: false },
  { description: "Colete de Times", amount: 180, isFixed: false },
];

function generateId() {
  return crypto.randomBytes(16).toString("hex");
}

async function main() {
  console.log("🌱 Iniciando seed...");
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // ===== 1. Usuário da Diretoria (criar User e Account SEPARADAMENTE) =====
  console.log("👤 Criando usuário da diretoria...");
  const existingDirUser = await prisma.user.findUnique({ where: { email: DIRECTORY_EMAIL } });
  let dirUserId: string;
  if (!existingDirUser) {
    const hash = await hashPassword(DIRECTORY_PASSWORD);
    dirUserId = generateId();

    await prisma.user.create({
      data: {
        id: dirUserId,
        name: DIRECTORY_NAME,
        email: DIRECTORY_EMAIL,
        emailVerified: true,
        image: "/placeholder-user.jpg",
      },
    });

    await prisma.account.create({
      data: {
        id: generateId(),
        accountId: dirUserId,
        providerId: "credential",
        userId: dirUserId,
        password: hash,
      },
    });
    console.log("  ✅ Usuário diretoria criado com sucesso!");
    console.log("  📧 Email (diretoria):", DIRECTORY_EMAIL);
    console.log("  🔑 Senha:", DIRECTORY_PASSWORD);
  } else {
    dirUserId = existingDirUser.id;
    const existingAccount = await prisma.account.findFirst({ where: { userId: dirUserId, providerId: "credential" } });
    if (!existingAccount || existingAccount.password === null) {
      console.log("  ⚠️  Senha ausente na Account antiga — atualizando...");
      const hash = await hashPassword(DIRECTORY_PASSWORD);
      if (existingAccount) {
        await prisma.account.update({ where: { id: existingAccount.id }, data: { password: hash } });
      } else {
        await prisma.account.create({
          data: {
            id: generateId(),
            accountId: dirUserId,
            providerId: "credential",
            userId: dirUserId,
            password: hash,
          },
        });
      }
      console.log("  ✅ Senha atualizada!");
    } else {
      console.log("  ℹ️  Usuário diretoria já existe e senha OK.");
    }
  }

  // ===== 2. Configuração do Sistema =====
  console.log("⚙️ Configuração inicial...");
  const configExists = await prisma.config.findUnique({ where: { id: "default" } });
  if (!configExists) {
    await prisma.config.create({
      data: {
        id: "default",
        closingDay: 10,
        pixKey: "sindio@pix.com",
        monthlyFee: 80,
        pageUrl: "https://mensalistasfc.com.br",
      },
    });
    console.log("  ✅ Configuração criada.");
  } else {
    console.log("  ℹ️  Configuração já existe.");
  }

  // ===== 3. Jogadores Fictícios =====
  console.log("⚽ Criando jogadores...");
  const playerIds: Record<string, string> = {};
  for (const fake of FAKE_PLAYERS) {
    const existingP = await prisma.player.findFirst({ where: { name: fake.name } });
    if (!existingP) {
      const id = generateId();
      playerIds[fake.name] = id;
      await prisma.player.create({
        data: {
          id,
          name: fake.name,
          type: fake.type as any,
          isPaysMonthly: fake.isPaysMonthly,
          isDiretoria: fake.isDiretoria,
          active: true,
        },
      });
      console.log(`  ✅ Jogador: ${fake.name}`);
    } else {
      playerIds[fake.name] = existingP.id;
    }
  }

  // ===== 4. Pagamentos do Mês Atual =====
  console.log("💸 Gerando pagamentos do mês atual...");
  for (const fake of FAKE_PLAYERS) {
    if (fake.type !== "mensalista" || !fake.isPaysMonthly) continue;
    const playerId = playerIds[fake.name];
    const exist = await prisma.payment.findUnique({
      where: { playerId_month_year: { playerId, month: currentMonth, year: currentYear } },
    });
    if (!exist) {
      const r = Math.random();
      const randomStatus = r > 0.35 ? "pago" : r > 0.5 ? "nao_pago" : "nao_compareceu";
      const paidAt = randomStatus === "pago" ? new Date() : null;
      await prisma.payment.create({
        data: {
          id: generateId(),
          playerId,
          month: currentMonth,
          year: currentYear,
          status: randomStatus as any,
          paidAt,
        },
      });
    }
  }
  console.log("  ✅ Pagamentos do mês gerados.");

  // ===== 5. Gastos do Mês =====
  console.log("💰 Criando gastos...");
  const allExpenses = [...FIXED_EXPENSES, ...VARIABLE_EXPENSES];
  for (const exp of allExpenses) {
    const exist = await prisma.expense.findFirst({
      where: {
        description: exp.description,
        month: currentMonth,
        year: currentYear,
      },
    });
    if (!exist) {
      await prisma.expense.create({
        data: {
          id: generateId(),
          description: exp.description,
          amount: exp.amount,
          month: currentMonth,
          year: currentYear,
          isFixed: exp.isFixed,
        },
      });
      console.log(`  ✅ Gasto: ${exp.description} - R$ ${exp.amount}`);
    }
  }

  console.log("\n🎉 SEED CONCLUÍDO COM SUCESSO! 🎉");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
