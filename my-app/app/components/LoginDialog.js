'use client';

import { useState } from 'react';
import { Monitor, Cloud, HardDrive, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginDialog({ isOpen, onClose, onLogin }) {
  const [selectedCert, setSelectedCert] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('로컬디스크');
  const router = useRouter();

  // handleLogin 함수
  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login button clicked"); 
    if (selectedCert && password) {
      sessionStorage.setItem('username', '신희진'); 
      onClose(); 
      setPassword('');
      router.push('/'); // 페이지 이동
    }
  };

  // 모달이 닫혀 있을 때 null 반환
  if (!isOpen) return null;

  // 인증서 탭 정보 배열
  const certificateTypes = [
    { id: '브라우저', icon: Monitor },
    { id: '클라우드', icon: Cloud },
    { id: '로컬디스크', icon: HardDrive },
    { id: '확장매체', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white max-w-4xl w-full rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-xl font-semibold border-b pb-4">전자 서명 작성</div>

        {/* 탭 버튼 */}
        <div className="flex gap-2 border-b">
          {certificateTypes.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-2 text-center font-medium ${
                activeTab === id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <Icon className="inline-block mr-1 h-5 w-5" />
              {id}
            </button>
          ))}
        </div>

        {/* 인증서 선택 테이블 */}
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-3 text-left">구분</th>
                <th className="p-3 text-left">사용자</th>
                <th className="p-3 text-left">만료일</th>
                <th className="p-3 text-left">발급자</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedCert}
                    onChange={() => setSelectedCert((prev) => !prev)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="p-3">신희진</td>
                <td className="p-3">2024-12-31</td>
                <td className="p-3">금융인증서</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 인증서 암호 입력 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            인증서 암호를 입력해 주세요
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            안전한 금융거래를 위해 6개월마다 인증서 암호를 변경하시기 바랍니다.
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <button
              type="submit"
              className={`w-24 py-2 px-4 rounded-lg text-center text-white ${
                selectedCert && password ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!selectedCert || !password}
            >
              확인
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-24 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
