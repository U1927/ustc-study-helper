// pages/auth-success.js
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AuthSuccess() {
  const router = useRouter();
  useEffect(() => {
    const { token } = router.query;
    if (token) {
      localStorage.setItem("session_token", token);
      router.replace("/");  // 重定向到首页或主页面
    }
  }, [router.query]);
  return <div>登录成功，正在跳转…</div>;
}
