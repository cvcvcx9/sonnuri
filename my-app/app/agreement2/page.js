'use client';

import { useState } from 'react';
import Link from "next/link";
import { ChevronRight } from 'lucide-react';

export default function AgreementStepTwo() {
  const [formData, setFormData] = useState({
    period: '6',
    amount: '1000000',
    accountType: '사용중',
    withdrawalAccountNumber: '431402-04-174943',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // 다음 단계로 이동하는 로직
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8"> {/* max-w-4xl로 조정 */}
        {/* 단계 진행 표시 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
              1
            </div>
            <span className="font-bold text-gray-500">약관동의</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              2
            </div>
            <span className="font-bold text-blue-600">가입정보 입력</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
              3
            </div>
            <span className="font-bold text-gray-500">확인</span>
          </div>
        </div>

        {/* 가입정보 입력 폼 */}
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6"> {/* max-w-4xl로 조정 */}
          {/* 가입기간 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">가입기간</label>
            <div className="grid grid-cols-4 gap-4">
              {['6개월', '12개월', '24개월', '36개월'].map((period, i) => (
                <button
                  key={period}
                  onClick={() => setFormData({ ...formData, period: String((i + 1) * 6) })}
                  className={`py-2 px-4 rounded ${
                    formData.period === String((i + 1) * 6) ? 'bg-blue-600 text-white' : 'border border-gray-300'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* 가입금액 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">가입금액</label>
            <div className="grid grid-cols-4 gap-4">
              {['1000000', '500000', '300000', '100000'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setFormData({ ...formData, amount })}
                  className={`py-2 px-4 rounded ${
                    formData.amount === amount ? 'bg-blue-600 text-white' : 'border border-gray-300'
                  }`}
                >
                  {parseInt(amount).toLocaleString()}원
                </button>
              ))}
            </div>
          </div>

          {/* KB금융그룹/포인트리 사용 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">KB금융그룹/포인트리 사용</label>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="unused"
                  name="accountType"
                  checked={formData.accountType === '미사용'}
                  onChange={() => setFormData({ ...formData, accountType: '미사용' })}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="unused" className="text-gray-700">미사용</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="using"
                  name="accountType"
                  checked={formData.accountType === '사용중'}
                  onChange={() => setFormData({ ...formData, accountType: '사용중' })}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="using" className="text-gray-700">사용중</label>
              </div>
            </div>
          </div>

          {/* 출금계좌번호 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">출금계좌번호</label>
            <select
              value={formData.withdrawalAccountNumber}
              onChange={(e) => setFormData({ ...formData, withdrawalAccountNumber: e.target.value })}
              className="w-full border border-gray-300 rounded px-4 py-2"
            >
              <option value="431402-04-174943">431402-04-174943</option>
            </select>
          </div>

          {/* 이전/다음 버튼 */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              className="w-32 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              onClick={() => window.history.back()}
            >
              이전
            </button>
            <Link
              href="/agreement3"
              className="w-32 py-2 px-4 bg-blue-600 text-center text-white rounded-md hover:bg-blue-700"
            >
              다음
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
