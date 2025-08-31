import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useTheme } from "next-themes"
import {
  CheckSquare,
  Timer,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  User,
  X,
  LogOut,
  LogIn,
  FileText,
  Sun,
  Moon,
  Users,
  Users as TeamChatIcon,
  Mic
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTeamChat } from "@/contexts/TeamChatContext"
import { cn } from "@/lib/utils"

const items = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Team Chat", url: "/team-chat", icon: TeamChatIcon },
  { title: "Meetly", url: "/meetly", icon: Mic },
  { title: "Focus Timer", url: "/timer", icon: Timer },
  { title: "AI Assistant", url: "/chat", icon: MessageSquare },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Notes", url: "/notes", icon: FileText },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
]

import { useAuth } from "@/contexts/AuthContext"

const secondaryItems = (user: any) => [
  { title: "Profile", url: "/profile", icon: User, auth: true },
]

export function AppSidebar({ className }: { className?: string }) {
  const { state, toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()
  const { totalUnreadCount } = useTeamChat()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true
    if (path !== "/" && currentPath.startsWith(path)) return true
    return false
  }

  const getNavClasses = (path: string) => {
    const baseClasses = "transition-smooth hover-lift relative group rounded-lg font-medium"
    if (isActive(path)) {
      return cn(baseClasses, "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-elegant border border-primary/20")
    }
    return cn(baseClasses, "hover:bg-muted/60 hover:shadow-medium text-muted-foreground hover:text-foreground")
  }

  const { user, signOutUser } = useAuth()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Sidebar className={cn(
      "border-r border-border/50 bg-card/50 backdrop-blur-sm transition-smooth shadow-elegant",
      collapsed ? "w-16" : "w-72",
      className
    )}>
      <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-background to-muted/20">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="gradient-primary h-10 w-10 rounded-xl flex items-center justify-center shadow-glow animate-pulse-glow">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient tracking-tight">
                Taskly
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Premium Task Management
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center">
            <div className="gradient-primary h-8 w-8 rounded-lg flex items-center justify-center shadow-glow">
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover-scale h-8 w-8"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover-scale h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {item.url === "/team-chat" && totalUnreadCount > 0 && !collapsed && (
                        <Badge 
                          variant="destructive" 
                          className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
                Account
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {secondaryItems(user).map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <NavLink to={item.url} className={getNavClasses(item.url)}>
                                    <item.icon className="h-4 w-4" />
                                    {!collapsed && <span>{item.title}</span>}
                                </NavLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    <SidebarSeparator />
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={signOutUser}
                            className={cn(
                                "transition-smooth hover-scale",
                                "hover:bg-destructive/10 hover:text-destructive"
                            )}
                        >
                            <LogOut className="h-4 w-4" />
                            {!collapsed && <span>Sign Out</span>}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}