"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trash2, Database, RefreshCw, Shield, User, Settings as SettingsIcon } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function SettingsContent() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [isResetting, setIsResetting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleResetDatabase = async () => {
    try {
      setIsResetting(true)
      setResetSuccess(false)

      const response = await fetch('/api/reset-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(t("resetDataFailed"))
      }

      const result = await response.json()
      console.log('Reset result:', result)
      
      setResetSuccess(true)
      
      // 3秒后刷新页面
      setTimeout(() => {
        window.location.reload()
      }, 3000)
      
    } catch (error) {
      console.error('Reset failed:', error)
      alert(t("resetDataFailedRetry"))
    } finally {
      setIsResetting(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 font-chinese">{t("loginRequired")}</h3>
          <p className="text-gray-500 font-chinese">{t("loginRequiredMessage")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-chinese flex items-center">
          <SettingsIcon className="w-8 h-8 mr-3" />
          {t("settingsTitle")}
        </h1>
        <p className="mt-2 text-gray-600 font-chinese">{t("settingsSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 用户信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="font-chinese flex items-center">
              <User className="w-5 h-5 mr-2" />
              {t("userInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt={t("userAvatar")} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 font-chinese">{session.user.name}</p>
                <p className="text-sm text-gray-500">{session.user.email}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 font-chinese">{t("loginMethod")}</p>
                <Badge variant="outline" className="mt-1">Google</Badge>
              </div>
              <div>
                <p className="text-gray-500 font-chinese">{t("accountStatus")}</p>
                <Badge variant="default" className="mt-1 bg-green-100 text-green-800 font-chinese">{t("active")}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据管理卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="font-chinese flex items-center">
              <Database className="w-5 h-5 mr-2" />
              {t("dataManagement")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Trash2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 font-chinese">{t("resetDatabase")}</h3>
                  <p className="mt-1 text-sm text-red-700 font-chinese">
                    {t("resetDatabaseDescription")}
                  </p>
                  <div className="mt-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={isResetting}
                          className="font-chinese"
                        >
                          {isResetting ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              {t("resetting")}
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t("resetDatabaseButton")}
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-chinese">{t("confirmResetDatabase")}</AlertDialogTitle>
                          <AlertDialogDescription className="font-chinese">
                            {t("resetDatabaseWarning")}
                            <br />{t("allTradingRecords")}
                            <br />{t("allPositions")}
                            <br />{t("relatedStats")}
                            <br /><br />
                            <strong>{t("irreversibleAction")}</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="font-chinese">{t("cancel")}</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleResetDatabase}
                            className="bg-red-600 hover:bg-red-700 font-chinese"
                          >
                            {t("confirmReset")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>

            {resetSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-green-900 font-chinese">{t("resetSuccess")}</p>
                    <p className="text-sm text-green-700 font-chinese">{t("resetSuccessMessage")}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 其他设置选项 */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-chinese">{t("otherSettings")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <SettingsIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="font-chinese">{t("moreSettingsComingSoon")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 