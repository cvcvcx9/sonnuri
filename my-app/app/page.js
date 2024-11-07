"use client";

import Link from "next/link";
import {
  WalletIcon,
  ArrowRightLeftIcon,
  CreditCardIcon,
  PiggyBankIcon,
  BarChart3Icon,
  GlobeIcon,
  BellIcon,
  UserIcon,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-blue-600">은행</div>
            <div className="flex items-center gap-4">
              <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                <BellIcon className="h-4 w-4 mr-2" />
                알림
              </button>
              <Link
                href="/login"
                className="flex items-center text-sm text-gray-600 hover:text-blue-600"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                로그인
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">자산현황</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">입출금통장</div>
              <div className="text-xl font-bold mt-1">1,234,567원</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">예금/적금</div>
              <div className="text-xl font-bold mt-1">5,678,901원</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">투자상품</div>
              <div className="text-xl font-bold mt-1">9,012,345원</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/transfer"
            className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowRightLeftIcon className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-sm font-medium">이체</span>
          </Link>
          <button className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
            <WalletIcon className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-sm font-medium">계좌조회</span>
          </button>
          <button className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
            <CreditCardIcon className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-sm font-medium">카드</span>
          </button>
          <button className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
            <PiggyBankIcon className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-sm font-medium">예금/적금</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">자주 쓰는 메뉴</h2>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                <BarChart3Icon className="h-4 w-4 mr-2" />
                거래내역
              </button>
              <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                <GlobeIcon className="h-4 w-4 mr-2" />
                환율조회
              </button>
              <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                카드실적
              </button>
              <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                <PiggyBankIcon className="h-4 w-4 mr-2" />
                자동이체
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">추천상품</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-bold">
                  <Link href="/detail">급여하나 월복리 적금</Link>
                </div>
                <div className="text-sm text-gray-600 mt-1">연 최대 4.5%</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-bold">직장인을 위한 신용대출</div>
                <div className="text-sm text-gray-600 mt-1">
                  최저 금리 4.85%
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
