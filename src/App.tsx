import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import useAppStore from "./stores/useAppStore";
import Login from "./components/Login";
import Navigation from "./components/Navigation";
import Sidebar from "./components/Sidebar";
import FileViewer from "./components/FileViewer";
import TabPanel from "./components/TabPanel";
import wsClient from "./utils/websocket";
import useChatStore from "./stores/useChatStore";
import { ChatResponse } from "./types/websocket";
import ThemeProvider from "./components/ThemeProvider";
import { useWebSocket } from "./hooks/useWebSocket";

// latest changes
import { Box, Flex, Stack } from "@chakra-ui/react";
import { LeftSidebar } from "./components/latest/leftSiderbar";
import { TopSection } from "./components/latest/topSections";
import { PromptSection } from "./components/latest/promptSection";
// latest changes

function App() {
  const { isAuthenticated } = useAppStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const addMessage = useChatStore((state) => state.addMessage);

  // Initialize WebSocket connection
  useWebSocket(setIsCheckingAuth);

  // Register chat message handler
  useEffect(() => {
    const handleChatResponse = (data: ChatResponse["data"]) => {
      if (data.message) {
        addMessage({
          type: data.error ? "error" : "assistant",
          content: data.error || data.message,
        });
      }
    };

    wsClient.registerHandler("chat_response", handleChatResponse);

    return () => {
      wsClient.unregisterHandler("chat_response");
    };
  }, [addMessage]);

  if (isCheckingAuth) {
    return (
      <ThemeProvider>
        <div
          className="h-screen flex items-center justify-center"
          style={{ backgroundColor: "var(--color-bg-primary)" }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <Toaster />
        </div>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <Login />
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Flex minH="100vh" position="relative">
        <LeftSidebar />

        <Box flex="1">
          <Stack h="full">
            <TopSection />
            <PromptSection />
          </Stack>
        </Box>
      </Flex>
    </ThemeProvider>
  );
}

export default App;
