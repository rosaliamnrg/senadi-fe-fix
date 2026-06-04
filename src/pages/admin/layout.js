import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function LayoutAdmin({ children }) {
   const {
      user,
      isAuthenticated,
      isAdmin,
      loading: authLoading,
      logout,
      fetchWithAuth,
    } = useAuth();
  const router = useRouter();
  
  // Determine the active tab based on the current route
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Set the active tab based on the current route
    if (router.pathname === "/admin/chat") {
      setActiveTab(0);
    } else if (router.pathname === "/admin/upload") {
      setActiveTab(1);
    }
  }, [router.pathname]);  // Re-run when the route changes

  useEffect(() => {
      if (!authLoading && !isAuthenticated) {
        router.push("/login");
      }
  
      if (!authLoading && !isAdmin) {
        router.push("/chat");
      }
    }, [isAuthenticated, isAdmin, authLoading, router]);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {/* AppBar */}
        <AppBar position="fixed" sx={{ backgroundColor: "#06344E" }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <img
                  src="/images/logo.png"
                  style={{ height: 55 }}
              />
            </Box>
            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Buttons as Links */}
        <Box
          sx={{
            position: "fixed",
            width: "100%",
            backgroundColor: "white",
            zIndex: theme => theme.zIndex.appBar,
            display: "flex",
            justifyContent: "left",
            borderBottom: 1,
            borderColor: "divider",
            padding: "8px 0 8px 5px",
            marginTop: '64px',
          }}
        >
          <Button
            component={Link}
            href="/admin/chat" // Use the "href" prop for Next.js Link
            sx={{
              color: activeTab === 0 ? "#06344E" : "black",
              borderBottom: activeTab === 0 ? "2px solid #06344E" : "none"
            }}
          >
            Kelola Chat
          </Button>
          <Button
            component={Link}
            href="/admin/upload" // Use the "href" prop for Next.js Link
            sx={{
              color: activeTab === 1 ? "#06344E" : "black",
              borderBottom: activeTab === 1 ? "2px solid #06344E" : "none"
            }}
          >
            Upload File
          </Button>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ flexGrow: 1, p: 2, overflow: "hidden", display: "flex", marginTop: "112px" }}>
        {children}
      </Box>
    </>
  );
}
