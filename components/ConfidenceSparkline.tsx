interface ConfidenceSparklineProps {
  data?: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function ConfidenceSparkline({
  data = [45, 48, 52, 55, 58, 62, 65, 63, 67, 70],
  width = 120,
  height = 30,
  color = 'hsl(var(--accent))'
}: ConfidenceSparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg 
      width={width} 
      height={height} 
      className="opacity-80"
      data-testid="svg-confidence-sparkline"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="2"
            fill={color}
          />
        );
      })}
    </svg>
  );
}

