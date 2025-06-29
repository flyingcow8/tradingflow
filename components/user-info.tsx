"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown, LogOut, Settings, User, Languages, Check } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

export function UserInfo() {
  const { data: session, status } = useSession()
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  const handleSettings = () => {
    router.push('/settings')
  }

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const user = session.user

  return (
    <div className="flex items-center space-x-4">
      {/* 通知按钮 */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-5 h-5 text-gray-600" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
      </Button>

      {/* 用户下拉菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.image || "/placeholder.svg"} alt={t("userAvatar")} />
              <AvatarFallback className="bg-gray-100 text-gray-900 text-sm font-medium">
                {user.name?.slice(0, 2) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900 font-chinese">{user.name}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-chinese">
            <div>
              <p className="font-medium">{user.name || t("user")}</p>
              <p className="text-xs text-gray-500 font-normal">{user.email || ""}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer font-chinese">
            <User className="w-4 h-4 mr-2" />
            {t("profile")}
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer font-chinese" onClick={handleSettings}>
            <Settings className="w-4 h-4 mr-2" />
            {t("settings")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Language Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer font-chinese">
              <Languages className="w-4 h-4 mr-2" />
              {t("language")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem className="cursor-pointer font-chinese" onClick={() => setLanguage("zh")}>
                <Check className={`w-4 h-4 mr-2 ${language === "zh" ? "opacity-100" : "opacity-0"}`} />
                {t("chinese")}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setLanguage("en")}>
                <Check className={`w-4 h-4 mr-2 ${language === "en" ? "opacity-100" : "opacity-0"}`} />
                {t("english")}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600 font-chinese"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
