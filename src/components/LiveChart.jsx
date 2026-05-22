// LiveChart — Real-time area chart using Recharts
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-static px-3 py-2 text-xs">
        <p className="text-gray-400 font-mono mb-1">{label}</p>
        <p className="font-bold font-mono" style={{ color: payload[0].color }}>
          {payload[0].value?.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
}

export default function LiveChart({ title, data, dataKey = 'value', color, unit, domain }) {
  return (
    <div className="glass-card-static p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300 tracking-wide">{title}</h3>
        {data.length > 0 && (
          <span className="text-xs font-mono" style={{ color }}>
            {data[data.length - 1]?.value?.toFixed(1)} {unit}
          </span>
        )}
      </div>

      <div className="h-44 sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(34, 211, 238, 0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: '#64748b' }}
              axisLine={{ stroke: 'rgba(34, 211, 238, 0.1)' }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              domain={domain || ['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${title})`}
              dot={false}
              animationDuration={300}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
