"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Não autorizado");
  return session.user.id;
}

export async function getConfig() {
  const row = await prisma.config.findUnique({ where: { id: "default" } });
  if (!row) {
    return {
      id: "default",
      closingDay: 10,
      pixKey: "",
      monthlyFee: "0",
      pageUrl: "",
      updatedAt: new Date().toISOString(),
    };
  }
  return {
    id: row.id,
    closingDay: row.closingDay,
    pixKey: row.pixKey,
    monthlyFee: row.monthlyFee.toString(),
    pageUrl: row.pageUrl,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function saveConfig(data: {
  closingDay: number;
  pixKey: string;
  monthlyFee: string;
  pageUrl: string;
}) {
  await getUserId();

  const existing = await prisma.config.findUnique({ where: { id: "default" } });
  if (existing) {
    await prisma.config.update({
      where: { id: "default" },
      data: { ...data, updatedAt: new Date() },
    });
  } else {
    await prisma.config.create({
      data: { id: "default", ...data, updatedAt: new Date() },
    });
  }

  revalidatePath("/");
  revalidatePath("/diretoria");
}

export async function getExpenses(month: number, year: number) {
  const expenses = await prisma.expense.findMany({
    where: { month, year },
    orderBy: { createdAt: "desc" },
  });
  return expenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: e.amount.toString(),
    month: e.month,
    year: e.year,
    isFixed: e.isFixed,
    createdAt: e.createdAt.toISOString(),
  }));
}

export async function addExpense(
  description: string,
  amount: string,
  month: number,
  year: number,
  isFixed: boolean,
) {
  await getUserId();
  await prisma.expense.create({
    data: {
      id: nanoid(),
      description,
      amount,
      month,
      year,
      isFixed,
    },
  });
  revalidatePath("/diretoria");
}

export async function deleteExpense(id: string) {
  await getUserId();
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/diretoria");
}

export async function getFinancialSummary(month: number, year: number) {
  const allPayments = await prisma.payment.findMany({
    where: { month, year },
  });

  const paidCount = allPayments.filter((p) => p.status === "pago").length;
  const notPaidCount = allPayments.filter(
    (p) => p.status === "nao_pago",
  ).length;
  const notAttendedCount = allPayments.filter(
    (p) => p.status === "nao_compareceu",
  ).length;

  const monthExpenses = await prisma.expense.findMany({
    where: { month, year },
  });

  const totalExpenses = monthExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount.toString()),
    0,
  );

  const cfg = await getConfig();
  const fee = parseFloat(cfg.monthlyFee || "0");
  const totalRevenue = paidCount * fee;
  const balance = totalRevenue - totalExpenses;

  const expenses = monthExpenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: e.amount.toString(),
    month: e.month,
    year: e.year,
    isFixed: e.isFixed,
    createdAt: e.createdAt.toISOString(),
  }));

  return {
    paidCount,
    notPaidCount,
    notAttendedCount,
    totalRevenue,
    totalExpenses,
    balance,
    fee,
    expenses,
  };
}

export async function getAvailableMonths() {
  const paymentMonths = await prisma.payment.groupBy({
    by: ["month", "year"],
    _count: { _all: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
  const expenseMonths = await prisma.expense.groupBy({
    by: ["month", "year"],
    _count: { _all: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const keySet = new Map<
    string,
    { month: number; year: number; hasPayments: boolean; hasExpenses: boolean }
  >();

  for (const pm of paymentMonths) {
    const key = `${pm.year}-${pm.month}`;
    keySet.set(key, {
      month: pm.month,
      year: pm.year,
      hasPayments: true,
      hasExpenses: false,
    });
  }
  for (const em of expenseMonths) {
    const key = `${em.year}-${em.month}`;
    const existing = keySet.get(key);
    if (existing) {
      existing.hasExpenses = true;
    } else {
      keySet.set(key, {
        month: em.month,
        year: em.year,
        hasPayments: false,
        hasExpenses: true,
      });
    }
  }

  const months = Array.from(keySet.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return months;
}

export async function loadHistoricalMonth(month: number, year: number) {
  const [payments, expenses, summary] = await Promise.all([
    prisma.payment.findMany({
      where: { month, year },
      include: { player: true },
      orderBy: [{ player: { name: "asc" } }],
    }),
    prisma.expense.findMany({
      where: { month, year },
      orderBy: { createdAt: "desc" },
    }),
    getFinancialSummary(month, year),
  ]);

  const paymentsView = payments.map((p) => ({
    id: p.id,
    playerId: p.playerId,
    status: p.status,
    paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    player: p.player
      ? {
          id: p.player.id,
          name: p.player.name,
          type: p.player.type,
          isPaysMonthly: p.player.isPaysMonthly,
          isDiretoria: p.player.isDiretoria,
        }
      : null,
  }));

  const expensesView = expenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: e.amount.toString(),
    isFixed: e.isFixed,
    createdAt: e.createdAt.toISOString(),
  }));

  return {
    month,
    year,
    payments: paymentsView,
    expenses: expensesView,
    summary,
  };
}
