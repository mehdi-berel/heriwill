"use client"



import { useState, useEffect } from "react"

import Link from "next/link"

import Image from "next/image"

import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

import { supabase } from "@/lib/supabase"

import { Badge } from "@/components/ui/badge"

import { Tooltip } from "@/components/ui/tooltip"

import {

  Home,

  Users,

  FileText,

  Scale,

  LogOut,

  Lock,

  Power,

  Package,

  Sparkles,

  ArrowRight,

  LockKeyhole,

  Settings,

  Menu,

  X

} from "lucide-react"



const navigation = [

  {

    name: "Home",

    href: "/",

    icon: Home,

    description: "Overview",

  },

  {

    name: "Vaults",

    href: "/vaults",

    icon: Lock,

    description: "Secure storage",

  },

  {

    name: "Heirs",

    href: "/heirs",

    icon: Users,

    description: "Beneficiaries",

  },

  {

    name: "Sign-Off",

    href: "/sign-off",

    icon: Power,

    description: "Death detection",

  },

  {

    name: "Assets",

    href: "/assets",

    icon: Package,

    description: "Digital items",

    isPro: true,

  },

  {

    name: "Legal",

    href: "/Legal",

    icon: FileText,

    description: "Documents",

    isPro: true,

  },

  {

    name: "Notary",

    href: "/notary",

    icon: Scale,

    description: "Legal witnesses",

    isPro: true,

  },

]



interface SidebarProps {

  userName?: string

  onSignOut?: () => void

}



