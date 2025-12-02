import React from 'react';
export default function LoginButton(){
  return (
    <a className="px-4 py-2 bg-blue-600 text-white rounded" href="/api/proxy-login">
      使用 CAS 登录（演示）
    </a>
  );
}
