import { Button, Frog, TextInput } from 'frog'
import { handle } from 'frog/vercel'
import { init, fetchQuery } from "@airstack/node";
import { Box, Heading, Text, VStack, Spacer, vars } from "../lib/ui.js";
import dotenv from 'dotenv';

// Uncomment this packages to tested on local server
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';


// Load environment variables from .env file
dotenv.config();


export const app = new Frog({
  assetsPath: '/',
  basePath: '/api/frame',
  ui: { vars },
  browserLocation: 'https://github.com/Mr94t3z/social-score-checker'
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})


// Initialize Airstack with API key
init(process.env.AIRSTACK_API_KEY || '');


// Initial frame
app.frame('/', (c) => {
  return c.res({
    image: (
      <Box
          grow
          alignVertical="center"
          backgroundColor="blue"
          padding="48"
          textAlign="center"
          height="100%"
      >
          <VStack gap="4">
              <Heading color="red" weight="900" align="center" size="32">
                🎖️ SCS Checker 🎖️
              </Heading>
              <Spacer size="16" />
              <Text align="center" color="tosca" size="16">
                a frame & cast action to check social capital score.
              </Text>
              <Spacer size="22" />
              <Box flexDirection="row" justifyContent="center">
                  <Text color="white" align="center" size="14">created by</Text>
                  <Spacer size="10" />
                  <Text color="red" decoration="underline" align="center" size="14"> @0x94t3z</Text>
              </Box>
          </VStack>
      </Box>
    ),
    intents: [
      <Button action='/search'>Search 🕵🏻</Button>,
      <Button.AddCastAction action='/scs'>
        Install Action
      </Button.AddCastAction>,
    ]
  })
})


app.castAction(
  '/scs',
  (c) => {
    // Stringify the entire castId object
    const castId = JSON.stringify(c.actionData.castId);

    // Parse the message back to an object to extract fid
    const parsedCastId = JSON.parse(castId);
    const castFid = parsedCastId.fid;

    return c.frame({ path: `/scs-frame/${castFid}`})
  }, 
  { name: "🎖️ SCS Checker 🎖️", icon: "star" }
)


