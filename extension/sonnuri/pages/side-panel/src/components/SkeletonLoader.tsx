import React from 'react'
import { Skeleton } from '../../../../packages/ui/lib/components/ui';

const SkeletonLoader:React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <Skeleton className="h-48 w-full rounded-md" />
        </div>
    );
}

export default SkeletonLoader