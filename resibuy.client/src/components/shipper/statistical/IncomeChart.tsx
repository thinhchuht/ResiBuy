import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

interface Props {
  data: { date: string; amount: number }[];
}

export default function IncomeChart({ data }: Props) {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Thu nhập",
        data: data.map((d) => d.amount),
        backgroundColor: "#1976d2", // Màu cột
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: ${context.raw.toLocaleString()} đ`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => value.toLocaleString(),
        },
      },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
}
