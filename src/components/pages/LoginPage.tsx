import { LoginForm } from "@/components/login-form";
import { MessageCircle, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* 로고와 서브텍스트 */}
        <div className="flex flex-col items-center gap-2">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <MessageCircle className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">DevChat</span>
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            개발자를 위한 AI 협업 플랫폼
          </p>
        </div>

        <LoginForm />

        {/* 특징 설명 */}
        <div className="flex flex-col gap-3 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>팀원들과 실시간 채팅</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4" />
            <span>AI와 함께 문제 해결</span>
          </div>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}