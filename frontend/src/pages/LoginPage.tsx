import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signIn, confirmSignIn, confirmSignUp } from "aws-amplify/auth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// 画面の表示状態
type AuthStep = "LOGIN" | "NEW_PASSWORD" | "CONFIRM_SIGN_UP"

export function LoginPage() {
  const navigate = useNavigate()

  // フォームの状態
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [authCode, setAuthCode] = useState("")

  // 画面制御の状態
  const [step, setStep] = useState<AuthStep>("LOGIN")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
        options: { authFlowType: "USER_PASSWORD_AUTH" }
      })

      if (isSignedIn) {
        navigate("/")
      }
      
      switch (nextStep.signInStep) {
        case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
          setStep("NEW_PASSWORD")
          break
        case "CONFIRM_SIGN_UP":
          setStep("CONFIRM_SIGN_UP")
          break
        default:
          // その他のサインインステップは未対応
          console.error("未対応のサインインステップ:", nextStep.signInStep)
      }
    } catch (err: any) {
      if (err.name === "UserAlreadyAuthenticatedException") {
        navigate("/")
      } else if (err.name === "NotAuthorizedException") {
        setError("メールアドレスまたはパスワードが間違っています。")
      } else if (err.name === "UserNotFoundException") {
        setError("ユーザーが見つかりません。")
      } else {
        setError(err.message || "ログインに失敗しました。")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 初回パスワード設定処理 (FORCE_CHANGE_PASSWORD)
  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // 新しいパスワードを送信
      const { isSignedIn } = await confirmSignIn({ challengeResponse: newPassword })
      
      if (isSignedIn) {
        alert("パスワードの設定が完了しました！")
        navigate("/")
      }
    } catch (err: any) {
      setError(err.message || "パスワードの更新に失敗しました。")
    } finally {
      setIsLoading(false)
    }
  }

  // 検証コード確認処理 (UNCONFIRMED)
  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // confirmSignUp でメールに届いたコードを送信
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: authCode
      })
      
      if (isSignUpComplete) {
        alert("アカウントの検証が完了しました。再度ログインしてください。")
        setStep("LOGIN") // 検証完了後はログイン画面に戻す
      }
    } catch (err: any) {
      setError(err.message || "検証コードの確認に失敗しました。")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm shadow-md">
        
        {/* === ログイン画面 === */}
        {step === "LOGIN" && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">ログイン</CardTitle>
              <CardDescription>
                メールアドレスとパスワードを入力してシステムにアクセスします。
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "処理中..." : "ログイン"}
                </Button>
              </CardFooter>
            </form>
          </>
        )}

        {/* === 初回パスワード設定画面 === */}
        {step === "NEW_PASSWORD" && (
          <>
            <CardHeader>
              <CardTitle className="text-xl">パスワードの初期設定</CardTitle>
              <CardDescription>
                セキュリティのため、新しいパスワードを設定してください。
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleNewPassword}>
              <CardContent className="space-y-4">
                {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="new-password">新しいパスワード</Label>
                  <Input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "処理中..." : "設定してログイン"}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep("LOGIN")}>
                  キャンセル
                </Button>
              </CardFooter>
            </form>
          </>
        )}

        {/* === 確認コード入力画面 === */}
        {step === "CONFIRM_SIGN_UP" && (
          <>
            <CardHeader>
              <CardTitle className="text-xl">アカウントの確認</CardTitle>
              <CardDescription>
                メールアドレスに送信された検証コードを入力してください。
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleConfirmSignUp}>
              <CardContent className="space-y-4">
                {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="auth-code">検証コード</Label>
                  <Input
                    id="auth-code"
                    type="text"
                    required
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "処理中..." : "確認する"}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep("LOGIN")}>
                  キャンセル
                </Button>
              </CardFooter>
            </form>
          </>
        )}

      </Card>
    </div>
  )
}