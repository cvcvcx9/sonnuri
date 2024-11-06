"use client";

import { useState } from "react";
import {
  HeartIcon,
  PrinterIcon,
  ShareIcon,
  ChevronRightIcon,
} from "lucide-react";
import Link from "next/link";

export default function SavingsDetailPage() {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center py-2 text-sm">
            <span>금융상품</span>
            <ChevronRightIcon className="h-4 w-4 mx-1" />
            <span>예금/적금</span>
            <ChevronRightIcon className="h-4 w-4 mx-1" />
            <span>급여하나 월복리 적금</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 상품 기본 정보 */}
        <div className="bg-white shadow-lg rounded-lg mb-8">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded">
                    인터넷
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded">
                    모바일
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded">
                    영업점
                  </span>
                </div>
                <h1 className="text-2xl font-bold">급여하나 월복리 적금</h1>
                <p className="text-gray-600">
                  현재는 가입 기간을 선택하여 월 납입 한도 내 신규한 원금이
                  자유롭고, 가계 실적에 따라 우대금리를 제공하는 적금
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="border border-gray-300 p-2 rounded-full"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <HeartIcon
                    className={`h-4 w-4 ${
                      isLiked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </button>
                <button className="border border-gray-300 p-2 rounded-full">
                  <PrinterIcon className="h-4 w-4" />
                </button>
                <button className="border border-gray-300 p-2 rounded-full">
                  <ShareIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-sm text-gray-500">기본금리</div>
                  <div className="text-2xl font-bold text-blue-600">3.00%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">최고금리</div>
                  <div className="text-2xl font-bold text-blue-600">4.30%</div>
                </div>
              </div>
              <div className="space-x-4">
                <button className="border border-gray-300 p-2 rounded">
                  전화상담예약
                </button>
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  가입하기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 상세 정보 */}
        <div className="space-y-4">
          <div className="bg-white shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">상품특징</h3>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="font-medium text-left p-2 bg-gray-50">
                      항목
                    </th>
                    <th className="font-medium text-left p-2 bg-gray-50">
                      내용
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 bg-gray-50">가입대상</td>
                    <td className="p-2">실명의 개인 또는 개인사업자</td>
                  </tr>
                  <tr>
                    <td className="p-2 bg-gray-50">가입기간</td>
                    <td className="p-2">12개월</td>
                  </tr>
                  <tr>
                    <td className="p-2 bg-gray-50">가입금액</td>
                    <td className="p-2">월 1만원 이상 300만원 이하</td>
                  </tr>
                  <tr>
                    <td className="p-2 bg-gray-50">금리우대조건</td>
                    <td className="p-2">
                      <ul className="list-disc list-inside space-y-2">
                        <li>신한카드 이용실적 월 30만원 이상 시 연 0.3%p</li>
                        <li>급여이체 실적 있는 경우 연 0.5%p</li>
                        <li>주거래 고객인 경우 연 0.5%p</li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">유의사항</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  • 이 금융상품을 가입하시기 전에 상품설명서 및 약관을
                  읽어보시기 바랍니다.
                </p>
                <p>
                  • 금리는 신규일 당시 고시금리를 적용하며, 변동될 수 있습니다.
                </p>
                <p>
                  • 만기 전 해지 시 약정금리보다 낮은 중도해지금리가 적용됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-5xl mx-auto flex justify-end gap-4">
          <button className="w-32 border border-gray-300 p-2 rounded">
            전화상담예약
          </button>
          {/* <button className="w-32 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">가입하기</button> */}
          <div className="w-32 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 text-center block">
            <Link href="/agreement">가입하기</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
