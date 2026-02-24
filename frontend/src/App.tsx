import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginPage } from "@/pages/LoginPage"
import { TopPage } from "@/pages/TopPage"
import { CameraPage } from "@/pages/CameraPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<TopPage />} />
        <Route path="/camera" element={<CameraPage />} />
        {/* 存在しないURLにアクセスされたらトップページへリダイレクト */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
