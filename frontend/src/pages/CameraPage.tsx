import { useRef, useState, useCallback, useEffect } from "react"
import { Camera, RefreshCw, Upload, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"


export function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string>("")

  // カメラを起動する関数
  const startCamera = useCallback(async () => {
    setError("")
    try {
      // スマホの背面カメラ（environment）を優先的に要求
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err: any) {
      console.error("カメラの起動に失敗しました:", err)
      setError("カメラへのアクセスが許可されていないか、カメラが見つかりません。")
    }
  }, [])

  // カメラを停止する関数（コンポーネント破棄時や撮影後に使用）
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  // コンポーネントのマウント時にカメラを起動し、アンマウント時に停止
  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [startCamera]) // eslint-disable-line react-hooks/exhaustive-deps

  // シャッターを切る関数
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // キャンバスのサイズをビデオの解像度に合わせる
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        // ビデオの現在のフレームをキャンバスに描画
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // 画像を Base64 形式の Data URL として取得 (JPEG形式, 画質0.8)
        const imageUrl = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImage(imageUrl)
        
        // 撮影後はカメラを一旦止める（バッテリー節約のため）
        stopCamera()
      }
    }
  }

  // 再撮影する関数
  const retakeImage = () => {
    setCapturedImage(null)
    startCamera()
  }

  // 画像を送信・保存する関数（ダミー）
  const handleUpload = () => {
    if (!capturedImage) return
    console.log("アップロードする画像データ:", capturedImage)
    alert("画像をアップロードしました！（Consoleを確認してください）")
    // TODO: ここでS3やFlask APIに画像を送信する処理を書く
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // FileReader を使って画像を Base64 形式で読み込む
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setCapturedImage(e.target.result as string)
        stopCamera() // 画像が選ばれたらカメラのストリームは停止して節約する
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">画像撮影</CardTitle>
          <CardDescription>
            対象物をフレームに収めて撮影してください。
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
          
          {/* カメラのプレビュー領域 or 撮影した画像の確認領域 */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-slate-900">
            {!capturedImage ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="h-full w-full object-cover"
              />
            )}
            
            {/* 非表示のCanvas（画像データ生成用） */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pb-6">
          {!capturedImage ? (
            // === 撮影前のボタン群 ===
            <div className="flex w-full flex-col gap-3">
              <Button 
                size="lg" 
                className="w-full h-14 rounded-full" 
                onClick={captureImage}
                disabled={!stream}
              >
                <Camera className="mr-2 h-6 w-6" />
                撮影する
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-14 rounded-full" 
                onClick={triggerFileInput}
              >
                <ImageIcon className="mr-2 h-6 w-6" />
                アルバムから選ぶ
              </Button>
              
              {/* 隠しファイル入力: accept="image/*" で画像のみに制限 */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            // === 撮影後 / 選択後のボタン群 ===
            <div className="flex w-full gap-2">
              <Button variant="outline" className="w-1/2" onClick={retakeImage}>
                <RefreshCw className="mr-2 h-4 w-4" />
                やり直す
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