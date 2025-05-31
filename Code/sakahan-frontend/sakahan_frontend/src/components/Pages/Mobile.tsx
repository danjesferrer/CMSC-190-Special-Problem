import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppLogoIcon, AppNameIcon } from "@/components/Icons/";

const Mobile = () => {
  return (
    <Box className="flex justify-center items-center h-screen bg-background">
      <Stack direction="column" spacing={4} alignItems="center" justifyContent="center" className="m-4">
        <Stack direction="row" spacing={1} alignItems="center">
          <AppLogoIcon className="text-primary w-[113px] h-[73px]" />
          <AppNameIcon className="text-primary w-[217px] h-[40px]" />
        </Stack>

        <Box className="flex flex-col items-center justify-center space-y-4 border-4 border-secondary rounded-xl p-6">
          <Typography className="!font-black !text-2xl text-tertiary">Desktop Experience Only</Typography>

          <Typography className="!font-medium !text-lg text-quaternary">
            We&apos;re sorry, but this application is currently optimized for desktop devices only. Please visit us on a
            laptop or desktop computer for the best experience.
          </Typography>

          <Typography className="!font-medium !text-lg text-quaternary">
            We&apos;re working on making this experience available on mobile devices soon!
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default Mobile;
