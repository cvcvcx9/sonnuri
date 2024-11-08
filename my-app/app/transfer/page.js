"use client";

import { useState } from "react";
import Link from "next/link";


export default function TransferPage() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  

  const handleTransfer = (e) => {
    e.preventDefault();
    
  };

  // 버튼 컴포넌트
  const Button = ({ children, onClick, variant, className }) => (
    <button
      onClick={onClick}
      className={`py-2 px-4 rounded-md ${
        variant === "outline"
          ? "border border-gray-400"
          : "bg-blue-600 text-white"
      } ${className}`}
    >
      {children}
    </button>
  );

  // 입력 컴포넌트
  const Input = ({ value, onChange, placeholder }) => (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="py-2 px-4 border border-gray-300 rounded-md w-full"
    />
  );

  // 레이블 컴포넌트
  const Label = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700">
      {children}
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">계좌이체</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* 출금 정보 카드 */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">출금정보</h2>
            </div>
            <div className="px-4 py-6 space-y-4">
              <div className="space-y-2">
                <Label>출금계좌</Label>
                <select className="py-2 px-4 border border-gray-300 rounded-md w-full">
                  <option>입출금통장 ••••1234 (잔액: 1,000,000원)</option>
                  <option>저축예금 ••••5678 (잔액: 5,000,000원)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>이체금액</Label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="이체금액을 입력하세요"
                />
                <div className="text-sm text-gray-500">
                  수수료: 0원 (당행 이체 시 면제)
                </div>
              </div>
            </div>
          </div>

          {/* 입금 정보 카드 */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">입금정보</h2>
            </div>
            <div className="px-4 py-6 space-y-4">
              <div className="space-y-2">
                <Label>입금은행</Label>
                <select className="py-2 px-4 border border-gray-300 rounded-md w-full">
                  <option>국민은행</option>
                  <option>신한은행</option>
                  <option>우리은행</option>
                  <option>하나은행</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>입금계좌번호</Label>
                <div className="flex gap-2">
                  <Input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="계좌번호를 입력하세요"
                  />
                  <Button variant="outline" className="px-3 py-2">
                    🔍
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>받는분 통장표시</Label>
                <Input placeholder="받는분 통장에 표시될 내용을 입력하세요" />
                <div className="text-sm text-gray-500">
                  최대 8글자까지 입력 가능합니다.
                </div>
              </div>
            </div>
          </div>

        
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="w-32">
              취소
            </Button>
           
            <Link
              href="/transfercomplete"
              className="w-32 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center inline-block"
            >
              이체하기
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
