'use client'; // 클라이언트 컴포넌트로 처리

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function AgreementPage() {
  const [agreements, setAgreements] = useState({
    all: false,
    basic: false,
    savings: false,
    special: false,
    product: false,
    confirm: false,
    rights: false,
  });

  const [showDetails, setShowDetails] = useState({
    basic: false,
    savings: false,
    special: false,
    product: false,
    confirm: false,
    rights: false,
  });

  const handleAllCheck = (checked) => {
    setAgreements((prev) => Object.keys(prev).reduce((acc, key) => ({
      ...acc,
      [key]: checked,
    }), {}));
  };

  const handleSingleCheck = (key, checked) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: checked,
      all: checked && Object.keys(prev).every((k) => k === 'all' || k === key ? checked : prev[k]),
    }));
  };

  const toggleDetails = (key) => {
    setShowDetails((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isAllChecked = Object.keys(agreements).every((key) => agreements[key]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 진행 단계 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">1</div>
            <span className="font-bold text-blue-600">약관동의</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">2</div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">3</div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg">
          <div className="p-6">
            {/* 전체 동의 */}
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg mb-6">
              <input
                type="checkbox"
                id="all"
                checked={isAllChecked}
                onChange={(e) => handleAllCheck(e.target.checked)}
                className="w-5 h-5"
              />
              <label
                htmlFor="all"
                className="text-lg font-bold leading-none"
              >
                전체 동의
              </label>
            </div>

            {/* 약관 아코디언 */}
            <div className="space-y-4">
              {[
                { id: 'basic', label: '[필수] 예금거래기본약관', content: '제1조(적용범위) 이 약관은 입출금이 자유로운 예금...' },
                { id: 'savings', label: '[필수] 적립식예금약관', content: '적립식예금약관 내용이 들어갑니다. 예를 들어, 예금 기간 및 금리가 포함될 수 있습니다. 예금의 이자율, 예치금액, 가입 조건 등에 대한 정보가 상세히 설명되어 있습니다.' },
                { id: 'special', label: '[필수] 특약', content: '특약 내용이 들어갑니다. 이 항목은 특정 조건이나 서비스가 포함된 경우에 대한 규정입니다. 예를 들어, 특정 상품에 가입할 때 제공되는 특약들에 대한 설명입니다.' },
                { id: 'product', label: '[필수] 상품설명서', content: '상품설명서 내용이 들어갑니다. 이 내용은 상품에 대한 기본적인 설명을 포함하며, 상품의 사용 방법, 조건, 제한사항 등을 상세히 설명합니다.' },
                { id: 'confirm', label: '확인 및 안내사항', content: '본인은 위 약관을 제공받고 그 내용을 이해하였음을 확인합니다. 또한, 상품에 대한 모든 조건을 숙지하였음을 확인합니다.' },
                { id: 'rights', label: '[필수] 금융소비자의 권리 안내', content: '청약철회권, 위법계약해지권 등 권리 안내 내용이 들어갑니다. 이 항목은 소비자가 가지는 권리와 그 절차에 대해 설명합니다.' },
              ].map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 p-4">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={agreements[item.id]}
                      onChange={(e) => handleSingleCheck(item.id, e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-blue-600">{item.label}</span>
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="ml-auto text-gray-500 hover:text-gray-700"
                    >
                      {showDetails[item.id] ? '설명 숨기기' : '설명 보기'}
                    </button>
                  </div>
                  {showDetails[item.id] && (
                    <div className="p-4 text-sm bg-white rounded-b-lg border-t border-gray-300">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 최종 동의 문구 */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm">
              <p className="text-gray-600">
                본인은 위 예금상품의 약관 및 상품설명서를 제공받고 예금상품의 중요한 사항을 충분히 이해하였음을 확인합니다.
              </p>
            </div>

            {/* 버튼 */}
            <div className="mt-6 flex justify-center gap-4">
              <button className="w-32 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                취소
              </button>
              <button
                className="w-32 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!isAllChecked}
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
