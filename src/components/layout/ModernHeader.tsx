import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Plus, 
  Bell, 
  Settings, 
  LogOut, 
  User,
  Home,
  CheckSquare,
  MessageSquare,
  Calendar,
  BarChart3,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ModernHeader() {
  const { user, userProfile } = useAuth();
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications] = useState(3); // Mock notifications count

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/signin');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/tasks') return 'Tasks';
    if (path === '/team-chat') return 'Team Chat';
    if (path === '/calendar') return 'Calendar';
    if (path === '/analytics') return 'Analytics';
    if (path === '/timer') return 'Timer';
    return 'Dashboard';
  };

  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: MessageSquare, label: 'Team Chat', path: '/team-chat' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Timer, label: 'Timer', path: '/timer' },
  ];

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 border-b border-border/40 sticky top-0 z-50 pt-safe">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Menu & Title */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="touch-target"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
            {!isMobile && (
              <div>
                <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
              </div>
            )}
          </div>
        </div>

        {/* Center - Navigation (Desktop only) */}
        {!isMobile && (
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "gap-2 transition-smooth",
                    isActive && "bg-primary/10 text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        )}

        {/* Right side - Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Add Button */}
          <Button
            size="sm"
            onClick={() => navigate('/tasks?new=true')}
            className="hidden sm:inline-flex gradient-primary text-white hover:shadow-glow transition-smooth"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>

          {isMobile && (
            <Button
              size="icon"
              onClick={() => navigate('/tasks?new=true')}
              className="gradient-primary text-white hover:shadow-glow transition-smooth touch-target"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative touch-target"
          >
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-destructive text-destructive-foreground">
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.photoURL || ""} alt={userProfile?.displayName || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {userProfile?.displayName && (
                    <p className="font-medium">{userProfile.displayName}</p>
                  )}
                  {user?.email && (
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}