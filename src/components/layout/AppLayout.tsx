import { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { PremiumHeader } from "./PremiumHeader"
import { TimerProvider, useTimer } from "@/contexts/TimerContext"
import { FloatingTimer } from "@/components/timer/FloatingTimer"
import { TimeTrackingWidget } from "@/components/timer/TimeTrackingWidget"
import { TeamChatProvider } from "@/contexts/TeamChatContext"
import { OfflineIndicator } from "@/components/common/OfflineIndicator"
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: ReactNode
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const { isTimerRunning } = useTimer()
  const { isChatOpenMobile } = useSidebar()
  const location = useLocation()
  const isMobile = useIsMobile()
  
  console.log('AppLayout - isChatOpenMobile:', isChatOpenMobile, 'isMobile:', isMobile)

  return (
    <div 
      className="h-screen flex flex-col w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/20"
      style={{ "--app-header-offset": "3.5rem" } as React.CSSProperties}
    >
      <PremiumHeader />
      <OfflineIndicator />
      
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar className={cn(
          "transition-all duration-300",
          isTimerRunning && "hidden md:flex",
          !isMobile && isChatOpenMobile && "hidden lg:flex"
        )} />
        
        <main className={cn(
          "flex-1 transition-smooth overflow-y-auto min-h-0 touch-pan-y relative min-w-0", // <-- THE FIX IS HERE
          "pt-0",
          isTimerRunning && "md:ml-0",
          isMobile && location.pathname === "/" && "scrollbar-hide"
        )}>
          {children}
        </main>
      </div>
      
      <FloatingTimer />
      <TimeTrackingWidget />
      <PerformanceMonitor />
    </div>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <TimerProvider>
      <TeamChatProvider>
        <SidebarProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </SidebarProvider>
      </TeamChatProvider>
    </TimerProvider>
  )
}