import ChatbotLauncher from "./components/ChatbotLauncher/ChatbotLauncher";
import AppRoutes from "./routes/AppRoutes";
import MainLayout from "./layouts/MainLayout";

export default function App() {
  return (
    <MainLayout>
      <AppRoutes />
      <ChatbotLauncher />
    </MainLayout>
  );
}