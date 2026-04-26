import React from 'react';
import { cn } from '../lib/utils';

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("animate-pulse bg-slate-200 rounded-lg", className)} />
  );
};

export const ArticleSkeleton = ({ variant = 'grid', className }: { variant?: 'grid' | 'list' | 'hero', className?: string }) => {
  if (variant === 'hero') {
    return (
      <div className={cn("w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden bg-slate-100 flex flex-col justify-end p-6 md:p-10 space-y-4", className)}>
        <Skeleton className="w-24 h-6 rounded-full" />
        <Skeleton className="w-3/4 h-10 rounded-lg" />
        <Skeleton className="w-1/2 h-4 rounded-lg" />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("flex gap-4 p-4 border-b border-slate-100", className)}>
        <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-3/4 h-4 rounded-lg" />
          <Skeleton className="w-1/2 h-3 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="w-full aspect-[16/9] rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="w-20 h-5 rounded-full" />
        <Skeleton className="w-full h-6 rounded-lg" />
        <Skeleton className="w-2/3 h-6 rounded-lg" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-24 h-3 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
