import { useRef, useState } from "react"
import { Camera, Image as ImageIcon, Upload, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function CameraPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  
  // 2つの異なるinput要素を用意
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // 画像が選択・撮影された時の共通処理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // FileReaderで画像をBase64に変換してプレビュー表示
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setCapturedImage(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!capturedImage) return
    
    try {
      // 1. Base64文字列を Blob (ファイルオブジェクト) に変換
      const res = await fetch(capturedImage)
      const blob = await res.blob()
      
      // 2. フォームデータを作成 (Flask側で 'file' という名前で受け取るため)
      const formData = new FormData()
      formData.append("file", blob, "captured_image.jpg")

      // 3. Flask API へ POST リクエスト
      const uploadRes = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
        // 注意: fetchでFormDataを送る場合、'Content-Type'ヘッダーは手動で設定してはいけません（ブラウザが自動設定します）
      })

      if (!uploadRes.ok) {
        throw new Error(`アップロード失敗: ${uploadRes.status}`)
      }

      const data = await uploadRes.json()
      console.log("アップロード成功:", data)
      alert("S3への保存が完了しました！")
      
      // 送信後は画面をリセット
      setCapturedImage(null)

    } catch (error) {
      console.error("アップロードエラー:", error)
      alert("エラーが発生しました。コンソールを確認してください。")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">画像アップロード</CardTitle>
          <CardDescription>
            写真を撮影するか、アルバムから選択してください。
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* プレビュー領域 */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-slate-200 flex items-center justify-center border-2 border-dashed border-slate-300">
            {capturedImage ? (
              <img src={capturedImage} alt="Preview" className="h-full w-full object-contain" />
            ) : (
              <span className="text-slate-400 text-sm">画像がありません</span>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pb-6">
          {!capturedImage ? (
            <div className="flex w-full flex-col gap-3">
              {/* 1. カメラを直接起動するボタン */}
              <Button 
                size="lg" 
                className="w-full h-14 rounded-full" 
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="mr-2 h-6 w-6" />
                カメラを起動
              </Button>
              
              {/* 2. ポップアップ（またはアルバム）を開くボタン */}
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-14 rounded-full" 
                onClick={() => galleryInputRef.current?.click()}
              >
                <ImageIcon className="mr-2 h-6 w-6" />
                ライブラリから選ぶ
              </Button>

              {/* 隠しInput群 */}
              {/* capture="environment" を付けると直接カメラが起動しやすい */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={cameraInputRef}
                onChange={handleFileSelect}
              />
              {/* capture無しだとOS標準の選択ポップアップが出る */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={galleryInputRef}
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="flex w-full gap-2">
              <Button variant="outline" className="w-1/2" onClick={() => setCapturedImage(null)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                クリア
              </Button>
              <Button className="w-1/2" onClick={handleUpload}>
                <Upload className="mr-2 h-4 w-4" />
                送信する
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}