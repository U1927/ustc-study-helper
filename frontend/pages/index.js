import dynamic from 'next/dynamic';
import LoginButton from '../components/LoginButton';
const Calendar = dynamic(() => import('../components/Calendar'), { ssr: false });
export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">USTC 学业助手（演示）</h1>
      <p className="mb-4">演示版。请先登录（/auth/login 后端会返回 token）并把 token 填入「开发者工具」或 API 请求头 'x-session'。</p>
      <LoginButton />
      <div className="mt-6">
        <Calendar />
      </div>
    </div>
  )
}
