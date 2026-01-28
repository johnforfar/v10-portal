"use client"

import React from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { 
  Search, 
  Cpu, 
  Box, 
  Terminal, 
  Database, 
  AppWindow, 
  LayoutDashboard, 
  FileText, 
  UserCircle,
  Wand2,
  GraduationCap,
  Layout,
  Globe,
  Coins,
  Ticket,
  DollarSign,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const MENU_GROUPS = [
  {
    label: "MARKETPLACE",
    items: [
      { name: "Discover", href: "/discover", icon: <Search className="size-4" /> },
    ],
  },
  {
    label: "BUILD",
    items: [
      { name: "AI Models", href: "/models", icon: <Cpu className="size-4" /> },
      { name: "tGPUs", href: "/tgpu", icon: <Box className="size-4" /> },
      { name: "Agents", href: "/agents", icon: <Terminal className="size-4" /> },
      { name: "Compute", href: "/compute", icon: <LayoutDashboard className="size-4" /> },
      { name: "Data", href: "/data", icon: <Database className="size-4" /> },
      { name: "Apps", href: "/apps", icon: <AppWindow className="size-4" /> },
      { name: "Network", href: "/network", icon: <Globe className="size-4" /> },
      { name: "Compare", href: "/compare", icon: <Layout className="size-4" /> },
      { name: "App Builder", href: "/builder", icon: <Wand2 className="size-4" /> },
    ],
  },
  {
    label: "LEARN",
    items: [
      { name: "Documentation", href: "/docs", icon: <FileText className="size-4" /> },
      { name: "Courses", href: "/community/courses", icon: <GraduationCap className="size-4" /> },
      { name: "Build & Grow", href: "/build-grow", icon: <Wand2 className="size-4" /> },
      { name: "Contributors", href: "/contributors", icon: <UserCircle className="size-4" /> },
      { name: "Forums", href: "/forums", icon: <Terminal className="size-4" /> },
      { name: "Activity", href: "/activity", icon: <Globe className="size-4" /> },
      { name: "Profile", href: "http://localhost:3002/community/profile", icon: <UserCircle className="size-4" />, external: true },
    ],
  },
  {
    label: "DASHBOARD",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: <Layout className="size-4" /> },
      { name: "Ecosystem", href: "/ecosystem", icon: <Globe className="size-4" /> },
      { name: "Token", href: "/token", icon: <Coins className="size-4" /> },
      { name: "Claims", href: "/claims", icon: <Ticket className="size-4" /> },
      { name: "Earn", href: "/earn", icon: <DollarSign className="size-4" /> },
      { name: "Roadmap", href: "/roadmap", icon: <FileText className="size-4" /> },
    ],
  },
]

export function V10Sidebar() {
  const pathname = usePathname()
  const [collapsedGroups, setCollapsedGroups] = React.useState<string[]>([])

  // Default to /models if at root
  const effectivePathname = pathname === "/" ? "/models" : pathname

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label) 
        : [...prev, label]
    )
  }

  return (
    <div className="fixed left-0 top-0 hidden h-full w-[234px] flex-col p-4 [background:radial-gradient(at_center,_#4C4C4C_0%,_#1C1C1C_100%)_0_0/100vw_100vh] lg:flex z-50">
      {/* V10 Portal Indicator Strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
      
      {/* Logo Section matched to Dashboard */}
      <div className="mb-6 mt-4 flex px-2 items-center gap-3">
        <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white italic shadow-lg shadow-blue-500/20">V</div>
        <div className="text-xl font-bold tracking-tighter text-white">
          V10 <span className="text-blue-400">PORTAL</span>
        </div>
      </div>

      {/* Wallet Connect Card matched to Dashboard */}
      <div className="relative mb-8 w-full rounded-lg bg-[#1F2021] p-4 border border-white/5">
        <div className="flex items-end justify-between">
          <span className="text-[40px] font-light leading-none text-white">0</span>
          <span className="text-[12px] font-bold text-white/50 tracking-wider">OPENX</span>
        </div>
        <button className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-900/20">
          Connect Wallet
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
        {MENU_GROUPS.map((group) => {
          const isCollapsed = collapsedGroups.includes(group.label)
          return (
            <div key={group.label} className="space-y-2">
              <button 
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-2 py-1 group/header"
              >
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                  {group.label}
                </h3>
                <span className="text-white/20 group-hover/header:text-white/60 transition-colors">
                  {isCollapsed ? <ChevronRight className="size-3" /> : <ChevronDown className="size-3" />}
                </span>
              </button>
              
              {!isCollapsed && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  {group.items.map((item) => {
                    const isActive = effectivePathname === item.href
                    const isExternal = item.href.startsWith('http')
                    
                    return (
                      <NextLink
                        key={item.name}
                        href={item.href}
                        target={isExternal ? "_blank" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                          isActive 
                            ? "bg-[#2563eb] text-white shadow-lg shadow-blue-900/30" 
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span className={cn(
                          "transition-colors",
                          isActive ? "text-white" : "text-white/40 group-hover:text-white/80"
                        )}>
                          {item.icon}
                        </span>
                        <span className="text-white font-medium">{item.name}</span>
                      </NextLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer Branding */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-center gap-1 opacity-40">
        <div className="size-1.5 rounded-full bg-blue-500 animate-pulse mr-1" />
        <span className="text-[10px] font-bold text-white tracking-tight uppercase">
          Studio v10 by <a href="https://openxai.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 underline-offset-2 transition-colors">OpenxAI</a>
        </span>
      </div>
    </div>
  )
}
