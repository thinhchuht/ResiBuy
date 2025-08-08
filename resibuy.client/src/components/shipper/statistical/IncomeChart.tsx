
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions, ChartData } from "chart.js"; 

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export interface IncomeChartData {
  date: string; 
  amount: number;
}

interface Props {
  data: IncomeChartData[];
}

export default function IncomeChart({ data }: Props) {
  const chartData: ChartData<"bar"> = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Thu nhập",
        data: data.map((d) => d.amount),
        backgroundColor: "#1976d2",
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${Number(context.raw).toLocaleString()} đ`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${Number(value).toLocaleString()}`,
        },
      },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
}
