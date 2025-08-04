import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Login = () => {
  const handleGoogleLogin = () => {
    console.log("Google login clicked");
  };

  const handleKakaoLogin = () => {
    console.log("Kakao login clicked");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#ffffe1' }}>
      <Card className="w-full max-w-md shadow-lg border-0" style={{ backgroundColor: '#fef1c1' }}>
        <CardContent className="p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/c47017e5-3777-452b-9342-fdb998d3028f.png"
              alt="매일같이 로고"
              className="w-32 h-32 object-contain"
            />
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-4">
            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-12 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Google로 로그인</span>
              </div>
            </Button>

            {/* Kakao Login Button */}
            <Button
              onClick={handleKakaoLogin}
              className="w-full h-12 font-medium"
              style={{ backgroundColor: '#FEE500', color: '#000000' }}
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C7.03 3 3 6.58 3 11c0 2.84 1.84 5.34 4.64 6.74-.21-.8-.39-2.04-.08-2.93l2.28-9.65s-.58-.07-.58-1.5c0-1.41.82-2.46 1.84-2.46.87 0 1.29.65 1.29 1.43 0 .87-.55 2.17-.84 3.37-.24 1.01.51 1.84 1.51 1.84 1.81 0 3.21-1.91 3.21-4.66 0-2.44-1.75-4.15-4.26-4.15-2.9 0-4.6 2.17-4.6 4.42 0 .87.34 1.81.76 2.32.08.1.09.19.07.29-.08.31-.24 1-.28 1.14-.05.2-.17.24-.4.15-1.37-.64-2.23-2.63-2.23-4.23 0-3.45 2.5-6.62 7.22-6.62 3.79 0 6.73 2.7 6.73 6.31 0 3.77-2.38 6.8-5.68 6.8-1.11 0-2.15-.58-2.51-1.35 0 0-.55 2.09-.68 2.61-.25.94-.92 2.12-1.37 2.84.13.04.27.07.41.1C17.72 20.78 21 16.38 21 11c0-4.42-4.03-8-9-8z"/>
                </svg>
                <span>카카오로 로그인</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;