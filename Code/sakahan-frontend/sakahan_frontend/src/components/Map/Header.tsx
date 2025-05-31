"use client";

import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Extras from "@/components/Content/Contribute/Extras";
import AppNameLogo from "@/components/Map/AppNameLogo";
import Auth from "@/components/Map/Auth";
import Exit from "@/components/Map/Exit";
import User from "@/components/Map/User";
import { ToolType } from "@/enums";
import { type RootState } from "@/state/store";

const Header = () => {
  const currentIsAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentTool = useSelector((state: RootState) => state.map.tool);

  return (
    <Box className="w-screen">
      <Stack direction="row" alignItems="center" justifyContent="space-between" className="mx-12">
        <AppNameLogo />
        {!currentIsAuthenticated ? (
          <Auth />
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            {currentTool !== ToolType.NONE && <Extras />}
            <User />
            <Exit />
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default Header;
