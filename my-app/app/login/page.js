'use client';

import { useState } from 'react';
import Link from "next/link";
import LoginDialog from '../components/LoginDialog';
import { useRouter } from 'next/navigation';
import { LockIcon, KeyIcon, ShieldIcon } from 'lucide-react';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('regular');
  const [isDialogOpen, setIsDialogOpen] = useState(false); // LoginDialog 열림 상태 관리
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    router.push('/homepage');
  };

  const handleCertificateLogin = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">은행</div>
          <div className="flex gap-4">
            <button className="text-sm text-gray-600 hover:text-blue-600">고객센터</button>
            <button className="text-sm text-gray-600 hover:text-blue-600">English</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-semibold text-center mb-6">로그인</div>
          
          {/* Tabs for Regular and Certificate Login */}
          <div className="flex space-x-2 justify-center mb-6">
            <button
              onClick={() => setActiveTab('regular')}
              className={`w-1/2 py-2 font-medium ${activeTab === 'regular' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            >
              일반 로그인
            </button>
            <button
              onClick={() => setActiveTab('certificate')}
              className={`w-1/2 py-2 font-medium ${activeTab === 'certificate' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            >
              인증서 로그인
            </button>
          </div>
          
          {/* Content for Regular Login */}
          {activeTab === 'regular' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="아이디"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
              />
              <Link
                href="/logincomplete"
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <LockIcon className="mr-2 h-4 w-4" /> 로그인
              </Link>
            </form>
          )}

          {/* Content for Certificate Login */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50 text-center space-y-4">
                <ShieldIcon className="mx-auto h-12 w-12 text-blue-600" />
                <p className="text-sm text-gray-600">공동인증서로 안전하게 로그인하세요</p>
              </div>
              <button 
                onClick={handleCertificateLogin} 
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <KeyIcon className="mr-2 h-4 w-4" /> 인증서 로그인
              </button>
            </div>
          )}

          {/* Links for ID/Password Find and Register */}
          <div className="mt-6 flex justify-center gap-4 text-sm text-gray-600">
            <button className="hover:underline">아이디 찾기</button>
            <div className="text-gray-300">|</div>
            <button className="hover:underline">비밀번호 찾기</button>
            <div className="text-gray-300">|</div>
            <button className="hover:underline">회원가입</button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="hidden md:block max-w-md">
          <div className="bg-blue-50 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-bold text-blue-800">보안 주의사항</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 mt-0.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</div>
                <p>비밀번호는 주기적으로 변경해 주세요.</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 mt-0.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</div>
                <p>로그인 정보는 타인에게 절대 노출하지 마세요.</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 mt-0.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</div>
                <p>공용 PC에서 사용 후 반드시 로그아웃해 주세요.</p>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* LoginDialog 모듈 */}
      <LoginDialog isOpen={isDialogOpen} onClose={closeDialog} onLogin={handleLogin} />
    </div>
  );
}
