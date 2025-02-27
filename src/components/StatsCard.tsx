'use client';

type StatsCardProps = {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
};

export function StatsCard({ title, value, change, isPositive }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold my-2">{value}</p>
      
      {change && (
        <div className="flex items-center gap-1">
          {isPositive ? (
            <span className="text-green-500">↓</span>
          ) : (
            <span className="text-red-500">↑</span>
          )}
          <span className={isPositive ? "text-green-500" : "text-red-500"}>
            {change}
          </span>
        </div>
      )}
    </div>
  );
}