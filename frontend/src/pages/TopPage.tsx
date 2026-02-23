import { useNavigate } from "react-router-dom"
import { signOut } from "aws-amplify/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TopPage() {
  const navigate = useNavigate()

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut() // Cognitoからサインアウト（トークン破棄）
      navigate("/login") // ログイン画面へ戻す
    } catch (error) {
      console.error("ログアウトエラー:", error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">PyFlask-TsReact</h1>
        <Button variant="outline" onClick={handleLogout}>
          ログアウト
        </Button>
      </header>

      {/* メインコンテンツ */}
      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-slate-800">ダッシュボード</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ユーザー数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-700">1,234</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">今月の売上</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-700">¥850,000</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">システム状態</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-500">正常稼働中</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}