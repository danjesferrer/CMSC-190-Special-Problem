import { useState } from "react";
import { useSelector } from "react-redux";
import SendIcon from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import { StatusType } from "@/enums";
import { useAddCommentMutation, useGetAllCommentQuery } from "@/state/record/recordApiSlice";
import { type RootState } from "@/state/store";

const RecordMessage = () => {
  const currentAuthenticatedUser = useSelector((state: RootState) => state.user.authenticatedUser);
  const currentSelectedRecord = useSelector((state: RootState) => state.record.selectedRecord);
  const currentIsExpanded = useSelector((state: RootState) => state.record.isExpanded);

  const { refetch } = useGetAllCommentQuery(
    {
      contribution: currentSelectedRecord?.id,
    },
    { refetchOnMountOrArgChange: true },
  );
  const [addComment, { isLoading }] = useAddCommentMutation();
  const [message, setMessage] = useState("");

  const handleMessageSend = async () => {
    if (message)
      await addComment({
        contribution: currentSelectedRecord?.id,
        author: currentAuthenticatedUser?.id,
        content: message,
      })
        .unwrap()
        .then(() => {
          setMessage("");
          refetch();
        });
  };

  return (
    <Box className={`${currentIsExpanded ? "flex-[0.12]" : "flex-[0.5]"} overflow-hidden relative`}>
      <Box className="absolute bottom-0 left-0 right-0">
        <OutlinedInput
          fullWidth
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault(); // Prevents a new line if using multiline input
              handleMessageSend();
            }
          }}
          placeholder="Type a message ..."
          endAdornment={
            <InputAdornment position="start">
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <IconButton
                  sx={{
                    color: "var(--secondary)",
                    "&:hover": {
                      color: "var(--primary)",
                    },
                  }}
                  onClick={handleMessageSend}
                  disabled={isLoading || currentSelectedRecord!.status !== StatusType.PENDING}
                  edge="end"
                >
                  <SendIcon />
                </IconButton>
              )}
            </InputAdornment>
          }
          className="[&_.MuiOutlinedInput-notchedOutline]:!border-2 [&_.MuiOutlinedInput-notchedOutline]:!border-secondary !rounded-xl"
          disabled={currentSelectedRecord!.status !== StatusType.PENDING}
        />
      </Box>
    </Box>
  );
};

export default RecordMessage;
