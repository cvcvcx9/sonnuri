"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

export default function AgreementPage() {
  const [agreements, setAgreements] = useState({
    all: false,
    basic: false,
    savings: false,
    special: false,
    product: false,
    rights: false,
  });

  const [expanded, setExpanded] = useState({
    basic: false,
    savings: false,
    special: false,
    product: false,
    rights: false,
  });

  const handleAllCheck = (checked) => {
    setAgreements((prev) =>
      Object.keys(prev).reduce(
        (acc, key) => ({
          ...acc,
          [key]: checked,
        }),
        {}
      )
    );
  };

  const handleSingleCheck = (key, checked) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: checked,
      all:
        checked &&
        Object.keys(prev).every((k) =>
          k === "all" || k === key ? checked : prev[k]
        ),
    }));
  };

  const toggleExpand = (key) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isAllChecked = Object.keys(agreements).every((key) => agreements[key]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              1
            </div>
            <span className="font-bold text-blue-600">약관동의</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
              2
            </div>
            <span className="font-bold text-gray-500">가입정보 입력</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
              3
            </div>
            <span className="font-bold text-gray-500">확인</span>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg mb-6">
              <input
                type="checkbox"
                id="all"
                checked={isAllChecked}
                onChange={(e) => handleAllCheck(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="all" className="text-lg font-bold leading-none">
                전체 동의
              </label>
            </div>

            <div className="space-y-4">
              {/* 예금거래기본약관 */}
              <div className="bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 p-4">
                  <input
                    type="checkbox"
                    id="basic"
                    checked={agreements.basic}
                    onChange={(e) =>
                      handleSingleCheck("basic", e.target.checked)
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-blue-600">[필수] 예금거래기본약관</span>
                  <button
                    onClick={() => toggleExpand("basic")}
                    className="ml-auto text-gray-500 hover:text-gray-700"
                  >
                    {expanded.basic ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {expanded.basic && (
                  <div className="p-4 text-sm bg-white rounded-b-lg border-t border-gray-300 space-y-4">
                    <h3 className="font-bold mb-2">제1조(적용범위)</h3>
                    <p>
                      이 약관은 입출금이 자유로운 예금, 거치식예금 및 적립식예금
                      거래에 적용한다.
                    </p>

                    <h3 className="font-bold mb-2">제2조(실명거래)</h3>
                    <p>
                      ① 거래처는 실명으로 거래하여야 한다.
                      <br />② 은행은 거래처의 실명확인을 위하여
                      주민등록증ㆍ사업자등록증 등 실명확인증표 또는 그 밖에
                      필요한 서류의 제시나 제출을 요구할 수 있고, 거래처는 이에
                      따라야 한다.
                    </p>

                    <h3 className="font-bold mb-2">제3조(거래장소)</h3>
                    <p>
                      거래처는 예금계좌를 개설한 영업점(이하 "개설점"이라
                      한다)에서 모든 예금거래를 한다. 다만, 은행이 정하는 바에
                      따라 다른 영업점이나 다른 금융기관, 또는 전산통신기기를
                      통하여 거래할 수 있다.
                    </p>

                    <h3 className="font-bold mb-2">제4조(거래방법)</h3>
                    <p>
                      거래처는 은행에서 내준 통장(증서· 전자통장을 포함한다)
                      또는 수표· 어음용지로 거래하여야 한다. 그러나 입금할 때,
                      자동이체약정ㆍ전산통신기기이용약정에 따라 거래하는 경우
                      통장 없이도 거래할 수 있다.
                    </p>
                  </div>
                )}
              </div>

              {/* 적립식예금약관 */}
              <div className="bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 p-4">
                  <input
                    type="checkbox"
                    id="savings"
                    checked={agreements.savings}
                    onChange={(e) =>
                      handleSingleCheck("savings", e.target.checked)
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-blue-600">[필수] 적립식예금약관</span>
                  <button
                    onClick={() => toggleExpand("savings")}
                    className="ml-auto text-gray-500 hover:text-gray-700"
                  >
                    {expanded.savings ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {expanded.savings && (
                  <div className="p-4 text-sm bg-white rounded-b-lg border-t border-gray-300 space-y-4">
                    <h3 className="font-bold mb-2">제1조(적용범위)</h3>
                    <p>
                      ① 적립식예금(이하 "이 예금"이라 한다)이란 기간을 정하고 그
                      기간 중에 미리 정한 금액이나 불특정금액을 입금하는 예금을
                      말한다.
                      <br />② 이 약관에 정하지 않은 사항은 예금거래기본약관의
                      규정을 적용한다.
                    </p>
                    <h3 className="font-bold mb-2">제2조(지급시기)</h3>
                    <p>
                      이 예금은 약정한 만기일 이후 거래처가 청구할 때 지급한다.
                      다만, 거래처가 부득이한 사정으로 청구할 때는 만기전이라도
                      지급할 수 있다.
                    </p>
                  </div>
                )}
              </div>

              {/* 특약 */}
              <div className="bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 p-4">
                  <input
                    type="checkbox"
                    id="special"
                    checked={agreements.special}
                    onChange={(e) =>
                      handleSingleCheck("special", e.target.checked)
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-blue-600">[필수] 특약</span>
                  <button
                    onClick={() => toggleExpand("special")}
                    className="ml-auto text-gray-500 hover:text-gray-700"
                  >
                    {expanded.special ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {expanded.special && (
                  <div className="p-4 text-sm bg-white rounded-b-lg border-t border-gray-300 space-y-4">
                    <h3 className="font-bold mb-2">제1조(적용범위)</h3>
                    <p>
                      이 특약은 고객과 은행 사이의 급여하나 월복리 적금 거래에
                      적용됩니다.
                    </p>
                    <h3 className="font-bold mb-2">제2조(예금종류)</h3>
                    <p>이 예금은 적립식예금으로 합니다.</p>
                  </div>
                )}
              </div>

              {/* 상품설명서 */}
              <div className="bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 p-4">
                  <input
                    type="checkbox"
                    id="product"
                    checked={agreements.product}
                    onChange={(e) =>
                      handleSingleCheck("product", e.target.checked)
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-blue-600">[필수] 상품설명서</span>
                  <button
                    onClick={() => toggleExpand("product")}
                    className="ml-auto text-gray-500 hover:text-gray-700"
                  >
                    {expanded.product ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {expanded.product && (
                  <div className="p-4 text-sm bg-white rounded-b-lg border-t border-gray-300 space-y-4">
                    <h3 className="font-bold mb-2">1. 상품 개요</h3>
                    <p>
                      • 상품명: 희망 저축 계좌 적금
                      <br />• 상품특징: 가입 기간을 선택하여 월 납입 한도 내
                      신규한 원금이 자유롭고, 가계 실적에 따라 우대금리를
                      제공하는 적금
                    </p>
                  </div>
                )}
              </div>

              {/* 금융소비자의 권리 안내 */}
              <div className="bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 p-4">
                  <input
                    type="checkbox"
                    id="rights"
                    checked={agreements.rights}
                    onChange={(e) =>
                      handleSingleCheck("rights", e.target.checked)
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-blue-600">
                    [필수] 금융소비자의 권리 안내
                  </span>
                  <button
                    onClick={() => toggleExpand("rights")}
                    className="ml-auto text-gray-500 hover:text-gray-700"
                  >
                    {expanded.rights ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {expanded.rights && (
                  <div className="p-4 text-sm bg-white rounded-b-lg border-t border-gray-300 space-y-4">
                    <h3 className="font-bold mb-2">1. 청약철회권</h3>
                    <p>
                      일반금융소비자는 청약철회가 가능한 금융상품에 대하여
                      청약을 철회할 수 있습니다.
                    </p>
                    <h3 className="font-bold mb-2">2. 상품 설명 및 정보 제공 요청권</h3>
                    <p>
                    금융소비자는 금융 상품에 대해 충분한 설명을 요구할 권리가 있습니다. 금융사는 상품의 특징, 위험 요소, 수수료, 세금 혜택 등 필수 정보를 소비자에게 정확하고 상세히 제공해야 합니다.
                    </p>
                    <h3 className="font-bold mb-2">3. 금융 상품 비교 및 선택 권리</h3>
                    <p>
                    금융소비자는 다양한 금융 상품의 조건을 비교하고 자신에게 맞는 상품을 선택할 권리가 있습니다. 금융사는 공정하게 상품을 설명하고, 특정 상품의 판매를 강요하지 않아야 합니다.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm">
              <p className="text-gray-600">
                본인은 위 예금상품의 약관 및 상품설명서를 제공받고 중요한 사항을
                충분히 이해하였음을 확인합니다.
              </p>
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button className="w-32 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                취소
              </button>
              <Link
                href="/agreement2"
                className={`w-32 py-2 px-4 rounded-md text-center ${
                  isAllChecked
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                }`}
              >
                다음
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
