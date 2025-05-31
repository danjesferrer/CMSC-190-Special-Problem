import { useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { UserIcon } from "@/components/Icons/";
import { statusColors, statusIcons } from "@/constants";
import { type Record } from "@/types";
import { type RootState } from "@/state/store";

interface RecordDetailProps {
  record: Record;
  onClick?: () => void;
}

const RecordDetail = ({ record, onClick }: RecordDetailProps) => {
  const currentSelectedRecord = useSelector((state: RootState) => state.record.selectedRecord);
  const IconComponent = statusIcons[record.status];
  const color = statusColors[record.status];
  const isSelected = currentSelectedRecord?.id === record.id;

  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative",
        border: "2px solid",
        borderColor: isSelected ? "var(--primary)" : "var(--divider)",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "5px 5px 5px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
        transition: "transform 0.1s ease-in-out",
        "&:hover": {
          transform: "scale(1.01)",
          boxShadow: "5px 8px 10px rgba(0, 0, 0, 0.1)",
          borderColor: "var(--primary)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 12,
          bgcolor: color,
        }}
      />
      <Box sx={{ p: 2, pl: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box className="w-[70%]">
            <Typography
              className="!text-lg !font-bold text-tertiary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {record.title}
            </Typography>
            <Typography
              className="!text-sm text-quaternary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {record.address}
            </Typography>
          </Box>
          <Typography className="!text-sm text-quaternary">
            {new Date(record.date_published).toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
          <Chip
            label={record.status}
            icon={<IconComponent />}
            size="small"
            sx={{
              "&.MuiChip-root": {
                bgcolor: color,
                color: "var(--background)",
              },
              "& .MuiChip-icon": {
                color: "var(--background)",
              },
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography className="!text-sm text-quaternary">{record.author.first_name}</Typography>
            <Avatar
              sx={{
                width: 20,
                height: 20,
                bgcolor: "transparent",
              }}
            >
              <UserIcon className="text-secondary w-[24px] h-[24px]" />
            </Avatar>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RecordDetail;
