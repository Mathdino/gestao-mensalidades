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

export async function getPlayers() {
  const allPlayers = await prisma.player.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return allPlayers.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    isPaysMonthly: p.isPaysMonthly,
    isDiretoria: p.isDiretoria,
    active: p.active,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function addPlayer(
  name: string,
  type: "mensalista" | "avulso",
  isPaysMonthly: boolean,
) {
  await getUserId();
  const id = nanoid();
  await prisma.player.create({
    data: {
      id,
      name: name.trim(),
      type,
      isPaysMonthly,
      isDiretoria: false,
      active: true,
    },
  });

  if (type === "mensalista" && isPaysMonthly) {
    const now = new Date();
    const paymentId = nanoid();
    await prisma.payment.create({
      data: {
        id: paymentId,
        playerId: id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        status: "nao_pago",
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/diretoria");
  return { id };
}

export async function updatePlayer(
  playerId: string,
  data: {
    name?: string;
    type?: "mensalista" | "avulso";
    isPaysMonthly?: boolean;
    isDiretoria?: boolean;
  },
) {
  await getUserId();
  await prisma.player.update({
    where: { id: playerId },
    data,
  });
  revalidatePath("/");
  revalidatePath("/diretoria");
}

export async function deactivatePlayer(playerId: string) {
  await getUserId();
  await prisma.player.update({
    where: { id: playerId },
    data: { active: false },
  });
  revalidatePath("/");
  revalidatePath("/diretoria");
}

export async function getPlayerPaymentHistory(playerId: string) {
  const history = await prisma.payment.findMany({
    where: { playerId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
  return history.map((p) => ({
    id: p.id,
    playerId: p.playerId,
    month: p.month,
    year: p.year,
    status: p.status,
    paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}
