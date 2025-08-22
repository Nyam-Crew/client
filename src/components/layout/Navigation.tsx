import {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Bell, BookOpen, Home, User, UserPlus, Users} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {activateStompClient, subscribeNotification} from "@/lib/websocket.ts";

const Navigation = () => {
  const location = useLocation();
  const [hasNotification, setHasNotification] = useState(true);

  const navItems = [
    {icon: Home, label: '홈', path: '/'},
    {icon: BookOpen, label: '기록', path: '/meal'},
    {icon: Users, label: '커뮤니티', path: '/community'},
    {icon: UserPlus, label: '그룹', path: '/api/teams'},
    {icon: User, label: '마이페이지', path: '/profile'},
  ];

  // Navigation 렌더링 시에 Websocket 연결 요청
  useEffect(() => {
    const activateAndSubscribe = async () => {
      await activateStompClient();

      await subscribeNotification();
    }

    activateAndSubscribe();
  }, []);

  return (
      <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl text-foreground">매일같이</span>
            </Link>

            {/* 네비게이션 메뉴 (데스크톱) */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === '/api/teams' ? location.pathname.startsWith('/api/teams') : location.pathname === item.path;

                return (
                    <Link key={item.path} to={item.path}>
                      <Button
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          className="gap-2"
                      >
                        <Icon size={16}/>
                        <span className="hidden lg:inline">{item.label}</span>
                      </Button>
                    </Link>
                );
              })}
            </div>

            {/* 알림 버튼 */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell size={20}/>
              {hasNotification && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"/>
              )}
            </Button>
          </div>

          {/* 모바일 네비게이션 */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
            <div className="grid grid-cols-5 gap-1 p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === '/api/teams' ? location.pathname.startsWith('/api/teams') : location.pathname === item.path;

                return (
                    <Link key={item.path} to={item.path}>
                      <Button
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          className="w-full flex-col gap-1 h-auto py-2"
                      >
                        <Icon size={16}/>
                        <span className="text-xs">{item.label}</span>
                      </Button>
                    </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
  );
};

export default Navigation;