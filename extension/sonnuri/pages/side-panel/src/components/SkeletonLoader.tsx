import React from 'react'
import { Skeleton } from '../../../../packages/ui/lib/components/ui';

const SkeletonLoader:React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <Skeleton className="h-48 w-full rounded-md" />
            <p className="mt-2 text-center">영상 생성 중...</p>
        </div>
    );
}

export default SkeletonLoader