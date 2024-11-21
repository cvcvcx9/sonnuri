import { Skeleton } from '@extension/ui'

const ErrorPlayer = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <Skeleton className="h-48 w-full rounded-md flex flex-col items-center justify-center">
                <div className="flex justify-center mt-4">
                    <h3 className="text-red-500 text-lg font-bold">비디오 생성에 실패했습니다.</h3>
                </div>

            </Skeleton>
        </div>
    )
}

export default ErrorPlayer