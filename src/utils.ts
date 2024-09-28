export function validateSplitLootEntry(entry: string): boolean {
  const sessionDataRegex =
    /^Session data: From (\d{4}-\d{2}-\d{2}), (\d{2}:\d{2}:\d{2}) to (\d{4}-\d{2}-\d{2}), (\d{2}:\d{2}:\d{2})\nSession: (\d{2}:\d{2})h\nLoot Type: (\w+)\nLoot: ([\d,]+)\nSupplies: ([\d,]+)\nBalance: ([\d,]+)((\n.+?( \(Leader\))?\n {4}Loot: [\d,]+\n {4}Supplies: [\d,]+\n {4}Balance: [\d,]+\n {4}Damage: [\d,]+\n {4}Healing: [\d,]+)*)$/m;
  return sessionDataRegex.test(entry);
}

export interface Player {
  name: string;
  isLeader: boolean;
  loot: number;
  supplies: number;
  balance: number;
  damage: number;
  healing: number;
}

export interface DistributionData {
  name: string;
  percentage: number;
}

export interface QuantityData {
  name: string;
  qty: number;
}

export interface SessionSummary {
  totalBalance: number;
  individualBalance: number;
  lootPerHour: number;
  numPlayers: number;
  damageDistribution: DistributionData[];
  healingDistribution: DistributionData[];
  transferInstructions: { from: string; to: string; amount: number }[];
  sessionDuration: string;
  sessionDate: string;
  players: Player[];
}

export function parseSessionData(input: string): SessionSummary {
  // Regex para extraer las fechas de inicio y fin de la sesión
  const sessionDataRegex =
    /Session data: From (\d{4}-\d{2}-\d{2}, \d{2}:\d{2}:\d{2}) to (\d{4}-\d{2}-\d{2}, \d{2}:\d{2}:\d{2})/;
  const sessionMatch = input.match(sessionDataRegex);

  if (!sessionMatch) {
    throw new Error("No se pudo extraer la información de la sesión");
  }

  const startDateStr = sessionMatch[1]; // "2024-05-31, 18:09:33"
  const endDateStr = sessionMatch[2]; // "2024-05-31, 18:42:23"

  // Convertir las cadenas a objetos Date
  const startDate = new Date(startDateStr.replace(",", ""));
  const endDate = new Date(endDateStr.replace(",", ""));

  // Calcular la duración de la sesión
  const durationMs = endDate.getTime() - startDate.getTime();
  const sessionDuration = new Date(durationMs).toISOString().slice(11, 19); // "00:32:50"

  // Formatear la fecha de inicio para mostrarla como la sesión
  const sessionDate = startDate.toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  // Regex para extraer datos generales de la sesión
  const generalDataRegex = /Balance: ([\d,]+)/;
  const balanceTotalMatch = input.match(generalDataRegex);
  const balanceTotal = balanceTotalMatch
    ? parseInt(balanceTotalMatch[1].replace(/,/g, ""), 10)
    : 0;

  // Regex para extraer datos de jugadores (nombre, loot, supplies, balance, damage, healing)
  const playerDataRegex =
    /(\w+(?: \w+)*(?: \(Leader\))?)\n\s+Loot: ([\d,]+)\n\s+Supplies: ([\d,]+)\n\s+Balance: ([\d,]+)\n\s+Damage: ([\d,]+)\n\s+Healing: ([\d,]+)/g;

  const players: Player[] = [];
  let match: RegExpExecArray | null;

  while ((match = playerDataRegex.exec(input)) !== null) {
    const isLeader = match[1].includes("(Leader)");
    const playerName = match[1].replace(" (Leader)", ""); // Eliminar "(Leader)" del nombre

    players.push({
      name: playerName,
      isLeader: isLeader,
      loot: parseInt(match[2].replace(/,/g, ""), 10),
      supplies: parseInt(match[3].replace(/,/g, ""), 10),
      balance: parseInt(match[4].replace(/,/g, ""), 10),
      damage: parseInt(match[5].replace(/,/g, ""), 10),
      healing: parseInt(match[6].replace(/,/g, ""), 10),
    });
  }

  // Cálculo de balances, daños, curación y loot por hora
  const numPlayers = players.length;
  const individualBalance = balanceTotal / numPlayers;

  const totalDamage = players.reduce((acc, player) => acc + player.damage, 0);
  const totalHealing = players.reduce((acc, player) => acc + player.healing, 0);

  const totalLoot = players.reduce((acc, player) => acc + player.loot, 0);
  const sessionDurationInMinutes = durationMs / 60000; // Duración en minutos
  const lootPerHour = totalLoot / (sessionDurationInMinutes / 60);

  // Distribución de daño y curación en porcentajes
  const damageDistribution = players.map((player) => ({
    name: player.name,
    percentage: parseFloat(((player.damage / totalDamage) * 100).toFixed(2)),
  }));

  const healingDistribution = players.map((player) => ({
    name: player.name,
    percentage: parseFloat(((player.healing / totalHealing) * 100).toFixed(2)),
  }));

  // Cálculo de las transferencias mínimas
  const playersOweMoney = players
    .filter((player) => player.balance < individualBalance)
    .map((player) => ({
      name: player.name,
      owes: individualBalance - player.balance,
    }));

  const playersHaveExtra = players
    .filter((player) => player.balance > individualBalance)
    .map((player) => ({
      name: player.name,
      extra: player.balance - individualBalance,
    }));

  let i = 0,
    j = 0;
  const transferInstructions: { from: string; to: string; amount: number }[] =
    [];

  while (i < playersOweMoney.length && j < playersHaveExtra.length) {
    const owePlayer = playersOweMoney[i];
    const havePlayer = playersHaveExtra[j];

    const transferAmount = Math.min(owePlayer.owes, havePlayer.extra);

    transferInstructions.push({
      from: havePlayer.name,
      to: owePlayer.name,
      amount: Math.round(transferAmount),
    });

    // Actualizar los valores después de la transferencia
    owePlayer.owes -= transferAmount;
    havePlayer.extra -= transferAmount;

    // Si el jugador ya ha equilibrado su deuda, pasamos al siguiente
    if (owePlayer.owes === 0) {
      i++;
    }

    // Si el jugador ya ha transferido todo su excedente, pasamos al siguiente
    if (havePlayer.extra === 0) {
      j++;
    }
  }

  // Crear el objeto de salida
  const sessionSummary: SessionSummary = {
    totalBalance: balanceTotal,
    individualBalance: Math.round(individualBalance),
    lootPerHour: Math.round(lootPerHour),
    numPlayers,
    damageDistribution,
    healingDistribution,
    transferInstructions,
    sessionDuration,
    sessionDate,
    players,
  };

  return sessionSummary;
}
