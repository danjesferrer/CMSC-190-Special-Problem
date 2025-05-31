import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Slide from "@mui/material/Slide";
import Snackbar, { type SnackbarCloseReason } from "@mui/material/Snackbar";
import { type RootState } from "@/state/store";
import { closeToast } from "@/state/toast/toastSlice";

const Toast = () => {
  const dispatch = useDispatch();
  const currentOpenToast = useSelector((state: RootState) => state.toast.openToast);
  const currentTitle = useSelector((state: RootState) => state.toast.title);
  const currentMessage = useSelector((state: RootState) => state.toast.message);
  const currentSeverity = useSelector((state: RootState) => state.toast.severity);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === "clickaway") {
      return;
    }

    dispatch(closeToast());
  };

  return (
    <Snackbar open={currentOpenToast} autoHideDuration={3000} onClose={handleClose} TransitionComponent={Slide}>
      <Alert severity={currentSeverity} onClose={handleClose} variant="filled" sx={{ width: "100%" }}>
        <AlertTitle>{currentTitle}</AlertTitle>
        {currentMessage}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
