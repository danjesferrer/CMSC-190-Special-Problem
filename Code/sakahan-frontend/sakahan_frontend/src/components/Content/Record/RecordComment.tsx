import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import CommentField from "@/components/Utils/Fields/CommentField";
import { type Comment } from "@/types";
import { useGetAllCommentQuery } from "@/state/record/recordApiSlice";
import { type RootState } from "@/state/store";

const RecordComment = () => {
  const currentSelectedRecord = useSelector((state: RootState) => state.record.selectedRecord);
  const commentContainerRef = useRef<HTMLDivElement>(null);

  const {
    data: comments,
    isLoading,
    isFetching,
  } = useGetAllCommentQuery(
    {
      contribution: currentSelectedRecord?.id,
    },
    { refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    const container = commentContainerRef.current;
    if (!container) return;

    // Smooth scroll after initial mount
    const scrollTimeout = setTimeout(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }, 50);

    // Watch for DOM changes and scroll smoothly
    const observer = new MutationObserver(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(scrollTimeout);
      observer.disconnect();
    };
  }, [comments]);

  return (
    <Box ref={commentContainerRef} className="flex-1 overflow-y-auto">
      {isLoading || isFetching ? (
        <Box className="flex items-center justify-center">
          <CircularProgress size={40} color="inherit" />
        </Box>
      ) : Object.keys(comments).length === 0 ? (
        <Box className="flex items-center justify-center h-full">
          <Typography className="text-tertiary">No discussion yet.</Typography>
        </Box>
      ) : (
        (Object.entries(comments) as [string, Comment[]][]).map(([date, comments]) => (
          <Box key={date} className="pb-4 pr-2">
            <Box className="text-center mb-4">
              <Typography className="!text-sm">{new Date(date).toLocaleDateString()}</Typography>
            </Box>

            {comments.map((comment) => (
              <CommentField key={comment.id} comment={comment} />
            ))}
          </Box>
        ))
      )}
    </Box>
  );
};

export default RecordComment;
