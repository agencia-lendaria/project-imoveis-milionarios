import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'gold' | 'green' | 'amber' | 'red' | 'primary';
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'gold',
  isLoading = false
}) => {
  const colorClasses = {
    gold: 'bg-duomo-accent/10 text-duomo-accent',
    green: 'bg-green-500/10 text-green-500',
    amber: 'bg-amber-500/10 text-amber-500',
    red: 'bg-red-500/10 text-red-500',
    primary: 'bg-duomo-primary/10 text-duomo-primary'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 transition-all duration-300 hover:shadow-md">
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              {icon}
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          
          <div className="mb-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          
          {trend && (
            <div className="flex items-center mt-4">
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs. anterior</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MetricCard;