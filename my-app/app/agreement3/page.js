'use client';

import { useState } from 'react';
import Link from "next/link";
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AgreementStepThree() {
  const router = useRouter();
  const [formData] = useState({
    period: '6',
    amount: '1000000',
    withdrawalAccountNumber: '431402-04-174943',
  });

  const handleSubmit = () => {
    // 확인 버튼 클릭 시 동작하는 로직
  };

  const renderStep3 = () => (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-center mb-8">정보 확인</h2>

      {/* 정보 확인 영역 */}
      <div className="space-y-6 border-t border-b py-6">
        <div className="flex justify-between">
          <span className="text-gray-600">신규일자</span>
          <span>2024.11.08</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">가입기간</span>
          <span>{formData.period}개월</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">가입금액</span>
          <span>{parseInt(formData.amount).toLocaleString()}원</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">적용금리</span>
          <span>2.85%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">출금계좌</span>
          <span>{formData.withdrawalAccountNumber}</span>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-center gap-6 mt-8">
        <button
          className="w-32 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          onClick={() => router.back()}
        >
          이전
        </button>
        <Link
          href="/complete"
          className="w-32 py-2 px-4 bg-blue-600 text-center text-white rounded-lg hover:bg-blue-700"
        >
          확인
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 단계 표시 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
              1
            </div>
            <span className="font-bold text-gray-500">약관동의</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
              2
            </div>
            <span className="font-bold text-gray-500">가입정보 입력</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              3
            </div>
            <span className="font-bold text-blue-600 leading-6">확인</span> {/* 글씨 높이 조정 */}
          </div>
        </div>

        {/* 정보 확인 영역 */}
        {renderStep3()}
      </div>
    </div>
  );
}
