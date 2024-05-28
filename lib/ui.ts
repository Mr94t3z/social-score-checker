import { createSystem } from "frog/ui";

export const { Box, Image, Heading, Text, VStack, Spacer, vars } = createSystem({
  colors: {
    white: "white",
    black: "black",
    fcPurple: "rgb(71,42,145)",
    red: "rgb(253,39,74)",
    tosca: "rgb(167,210,210)",
    purple: 'rgb(60,59,110)',
    blue: 'rgb(17,54,93)',
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