app.frame('/scs-frame/:castFid', async (c) => {
  const { castFid } = c.req.param();

  try {
    // Define Farcaster Social Capital GraphQL query by FID
    const query = 
    `
      query MyQuery {
        Socials(
          input: {
            filter: {
              dappName: {
                _eq: farcaster
              },
              identity: { _eq: "fc_fid:${castFid}" }
            },
            blockchain: ethereum
          }
        ) {
          Social {
            socialCapital {
              socialCapitalScore
              socialCapitalRank
            }
            profileName
          }
        }
      }
    `;

    const { data } = await fetchQuery(query);

    const socialCapital = data.Socials.Social[0].socialCapital;
    const username = data.Socials.Social[0].profileName;

    const score = socialCapital.socialCapitalScore;
    const rank = socialCapital.socialCapitalRank;

    return c.res({
      image: (
        <Box
            grow
            alignVertical="center"
            backgroundColor="blue"
            padding="48"
            textAlign="center"
            height="100%"
        >
            <VStack gap="4">
                <Heading color="red" weight="900" align="center" size="32">
                  Result
                </Heading>
                <Spacer size="22" />
                <Box flexDirection="row" justifyContent="center">
                    <Text color="tosca" align="center" size="16">Rank</Text>
                    <Spacer size="10" />
                    <Text color="yellow" align="center" size="16"> #{rank} 🏁</Text>
                </Box>
                <Spacer size="10" />
                <Box flexDirection="row" justifyContent="center">
                    <Text color="tosca" align="center" size="16">@{username} have score</Text>
                    <Spacer size="10" />
                    <Text color="yellow" align="center" size="16"> {score} 🎖️</Text>
                </Box>
                <Spacer size="22" />
                <Box flexDirection="row" justifyContent="center">
                    <Text color="white" align="center" size="14">created by</Text>
                    <Spacer size="10" />
                    <Text color="red" decoration="underline" align="center" size="14"> @0x94t3z</Text>
                </Box>
            </VStack>
        </Box>
      ),
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return c.res({
      image: (
        <Box
            grow
            alignVertical="center"
            backgroundColor="blue"
            padding="48"
            textAlign="center"
            height="100%"
        >
            <VStack gap="4">
                <Heading color="red" weight="900" align="center" size="32">
                  Error
                </Heading>
                <Spacer size="16" />
                <Text align="center" color="tosca" size="16">
                  Uh oh! Something went wrong.
                </Text>
                <Spacer size="22" />
                <Box flexDirection="row" justifyContent="center">
                    <Text color="white" align="center" size="14">created by</Text>
                    <Spacer size="10" />
                    <Text color="red" decoration="underline" align="center" size="14"> @0x94t3z</Text>
                </Box>
            </VStack>
        </Box>
      ),
    });
  }
})


app.frame('/search', async (c) => {
  return c.res({
    image: (
      <Box
          grow
          alignVertical="center"
          backgroundColor="blue"
          padding="48"
          textAlign="center"
          height="100%"
      >
          <VStack gap="4">
              <Heading color="red" weight="900" align="center" size="32">
                🎖️ SCS Checker 🎖️
              </Heading>
              <Spacer size="16" />
              <Text align="center" color="tosca" size="16">
                Please input the username to check the SCS.
              </Text>
              <Spacer size="22" />
              <Box flexDirection="row" justifyContent="center">
                  <Text color="white" align="center" size="14">created by</Text>
                  <Spacer size="10" />
                  <Text color="red" decoration="underline" align="center" size="14"> @0x94t3z</Text>
              </Box>
          </VStack>
      </Box>
    ),
    intents: [ 
      <TextInput placeholder="Enter username e.g. betashop.eth" />,
      <Button action='/result'>Submit ⇧</Button>,
      <Button action='/'>Cancel ⏏︎</Button>,
    ]
  })
})


app.frame('/result', async (c) => {
  const { inputText } = c;

  const username = inputText;

  try {
    // Define Farcaster Social Capital GraphQL query by username
    const query = 
    `
    query MyQuery {
      Socials(
        input: {filter: 
          {
            dappName: {_eq: farcaster}, 
            profileName: {_eq: "${username}"}}, 
            blockchain: ethereum
          }
      ) {
        Social {
          socialCapital {
            socialCapitalScore
            socialCapitalRank
          }
        }
      }
    }
    `;

    const { data } = await fetchQuery(query);

    const socialCapital = data.Socials.Social[0].socialCapital;

    const score = socialCapital.socialCapitalScore;
    const rank = socialCapital.socialCapitalRank;

    return c.res({
      image: (
        <Box
            grow
            alignVertical="center"
            backgroundColor="blue"
            padding="48"
            textAlign="center"
            height="100%"
        >
            <VStack gap="4">
                <Heading color="red" weight="900" align="center" size="32">
                  Result
                </Heading>
                <Spacer size="22" />
                <Box flexDirection="row" justifyContent="center">
                    <Text color="tosca" align="center" size="16">Rank</Text>
                    <Spacer size="10" />
                    <Text color="yellow" align="center" size="16"> #{rank} 🏁</Text>
                </Box>
                <Spacer size="10" />
                <Box flexDirection="row" justifyContent="center">
                    <Text color="tosca" align="center" size="16">@{username} have score</Text>
                    <Spacer size="10" />
                    <Text color="yellow" align="center" size="16"> {score} 🎖️</Text>
                </Box>
                <Spacer size="22" />
                <Box flexDirection="row" justifyContent="center">
                    <Text color="white" align="center" size="14">created by</Text>
                    <Spacer size="10" />
                    <Text color="red" decoration="underline" align="center" size="14"> @0x94t3z</Text>
                </Box>
            </VStack>
        </Box>
      ),
      intents: [
        <Button action='/search'>Back ⏏︎</Button>,
      ]
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return c.res({
      image: (
        <Box
            grow
            alignVertical="center"
            backgroundColor="blue"
            padding="48"
            textAlign="center"
            height="100%"
        >
            <VStack gap="4">
                <Heading color="red" weight="900" align="center" size="32">
                  Error
                </Heading>
                <Spacer size="16" />
                <Text align="center" color="tosca" size="16">
                   Uh oh! Username not found.
                </Text>
                <Spacer size="22" />
                <Box flexDirection="row" justifyContent="center">
                    <Text color="white" align="center" size="14">created by</Text>
                    <Spacer size="10" />
                    <Text color="red" decoration="underline" align="center" size="14"> @0x94t3z</Text>
                </Box>
            </VStack>
        </Box>
      ),
      intents: [
        <Button action='/search'>Try again ⏏︎</Button>,
      ]
    });
  }
})


// Uncomment this line code to tested on local server
devtools(app, { serveStatic });

export const GET = handle(app)
export const POST = handle(app)