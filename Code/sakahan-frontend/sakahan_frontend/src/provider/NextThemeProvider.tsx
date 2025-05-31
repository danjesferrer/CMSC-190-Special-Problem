"use client";

import ThemeProvider from "@mui/material/styles/ThemeProvider";
import createTheme from "@mui/material/styles/createTheme";
import { type ProviderProps } from "@/types";

const theme = createTheme({
  // palette: {
  //   primary: {
  //     main: "#2196F3", // Blue
  //   },
  //   secondary: {
  //     main: "#FF5722", // Orange
  //   },
  // },
  typography: {
    fontFamily: "Poppins, serif",
  },
  components: {
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "var(--primary)", // Custom indicator color
          height: 4, // Make the indicator thicker
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: "var(--primary)", // Custom selected tab text color
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          "& .MuiPaginationItem-root": {
            fontSize: "1rem",
            fontWeight: "bold",
            margin: "0 4px",
            minWidth: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&.Mui-selected": {
              backgroundColor: "var(--primary)",
              color: "var(--background)",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "var(--background)",
              },
            },
            "&:hover": {
              color: "var(--primary)",
              borderColor: "var(--primary)",
              backgroundColor: "var(--background)",
            },
          },
        },
      },
    },
  },

  //   components: {
  //     MuiOutlinedInput: {
  //       styleOverrides: {
  //         root: {
  //           "& .MuiOutlinedInput-notchedOutline": {
  //             borderColor: "var(--secondary)",
  //             borderWidth: "2px",
  //           },
  //           "&:hover .MuiOutlinedInput-notchedOutline": {
  //             borderColor: "#6A4227", // Darker brown on hover
  //           },
  //           "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
  //             borderColor: "var(--secondary)", // Keeps brown color when focused
  //           },
  //           "&.Mui-error .MuiOutlinedInput-notchedOutline": {
  //             borderColor: "red !important", // Turns red when there's an error
  //           },
  //         },
  //       },
  //     },
  //   },
});

export const NextThemeProvider = ({ children }: ProviderProps) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
