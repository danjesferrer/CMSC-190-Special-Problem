import { useSelector } from "react-redux";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import RecordExpanded from "@/components/Content/Record/RecordExpanded";
import RecordList from "@/components/Content/Record/RecordList";
import RecordPreview from "@/components/Content/Record/RecordPreview";
import { type RootState } from "@/state/store";

const RecordCard = () => {
  const currentIsExpanded = useSelector((state: RootState) => state.record.isExpanded);

  return (
    <Stack direction="row" spacing={4} className="h-[90%]" divider={<Divider orientation="vertical" flexItem />}>
      {!currentIsExpanded && <RecordList />}
      <RecordPreview />
      {currentIsExpanded && <RecordExpanded />}
    </Stack>
  );
};

export default RecordCard;
