import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./components/ui/chart";
import {
  buildDiscordCopyText,
  DistributionData,
  QuantityData,
  SessionSummary,
} from "./utils";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function CopyableCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  console.log(command);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center space-x-2 bg-muted rounded-md p-2">
      <code className="flex-grow font-mono text-sm">{command}</code>
      <Button
        variant="ghost"
        size="icon"
        onClick={copyToClipboard}
        className="h-6 w-6"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

function CopyButton({ copyText }: { copyText: string }) {
  const [copied, setCopied] = useState(false);
  console.log(copyText);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={copyToClipboard}
      className="h-6 w-6"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

function QuantityBarChart({
  data,
  title,
}: {
  data: QuantityData[];
  title: string;
}) {
  const chartConfig: ChartConfig = data.reduce((acc, data, index) => {
    acc[data.name] = {
      label: data.name,
      color: COLORS[index], // Mapping percentage to color opacity
      // Optional: You can also map to the theme instead, based on conditions
      // theme: THEMES.light,  // Example theme assignment
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ChartContainer config={chartConfig}>
        <BarChart
          accessibilityLayer
          data={data.map((playerStat) => {
            const fill = chartConfig[playerStat.name].color;
            return { ...playerStat, fill };
          })}
          layout="vertical"
          margin={{
            left: 0,
          }}
        >
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            hide
          />
          <XAxis dataKey="qty" type="number" hide />
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          <Bar dataKey="qty" layout="vertical" radius={5} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function DistributionChart({
  data,
  title,
}: {
  data: DistributionData[];
  title: string;
}) {
  const chartConfig: ChartConfig = data.reduce((acc, data, index) => {
    acc[data.name] = {
      label: data.percentage,
      color: COLORS[index], // Mapping percentage to color opacity
      // Optional: You can also map to the theme instead, based on conditions
      // theme: THEMES.light,  // Example theme assignment
    };
    return acc;
  }, {} as ChartConfig);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent nameKey="percentage" hideLabel />}
          />
          <Pie
            data={data.map((playerStat) => {
              const fill = chartConfig[playerStat.name].color;
              return { ...playerStat, fill };
            })}
            dataKey="percentage"
          >
            <LabelList
              dataKey="name"
              className="fill-background"
              stroke="none"
              fontSize={12}
              formatter={(value: keyof typeof chartConfig) =>
                chartConfig[value]?.label + "%"
              }
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}

export default function SumaryStats({
  sessionSummary,
}: {
  sessionSummary: SessionSummary;
}) {
  const {
    numPlayers,
    sessionDate,
    sessionDuration,
    totalBalance,
    individualBalance,
    lootPerHour,
    damageDistribution,
    healingDistribution,
    transferInstructions,
  } = sessionSummary;
  const transactionsByPlayer = transferInstructions.reduce((r, a) => {
    r[a.from] = r[a.from] || [];
    r[a.from].push(a);
    return r;
  }, Object.create(null));
  return (
    sessionSummary && (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Party Hunt Session - {numPlayers} members
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {sessionDate} ({sessionDuration})
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Balance
              </p>
              <p className="text-2xl font-bold">
                {totalBalance.toLocaleString()} gp
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Individual Balance
              </p>
              <p className="text-2xl font-bold">
                {individualBalance.toLocaleString()} gp
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Loot per hour
              </p>
              <p className="text-2xl font-bold">
                {lootPerHour.toLocaleString()} gp/h
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex flex-row justify-between items-center mb-4 mr-2">
              <h3 className="text-lg font-semibold">Splitting instructions</h3>
              <CopyButton copyText={buildDiscordCopyText(sessionSummary)} />
            </div>
            <div className="space-y-4">
              {Object.keys(transactionsByPlayer).map((key, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="text-sm font-medium ">{key}</h4>
                  {transactionsByPlayer[key].map(
                    (
                      transaction: {
                        from: string;
                        to: string;
                        amount: number;
                      },
                      index: number
                    ) => (
                      <CopyableCommand
                        key={index}
                        command={`transfer ${transaction.amount} to ${transaction.to}`}
                      />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DistributionChart
              data={damageDistribution}
              title="Damage Distribution"
            />
            <DistributionChart
              data={healingDistribution}
              title="Healing Distribution"
            />
            <QuantityBarChart
              data={sessionSummary.players.map((player) => {
                return {
                  name: player.name,
                  qty: player.loot,
                } satisfies QuantityData;
              })}
              title="Loot Distribution"
            />
            <QuantityBarChart
              data={sessionSummary.players.map((player) => {
                return {
                  name: player.name,
                  qty: player.supplies,
                } satisfies QuantityData;
              })}
              title="Supplies Distribution"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {damageDistribution
              .map((player) => {
                return player.name;
              })
              .map((player, index) => (
                <div key={player} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index] }}
                  ></div>
                  <span className="text-sm">{player}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  );
}
