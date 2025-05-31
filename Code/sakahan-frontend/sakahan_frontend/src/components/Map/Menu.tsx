"use client";

import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { buttons, cards } from "@/constants";
import { CardType, ToastType, ToolType } from "@/enums";
import { disableInteraction, enableInteraction } from "@/lib";
import { useFile } from "@/provider";
import { changeCard, resetOtherMenu } from "@/state/map/mapSlice";
import { type RootState } from "@/state/store";
import { openToast } from "@/state/toast/toastSlice";

const Menu = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const currentCard = useSelector((state: RootState) => state.map.card);
  const CardComponent = cards[currentCard];

  const currentTool = useSelector((state: RootState) => state.map.tool);
  const currentPreviewRecord = useSelector((state: RootState) => state.contribution.previewRecord);
  const currentIsAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { setFiles } = useFile();

  const checkCurrentTool = (cardType: CardType) => {
    if (currentTool !== ToolType.NONE && cardType !== CardType.CONTRIBUTE) {
      dispatch(
        openToast({
          openToast: true,
          title: "Unsaved Changes",
          message: "Please save or cancel your changes or exit the current tool.",
          severity: ToastType.WARNING,
        }),
      );

      return CardType.CONTRIBUTE;
    }

    return cardType;
  };

  // Close active card if clicked again.
  const handleCardToggle = (cardType: CardType) => {
    const newCard = currentCard === cardType ? CardType.NONE : checkCurrentTool(cardType);
    dispatch(changeCard(newCard));

    if (newCard === CardType.CONTRIBUTE || newCard === CardType.RECORD) {
      if (!currentPreviewRecord) setFiles([]);
      dispatch(resetOtherMenu());
    }
  };

  return (
    <Stack direction="row" spacing={2}>
      <Box
        className="card max-h-min"
        onMouseEnter={() => disableInteraction(map)}
        onMouseLeave={() => enableInteraction(map)}
      >
        <ButtonGroup orientation="vertical">
          {buttons.map(({ type, label, Icon }) => {
            if (!currentIsAuthenticated && (type === CardType.CONTRIBUTE || type === CardType.RECORD)) return null;

            return (
              <Tooltip key={type} title={label} placement="right">
                <IconButton onClick={() => handleCardToggle(type as CardType)}>
                  <Icon className={`w-[32px] h-[32px] ${currentCard === type ? "text-primary" : "text-secondary"}`} />
                </IconButton>
              </Tooltip>
            );
          })}
        </ButtonGroup>
      </Box>

      {currentCard !== CardType.NONE && <CardComponent />}
    </Stack>
  );
};

export default Menu;
