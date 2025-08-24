import {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Bell, BookOpen, Home, User, UserPlus, Users, Trophy} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {activateStompClient, subscribeNotification} from "@/lib/websocket.ts";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {defaultFetch} from "@/api/defaultFetch.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@radix-ui/react-popover";
import {AlertContainer} from "@/components/layout/AlertContainer.tsx";

// 새 알림이 존재하는지 확인할 때 사용하는 Interface
// api/notify/status 의 응답으로 전달됩니다.
interface notifyStatus {
  hasNew : boolean,
}

const useHasNotification = (isLoggedIn : boolean, isAuthChecking : boolean) => {
  return useQuery({
    queryKey: ["hasNotification"],
    queryFn: async () => {
      const res = await defaultFetch<notifyStatus>("/api/notify/status");
      return res.hasNew;
    },
    enabled : isLoggedIn && !isAuthChecking,   // 로그인 한 상태이면서, 권한 체크 끝나야 실행
    refetchInterval: 30_000,         // 30초마다 갱신
    refetchOnWindowFocus: true,      // 탭 복귀 시 갱신
    refetchOnReconnect: true,        // 네트워크 복구 시 갱신
    staleTime: 10_000,
  });
}

const Navigation = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const qc = useQueryClient();
  const { data: hasNotification = false } = useHasNotification(isLoggedIn, isCheckingAuth);
  const [open, setOpen] = useState(false);

  const onBellClick = () => setOpen((v) => !v);

  const navItems = [
    {icon: Home, label: '홈', path: '/'},
    {icon: BookOpen, label: '기록', path: '/meal'},
    {icon: Trophy, label: '챌린지', path: '/challenge'},
    {icon: Users, label: '커뮤니티', path: '/community'},
    {icon: UserPlus, label: '그룹', path: '/teams'},
    {icon: User, label: '마이페이지', path: '/profile'},
  ];

  // Check user authentication status
  const checkAuthStatus = async () => {
    try {
      setIsCheckingAuth(true);
      await defaultFetch('/api/member/me');
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Check authentication status on component mount

  useEffect(() => {
    // Skip auth check if we're on the login page to avoid infinite redirect loop
    if (location.pathname === '/login') {
      setIsLoggedIn(false);
      setIsCheckingAuth(false);
      return;
    }

    checkAuthStatus();
  }, [location.pathname]);

  // Initialize websocket when user becomes logged in
  useEffect(() => {
    if (isLoggedIn && !isCheckingAuth) {
      const activateAndSubscribe = async () => {
        try {
          await activateStompClient();
          await subscribeNotification();
        } catch (error) {
          console.error('Failed to initialize websocket:', error);
        }
      };

      activateAndSubscribe();
    }
  }, [isLoggedIn, isCheckingAuth]);

  return (
      <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl text-foreground">매일같이</span>
            </Link>

            {/* 네비게이션 메뉴 (데스크톱) - 로그인된 사용자만 표시 */}
            {isLoggedIn && (
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === '/teams' ? location.pathname.startsWith('/teams') : location.pathname === item.path;

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
            )}

            {/* 알림 버튼 */}
            <Popover
                open={open}
                onOpenChange={(v) => {
                  setOpen(v);
                  if (!v) {
                    // 팝오버 닫힐 때 새 알림 여부 재검사
                    qc.invalidateQueries({ queryKey: ["hasNotification"] });
                  }
                }}
            >
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative" onClick={onBellClick} aria-label="알림">
                  <Bell size={20}/>
                  {hasNotification && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="p-0">
                <AlertContainer />
              </PopoverContent>
            </Popover>
          </div>

          {/* 모바일 네비게이션 - 로그인된 사용자만 표시 */}
          {isLoggedIn && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
              <div className="grid grid-cols-5 gap-1 p-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === '/teams' ? location.pathname.startsWith('/teams') : location.pathname === item.path;

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
          )}
        </div>
      </nav>
  );
};

export default Navigation;