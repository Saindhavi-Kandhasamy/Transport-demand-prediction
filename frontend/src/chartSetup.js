import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
)

export const CHART_COLORS = {
  teal: '#2DD4BF',
  amber: '#FFB020',
  ink: '#0B1D3A',
  coral: '#FF6B6B',
  slate: '#8993A8',
}
