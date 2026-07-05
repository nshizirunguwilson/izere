import { useMemo } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import type { MonthlyAggregate } from '../lib/types';
import { formatMonth, useLang } from '../i18n';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, ChartDataLabels);
ChartJS.defaults.font.family =
  "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;

const compactRwf = (n: number) =>
  n >= 995_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${Math.round(n / 1_000)}k`
      : `${Math.round(n)}`;

export default function CashflowChart({
  months,
  stressPct,
}: {
  months: MonthlyAggregate[];
  stressPct: number;
}) {
  const { t } = useLang();

  const factor = 1 - stressPct / 100;
  const multiYear = new Set(months.map((m) => m.month.slice(0, 4))).size > 1;

  const { labels, inflows, expenses, nets } = useMemo(() => {
    return {
      labels: months.map((m) => {
        const short = formatMonth(m.month, t).split(' ')[0].slice(0, 3);
        return multiYear ? `${short} ${m.month.slice(2, 4)}` : short;
      }),
      inflows: months.map((m) => m.revenue * factor),
      expenses: months.map((m) => m.expenses),
      nets: months.map((m) => m.revenue * factor - m.expenses),
    };
  }, [months, factor, multiYear, t]);

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      layout: { padding: { top: 20 } },
      scales: {
        x: {
          grid: { display: false },
          border: { color: '#e2e8f0' },
          ticks: { color: '#64748b', font: { size: months.length > 9 ? 10 : 12 } },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: '#f1f5f9' },
          ticks: {
            color: '#94a3b8',
            font: { size: 10 },
            maxTicksLimit: 5,
            callback: (value) => compactRwf(Number(value)),
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#ffffff',
          titleColor: '#0f172a',
          bodyColor: '#475569',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          callbacks: {
            title: (items) => formatMonth(months[items[0].dataIndex].month, t),
            label: (item) => {
              const i = item.dataIndex;
              return [
                `${t.results.table.inflow}: ${fmt(inflows[i])}`,
                `${t.results.table.expenses}: ${fmt(expenses[i])}`,
                `${t.results.table.net}: ${fmt(nets[i])}`,
                `${t.results.table.sellingDays}: ${months[i].sellingDays}`,
              ];
            },
          },
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: 0,
          color: '#94a3b8',
          font: { size: 10 },
          formatter: (value: number) => compactRwf(value),
        },
      },
    }),
    [months, inflows, expenses, nets, t],
  );

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: inflows,
          backgroundColor: 'rgba(5, 150, 105, 0.85)',
          hoverBackgroundColor: 'rgba(4, 120, 87, 1)',
          borderRadius: 4,
          borderSkipped: 'bottom' as const,
          maxBarThickness: 56,
          categoryPercentage: 0.8,
          barPercentage: 0.9,
        },
      ],
    }),
    [labels, inflows],
  );

  return (
    <div className="h-56">
      <Bar options={options} data={data} />
    </div>
  );
}
