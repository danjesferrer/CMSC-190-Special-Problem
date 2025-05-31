import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppLogoIcon, AppNameIcon } from "@/components/Icons/";

export default function NotFoundPage() {
  return (
    <Box className="flex justify-center items-center h-screen bg-background">
      <Stack direction="column" spacing={4} alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <AppLogoIcon className="text-primary w-[113px] h-[73px]" />
          <AppNameIcon className="text-primary w-[217px] h-[40px]" />
        </Stack>

        <Stack direction="column" spacing={2} alignItems="center">
          <Typography className="!font-black !text-2xl text-tertiary">Page Not Found</Typography>
          <Typography className="!font-medium !text-xl text-tertiary !mb-4">
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
