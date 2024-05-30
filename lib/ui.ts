import { createSystem } from "frog/ui";

export const { Box, Columns, Column, Image, Heading, Text, VStack, Spacer, vars } = createSystem({
  colors: {
    white: "white",
    black: "black",
    fcPurple: "rgb(71,42,145)",
    red: "rgb(253,39,74)",
    tosca: "rgb(167,210,210)",
    yellow: 'rgb(247,169,72)',
    purple: 'rgb(60,59,110)',
    blue: 'rgb(17,54,93)',
    grey: 'rgba(128, 128, 128, 0.75)',
  },
  fonts: {
    default: [
      {
        name: "Space Mono",
        source: "google",
      },
    ],
  },
});