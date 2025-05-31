"use client";

import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Aids from "@/components/Content/Contribute/Aids";
import { ToolType } from "@/enums";
import { type RootState } from "@/state/store";

const Footer = () => {
  const currentIsAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentTool = useSelector((state: RootState) => state.map.tool);

  return (
    <Box className="w-screen">
      {currentIsAuthenticated && (
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
          {currentTool !== ToolType.NONE && <Aids />}
        </Stack>
      )}
    </Box>
  );
};

export default Footer;
