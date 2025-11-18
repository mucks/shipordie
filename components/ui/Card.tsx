import { HTMLAttributes } from 'react';

export const Card = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-[#2a2a2a] border-4 border-black neobrutal-shadow ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 border-b-4 border-black ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-2xl font-black uppercase tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);


