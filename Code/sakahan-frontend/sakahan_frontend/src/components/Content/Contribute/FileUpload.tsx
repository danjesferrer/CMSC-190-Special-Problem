"use client";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DropZone, FileChip, FilesContainer, HiddenInput } from "@/components/Utils/Styles";
import { acceptedFileTypes, maxFileNameLength, maxFileSize, maxFiles } from "@/constants";
import { StatusType, ToastType } from "@/enums";
import { useFile } from "@/provider";
import { type FileObject } from "@/types";
import { useGetAllFileContributionQuery } from "@/state/contribution/contributionApiSlice";
import { changeHasFileChanges } from "@/state/contribution/contributionSlice";
import { type RootState } from "@/state/store";
import { openToast } from "@/state/toast/toastSlice";

const FileUpload = () => {
  const dispatch = useDispatch();
  const { files, setFiles } = useFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPreviewRecord = useSelector((state: RootState) => state.contribution.previewRecord);
  const isDisabled = currentPreviewRecord ? currentPreviewRecord.status !== StatusType.PENDING : false;

  const {
    data: fileObjects,
    isLoading,
    isFetching,
  } = useGetAllFileContributionQuery(
    { contribution: currentPreviewRecord?.id },
    { skip: !currentPreviewRecord?.id, refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    if (isLoading || isFetching) return;

    if (fileObjects) {
      const result: FileObject[] = fileObjects.map((item: any) => {
        const { file_identifier, file_name, file_size, file_type, file, ...rest } = item;

        return {
          ...rest,
          identifier: file_identifier,
          name: file_name,
          size: file_size,
          type: file_type,
          url: file,
        } as FileObject;
      });

      setFiles(result);
    }
  }, [fileObjects]);

  const handleFileChange = (newSelectedFiles: FileList | null) => {
    if (!newSelectedFiles) return;

    // Check if adding these files would exceed the max files limit
    if (files.length + newSelectedFiles.length > maxFiles) {
      dispatch(
        openToast({
          openToast: true,
          title: "File Limit Exceeded",
          message: `You can only upload a maximum of ${maxFiles} files.`,
          severity: ToastType.ERROR,
        }),
      );

      return;
    }

    const newFilesArray: FileObject[] = [];

    Array.from(newSelectedFiles).forEach((file) => {
      // Check file name length.
      if (file.name.length > maxFileNameLength) {
        dispatch(
          openToast({
            openToast: true,
            title: "File Name Too Long",
            message: `File name "${file.name}" exceeds the ${maxFileNameLength} character limit.`,
            severity: ToastType.ERROR,
          }),
        );
        return;
      }

      // Check file size.
      if (file.size > maxFileSize) {
        dispatch(
          openToast({
            openToast: true,
            title: "File Size Exceeded",
            message: `File "${file.name}" exceeds the maximum size of ${maxFileSize / (1024 * 1024)}MB`,
            severity: ToastType.ERROR,
          }),
        );

        return;
      }

      // Check file type.
      const fileType = file.type;
      const fileExtension = `.${file.name.split(".").pop()}`;
      const isAccepted = acceptedFileTypes.some((type) => {
        if (type.startsWith(".")) {
          return fileExtension.toLowerCase() === type.toLowerCase();
        }

        return fileType === type;
      });

      if (!isAccepted) {
        dispatch(
          openToast({
            openToast: true,
            title: "Unsupported File Type",
            message: `File "${file.name}" has an unsupported format`,
            severity: ToastType.ERROR,
          }),
        );

        return;
      }

      // Create a new file object with an ID
      const newFile: FileObject = Object.assign(file, {
        identifier: uuidv4(),
        url: null,
      });

      newFilesArray.push(newFile);
    });

    // Update state with new files
    const updatedFiles = [...files, ...newFilesArray];
    dispatch(changeHasFileChanges(true));
    setFiles(updatedFiles);
  };

  const handleDelete = (fileId: string) => {
    const updatedFiles = files.filter((file) => file.identifier !== fileId);

    dispatch(changeHasFileChanges(true));
    setFiles(updatedFiles);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const droppedFiles = event.dataTransfer.files;
    handleFileChange(droppedFiles);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleChipClick = (file: FileObject) => {
    if (file.url) {
      // If the file already has a URL, open it directly
      window.open(file.url, "_blank");

      return;
    }

    // Create a URL for the file
    const fileUrl = URL.createObjectURL(file);

    // Open the URL in a new tab
    window.open(fileUrl, "_blank");

    // Clean up the URL object.
    requestAnimationFrame(() => {
      URL.revokeObjectURL(fileUrl);
    });
  };

  return (
    <Box>
      <DropZone
        onClick={handleUploadClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="mb-2"
        sx={{
          cursor: isDisabled ? "default" : "pointer",
          "&:hover": {
            backgroundColor: isDisabled ? "transparent" : "rgba(0, 0, 0, 0.05)",
          },
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 24, mb: 1 }} className="text-secondary" /> {/* Reduced icon size */}
        <Typography align="center" className="!text-xs text-tertiary">
          Drag & drop PDF files here, or click to select files
        </Typography>
        <Typography align="center" className="!text-xs text-quaternary" sx={{ mt: 0.5 }}>
          Supported format: PDF only
        </Typography>
        <Typography align="center" className="!text-xs text-quaternary">
          Max file size: {maxFileSize / (1024 * 1024)}MB
        </Typography>
        <HiddenInput
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(event) => handleFileChange(event.target.files)}
          accept={acceptedFileTypes.join(",")}
          disabled={isDisabled}
        />
      </DropZone>

      {files.length > 0 && (
        <Box>
          <Typography className="!text-sm text-tertiary">
            Selected Files ({files.length}/{maxFiles})
          </Typography>

          <FilesContainer>
            {files.map((file) => (
              <FileChip
                key={file.identifier}
                label={file.name}
                onClick={() => handleChipClick(file)}
                onDelete={() => handleDelete(file.identifier)}
                deleteIcon={<DeleteIcon className="!text-secondary" />}
                variant="outlined"
              />
            ))}
          </FilesContainer>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
