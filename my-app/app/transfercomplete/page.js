"use client";

import Link from "next/link";


export default function TransferCompletionPage() {
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white  rounded-lg p-8 max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">이체가 완료되었습니다</h2>
        <p className="text-gray-600 mb-6">
          
        </p>
        <Link
          href="/"
          className="w-32 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center inline-block"
        >
          확인
        </Link>
      </div>
    </div>
  );
}