export function Sidebar({ onSignOut }: SidebarProps) {

  const pathname = usePathname()

  const [isHovered, setIsHovered] = useState(false)

  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const [isProUser, setIsProUser] = useState(false)



  useEffect(() => {

    const checkProStatus = async () => {

      try {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return



        const { data: profile } = await supabase

          .from('users')

          .select('subscription_tier')

          .eq('id', user.id)

          .single()



        interface ProfileData {

          subscription_tier?: string

        }

        setIsProUser((profile as ProfileData | null)?.subscription_tier === 'pro')

      } catch (error) {

        console.error('Error checking pro status:', error)

      }

    }



    checkProStatus()

  }, [])



  interface NavigationItem {

    name: string

    href: string

    icon: React.ComponentType<{ className?: string }>

    description: string

    isPro?: boolean

  }



  // Show all navigation items, but mark locked ones

  const navigationWithLockState = navigation.map(item => ({

    ...item,

    isLocked: (item as NavigationItem).isPro && !isProUser

  }))



  return (

    <>

      {/* Mobile Menu Toggle Button */}

      <button

        onClick={() => setIsMobileOpen(!isMobileOpen)}

        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-background-secondary/90 backdrop-blur-sm border border-border-default shadow-lg hover:bg-background-hover transition-all duration-200"

        aria-label="Toggle menu"

      >

        {isMobileOpen ? (

          <X className="h-5 w-5 text-text-primary" />

        ) : (

          <Menu className="h-5 w-5 text-text-primary" />

        )}

      </button>



      {/* Mobile Overlay */}

      {isMobileOpen && (

        <div

          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"

          onClick={() => setIsMobileOpen(false)}

        />

      )}



      {/* Sidebar */}

      <div 

        className={cn(

          "flex h-full flex-col bg-black/30 backdrop-blur-xl border-r transition-all duration-300 relative",

          "md:relative",

          // Desktop behavior

          "hidden md:flex",

          isHovered ? "md:w-64" : "md:w-20",

          // Mobile behavior

          isMobileOpen && "fixed inset-y-0 left-0 z-40 flex w-72 shadow-2xl"

        )}

        style={{ 

          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',

          borderColor: '#232629'

        }}

        onMouseEnter={() => setIsHovered(true)}

        onMouseLeave={() => setIsHovered(false)}

      >

      {/* Logo */}

      <div className="flex h-14 items-center px-4 border-b justify-between" style={{ borderColor: '#232629' }}>

        <div className={cn(

          "flex items-center gap-2.5 transition-all duration-300",

          !isHovered && !isMobileOpen && "md:justify-center md:w-full"

        )}>

          <div className="relative h-8 w-8 flex-shrink-0">

            <Image

              src="/heriwill-transparent.png"

              alt="Heriwill Logo"

              fill

              className="object-contain"

              priority

            />

          </div>

          {(isHovered || isMobileOpen) && (

            <div className="flex items-baseline gap-1 overflow-hidden">

              <span className="text-base font-bold text-text-primary tracking-tight">Heriwill</span>

            </div>

          )}

        </div>

      </div>



      {/* Navigation */}

      <nav className="flex-1 px-2 pb-3 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        <div className="space-y-1 py-2">

          {navigationWithLockState.map((item: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; isLocked?: boolean; isPro?: boolean }) => {

            const isActive = pathname === item.href

            const isLocked = item.isLocked

            

            const navItem = (

              <div

                className={cn(

                  "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-200",

                  isActive

                    ? "bg-primary-600/10 text-primary-400 shadow-sm"

                    : isLocked

                    ? "text-text-tertiary hover:bg-background-hover/50 cursor-not-allowed opacity-60"

                    : "text-text-muted hover:bg-background-hover hover:text-text-secondary cursor-pointer",

                  !isHovered && "justify-center"

                )}

              >

                {isActive && isHovered && !isLocked && (

                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-500 rounded-r-full" />

                )}

                <div className={cn(

                  "relative flex items-center justify-center transition-all duration-200 transform-gpu will-change-transform",

                  isActive ? "scale-110" : "group-hover:scale-105"

                )}>

                  <item.icon className={cn(

                    "h-4 w-4 transition-colors duration-200",

                    isActive ? "text-primary-400" : isLocked ? "text-text-tertiary" : "text-text-tertiary group-hover:text-text-muted"

                  )} />

                  {isLocked && (

                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-background-primary rounded-full flex items-center justify-center">

                      <LockKeyhole className="h-2 w-2 text-amber-500" />

                    </div>

                  )}

                </div>

                {isHovered && (

                  <>

                    <span className="flex-1 flex items-center gap-2 whitespace-nowrap">

                      {item.name}

                      {item.isPro && (

                        <Badge className="h-4 px-1.5 text-[9px] bg-primary-500 text-white border-0">

                          PRO

                        </Badge>

                      )}

                    </span>

                    {isActive && !isLocked && (

                      <div className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse" />

                    )}

                  </>

                )}

              </div>

            )



            const content = isLocked ? (

              <Tooltip

                content={

                  <div className="flex items-center gap-1.5">

                    <Sparkles className="h-3 w-3" />

                    <span>Upgrade to Pro to unlock</span>

                  </div>

                }

                side="right"

              >

                <Link href="/upgrade" className="block">

                  {navItem}

                </Link>

              </Tooltip>

            ) : !isHovered ? (

              <Tooltip content={item.name} side="right">

                <Link key={item.name} href={item.href} className="block">

                  {navItem}

                </Link>

              </Tooltip>

            ) : (

              <Link key={item.name} href={item.href} className="block">

                {navItem}

              </Link>

            )



            return <div key={item.name}>{content}</div>

          })}

        </div>



      </nav>



      {/* Upgrade CTA for non-pro users */}

      {!isProUser && (

        <div className="px-2 pb-2">

          <Link

            href="/upgrade"

            className={cn(

              "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-200 overflow-hidden",

              "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600",

              "text-white shadow-lg hover:shadow-xl",

              !isHovered && "justify-center"

            )}

          >

            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

            <div className="relative flex items-center justify-center group-hover:scale-110 transition-transform duration-200">

              <Sparkles className="h-4 w-4" />

            </div>

            {isHovered && (

              <>

                <span className="relative flex-1 font-semibold whitespace-nowrap">Upgrade to Pro</span>

                <ArrowRight className="relative h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />

              </>

            )}

          </Link>

        </div>

      )}



      {/* Divider before settings */}

      <div className="mx-2 mb-2 h-px bg-gradient-to-r from-transparent via-border-default to-transparent opacity-50"></div>



      {/* Settings */}

      <div className="px-2 pb-2">

        <Link

          href="/settings"

          className={cn(

            "group w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-text-muted hover:bg-background-hover hover:text-text-primary transition-all duration-200",

            pathname === "/settings" && "bg-primary-600/10 text-primary-400",

            !isHovered && "justify-center"

          )}

          title={!isHovered ? "Settings" : undefined}

        >

          <div className="group-hover:scale-105 transition-all duration-200">

            <Settings className="h-4 w-4" />

          </div>

          {isHovered && <span className="flex-1 text-left whitespace-nowrap">Settings</span>}

        </Link>

      </div>



      {/* Sign Out */}

      <div className="px-2 pb-2">

        <button

          onClick={onSignOut}

          className={cn(

            "group w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-text-muted hover:bg-status-error/5 hover:text-status-error transition-all duration-200",

            !isHovered && "justify-center"

          )}

          title={!isHovered ? "Sign Out" : undefined}

        >

          <div className="group-hover:scale-105 group-hover:rotate-6 transition-all duration-200">

            <LogOut className="h-4 w-4" />

          </div>

          {isHovered && <span className="flex-1 text-left whitespace-nowrap">Sign Out</span>}

        </button>

      </div>

    </div>

    </>

  )

}

