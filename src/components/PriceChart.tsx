import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PriceHistoryPoint } from '../types';

interface PriceChartProps {
  data?: PriceHistoryPoint[];
}

export default function PriceChart({ data }: PriceChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#6b7280' }} 
            tickMargin={10}
            minTickGap={20}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickFormatter={(value) => `$${value}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
            itemStyle={{ color: '#111827', fontSize: '14px' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#111827" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 6, fill: '#111827', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
