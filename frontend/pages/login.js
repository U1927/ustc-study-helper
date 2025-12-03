// pages/login.js
import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`;
  }, []);
  return <div>正在跳转至 USTC 登录…</div>;
}
