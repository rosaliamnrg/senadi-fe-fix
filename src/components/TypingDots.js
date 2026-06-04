import { keyframes, Box } from "@mui/material";

const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30%           { transform: translateY(-6px); opacity: 1; }
`;

function TypingDots() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "5px", height: 20 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "#90959a",
            animation: `${bounce} 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </Box>
  );
}

export default TypingDots;