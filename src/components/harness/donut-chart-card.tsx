'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_TOOLTIP_STYLE } from '@/lib/constants';

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

interface DonutChartCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  data: DonutSlice[];
  emptyMessage?: string;
  headerBadge?: string;
  badgeColor?: string;
}

export function DonutChartCard({
  title,
  icon: Icon,
  iconColor,
  data,
  emptyMessage = 'No data yet',
  headerBadge,
  badgeColor = 'text-zinc-600',
}: DonutChartCardProps) {
  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${iconColor}`} />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-xs text-zinc-600">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${iconColor}`} />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {title}
            </CardTitle>
          </div>
          {headerBadge && (
            <span className={`text-[10px] font-mono ${badgeColor}`}>
              {headerBadge}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-[100px] w-[100px] shrink-0 sm:h-[140px] sm:w-[140px]" role="img" aria-label="Decision action distribution donut chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="46%"
                  strokeWidth={0}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="min-w-0 flex flex-col gap-1.5">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-400">{item.name}</span>
                <span className="ml-auto font-mono tabular-nums text-zinc-500">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}