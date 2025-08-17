import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartCardProps {
  title: string;
  data: Array<{ day: string; count: number }>;
  className?: string;
}

export const ChartCard = ({ title, data, className }: ChartCardProps) => {
  // Format data for display
  const chartData = data.map(item => ({
    day: new Date(item.day).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    count: item.count,
    fullDate: item.day
  }));

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis 
              dataKey="day" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              labelFormatter={(value, payload) => {
                if (payload?.[0]?.payload?.fullDate) {
                  return new Date(payload[0].payload.fullDate).toLocaleDateString();
                }
                return value;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};