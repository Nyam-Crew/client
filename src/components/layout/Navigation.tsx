import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  PlusCircle, 
  Trophy, 
  Users, 
  MessageCircle, 
  User,
  Calendar,
  Bell 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const location = useLocation();
  const [hasNotification, setHasNotification] = useState(true);

  const navItems = [
    { icon: Home, label: '홈', path: '/' },
    { icon: PlusCircle, label: '식단기록', path: '/meal' },
    { icon: Trophy, label: '챌린지', path: '/challenge' },
    { icon: Users, label: '커뮤니티', path: '/community' },
    { icon: MessageCircle, label: '채팅', path: '/chat' },
    { icon: Calendar, label: '캘린더', path: '/calendar' },
    { icon: User, label: '마이페이지', path: '/profile' },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">매</span>
            </div>
            <span className="font-bold text-xl text-foreground">매일같이</span>
          </Link>

          {/* 네비게이션 메뉴 (데스크톱) */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    size="sm"
                    className="gap-2"
                  >
                    <Icon size={16} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* 알림 버튼 */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell size={20} />
            {hasNotification && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
            )}
          </Button>
        </div>

        {/* 모바일 네비게이션 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <div className="grid grid-cols-4 gap-1 p-2">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    size="sm"
                    className="w-full flex-col gap-1 h-auto py-2"
                  >
                    <Icon size={16} />
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