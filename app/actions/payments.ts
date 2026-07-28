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

export async function getMonthPayments(month: number, year: number) {
  const allPlayers = await prisma.player.findMany({
    where: {
      active: true,
      type: "mensalista",
    },
    orderBy: { name: "asc" },
  });

  const monthPayments = await prisma.payment.findMany({
    where: { month, year },
  });

  const paymentsMap = new Map(monthPayments.map((p) => [p.playerId, p]));

  return allPlayers.map((player) => {
    const p = paymentsMap.get(player.id);
    const payment = p
      ? {
          id: p.id,
          playerId: p.playerId,
          month: p.month,
          year: p.year,
          status: p.status,
          paidAt: p.paidAt ? p.paidAt.toISOString() : null,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }
      : null;

    return {
      player: {
        id: player.id,
        name: player.name,
        type: player.type,
        isPaysMonthly: player.isPaysMonthly,
        isDiretoria: player.isDiretoria,
        active: player.active,
        createdAt: player.createdAt.toISOString(),
      },
      payment,
      status: !player.isPaysMonthly ? "isento" : payment?.status || "nao_pago",
    };
  });
}

export async function updatePaymentStatus(
  playerId: string,
  month: number,
  year: number,
  status: "pago" | "nao_pago" | "nao_compareceu",
) {
  await getUserId();

  const existing = await prisma.payment.findUnique({
    where: { playerId_month_year: { playerId, month, year } },
  });

  if (existing) {
    await prisma.payment.update({
      where: { id: existing.id },
      data: {
        status,
        paidAt: status === "pago" ? new Date() : null,
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        id: nanoid(),
        playerId,
        month,
        year,
        status,
        paidAt: status === "pago" ? new Date() : null,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/diretoria");
}

export async function initializeMonthPayments(month: number, year: number) {
  await getUserId();

  const mensalistas = await prisma.player.findMany({
    where: {
      active: true,
      type: "mensalista",
      isPaysMonthly: true,
    },
  });

  for (const player of mensalistas) {
    const existing = await prisma.payment.findUnique({
      where: { playerId_month_year: { playerId: player.id, month, year } },
    });

    if (!existing) {
      await prisma.payment.create({
        data: {
          id: nanoid(),
          playerId: player.id,
          month,
          year,
          status: "nao_pago",
        },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/diretoria");
}
