import { useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { UserIcon } from "@/components/Icons/";
import { type Comment } from "@/types";
import { type RootState } from "@/state/store";

interface CommentFieldProps {
  comment: Comment;
}

const CommentField = ({ comment }: CommentFieldProps) => {
  const currentAuthenticatedUser = useSelector((state: RootState) => state.user.authenticatedUser);

  return (
    <Box key={comment.id} className="mb-2 mr-2">
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: comment.author.id === currentAuthenticatedUser?.id ? "var(--divider)" : "rgba(0, 0, 0, 0.04)",
          borderRadius: 4,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "rgba(0, 0, 0, 0.08)",
            }}
          >
            <UserIcon className="text-secondary w-[24px] h-[24px]" />
          </Avatar>

          <Stack direction="column" className="w-full">
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography className="!text-xs text-tertiary">
                {comment.author.id === currentAuthenticatedUser?.id ? "You" : comment.author.first_name}
              </Typography>
              <Typography className="!text-xs text-tertiary">
                {new Date(comment.date_created).toLocaleTimeString()}
              </Typography>
            </Stack>

            <Typography className="!text-sm text-quaternary">{comment.content}</Typography>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CommentField;
