import Box from "@mui/material/Box";
import RecordComment from "@/components/Content/Record/RecordComment";
import RecordMessage from "@/components/Content/Record/RecordMessage";

const RecordExpanded = () => {
  return (
    <Box className="w-[50%] flex flex-col">
      <Box className="h-full flex flex-col">
        <RecordComment />
        <RecordMessage />
      </Box>
    </Box>
  );
};

export default RecordExpanded;
