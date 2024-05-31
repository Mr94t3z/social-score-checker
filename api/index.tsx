import { Button, Frog, TextInput } from 'frog'
import { handle } from 'frog/vercel'
import { init, fetchQuery } from "@airstack/node";
import { Box, Image, Heading, Text, VStack, Spacer, vars } from "../lib/ui.js";
import dotenv from 'dotenv';

// Uncomment this packages to tested on local server
// import { devtools } from 'frog/dev';
// import { serveStatic } from 'frog/serve-static';


// Load environment variables from .env file
dotenv.config();

const CAST_INTENS = 
  "https://warpcast.com/~/compose?text=&embeds[]=https://social-score-checker.vercel.app/api/frame"


export const app = new Frog({
  assetsPath: '/',
  basePath: '/api/frame',
  ui: { vars },
  browserLocation: CAST_INTENS
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
              <Box flexDirection="row">
                <Image
                    height="24"
                    objectFit="cover"
                    src="/airstack.png"
                  />
                <Spacer size="10" />
                <Text color="red" decoration="underline" align="center" size="14">
                  Airstack
                </Text>
              </Box>
              <Spacer size="16" />
              <Heading color="red" weight="900" align="center" size="32">
                🎖️ SCS Checker 🎖️
              </Heading>
              <Spacer size="22" />
              <Text align="center" color="tosca" size="16">
                A Frame & Cast Action to check Social Capital Scores built with Airstack.
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
        Install Action ↓
      </Button.AddCastAction>,
    ]
  })
})


app.castAction(
  '/scs',
  (c) => {
    const castId = JSON.stringify(c.actionData.castId);

    // Parse the message back to an object to extract fid
    const parsedCastId = JSON.parse(castId);
    const fid = parsedCastId.fid;
    const hash = parsedCastId.hash;

    return c.frame({ path: `/scs-frame/${fid}/${hash}`})
  }, 
  { name: "SCS Checker", icon: "id-badge", description: "A Farcaster Social Capital Scores (SCS) Checker built with Airstack."}
)


app.frame('/scs-frame/:fid/:hash', async (c) => {
  const { fid, hash } = c.req.param();

  try {
    // Define Farcaster Social Capital Rank/Score/Value GraphQL query by FID
    const query = 
    `
      query MyQuery {
        Socials(
          input: {filter: {dappName: {_eq: farcaster}, identity: {_eq: "fc_fid:${fid}"}}, blockchain: ethereum}
        ) {
          Social {
            socialCapital {
              socialCapitalScore
              socialCapitalRank
            }
            profileName
          }
        }
        FarcasterCasts(
          input: {filter: {hash: {_eq: "${hash}"}}, blockchain: ALL}
        ) {
          Cast {
            socialCapitalValue {
              formattedValue
            }
          }
        }
      }
    `;

    const { data } = await fetchQuery(query);

    const socialCapital = data.Socials.Social[0].socialCapital;
    const socialCapitalValue = data.FarcasterCasts.Cast[0].socialCapitalValue;
    const username = data.Socials.Social[0].profileName;
    
    const rank = socialCapital.socialCapitalRank;
    const score = socialCapital.socialCapitalScore;
    const cast_value = socialCapitalValue.formattedValue;

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
                <Box flexDirection="row">
                  <Image
                      height="24"
                      objectFit="cover"
                      src="/airstack.png"
                    />
                  <Spacer size="10" />
                  <Text color="red" decoration="underline" align="center" size="14">
                    Airstack
                  </Text>
                </Box>
                <Spacer size="16" />
                <Heading color="red" weight="900" align="center" size="32">
                🎖️ Result 🎖️
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
                    <Text color="yellow" align="center" size="16"> {score < 0.0001 ? '0' : score >= 10 ? score.toFixed(2) : score.toFixed(4)} 🪪</Text>
                </Box>
                <Box flexDirection="row" justifyContent="center">
                    <Text color="tosca" align="center" size="16">Cast value</Text>
                    <Spacer size="10" />
                    <Text color="yellow" align="center" size="16"> {cast_value > 0.01 ? cast_value.toFixed(2) : cast_value.toFixed(4)} 🏅</Text>
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
        <Button.Link href='https://docs.airstack.xyz/airstack-docs-and-faqs'>Learn Airstack</Button.Link>,
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
                <Box flexDirection="row">
                  <Image
                      height="24"
                      objectFit="cover"
                      src="/airstack.png"
                    />
                  <Spacer size="10" />
                  <Text color="red" decoration="underline" align="center" size="14">
                    Airstack
                  </Text>
                </Box>
                <Spacer size="16" />
                <Heading color="red" weight="900" align="center" size="32">
                  ⚠️ Error ⚠️
                </Heading>
                <Spacer size="16" />
                <Text align="center" color="tosca" size="16">
                  Uh oh, something went wrong!
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
              <Box flexDirection="row">
                <Image
                    height="24"
                    objectFit="cover"
                    src="/airstack.png"
                  />
                <Spacer size="10" />
                <Text color="red" decoration="underline" align="center" size="14">
                  Airstack
                </Text>
              </Box>
              <Spacer size="16" />
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
              <Spacer size="32" />
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
    // Define Farcaster Social Capital Rank & Score GraphQL query by username
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
                <Box flexDirection="row">
                  <Image
                      height="24"
                      objectFit="cover"
                      src="/airstack.png"
                    />
                  <Spacer size="10" />
                  <Text color="red" decoration="underline" align="center" size="14">
                    Airstack
                  </Text>
                </Box>
                <Spacer size="16" />
                <Heading color="red" weight="900" align="center" size="32">
                  🎖️ Result 🎖️
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
                    <Text color="yellow" align="center" size="16"> {score > 0.01 ? score.toFixed(2) : score.toFixed(4)} 🪪</Text>
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
        <Button.Link href='https://docs.airstack.xyz/airstack-docs-and-faqs'>Learn Airstack</Button.Link>,
        <Button action='/search'>Back ⏏︎</Button>,
      ]
    });
  } catch (error) {
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
                <Box flexDirection="row">
                  <Image
                      height="24"
                      objectFit="cover"
                      src="/airstack.png"
                    />
                  <Spacer size="10" />
                  <Text color="red" decoration="underline" align="center" size="14">
                    Airstack
                  </Text>
                </Box>
                <Spacer size="16" />
                <Heading color="red" weight="900" align="center" size="32">
                  ⚠️ Error ⚠️
                </Heading>
                <Spacer size="16" />
                <Text align="center" color="tosca" size="16">
                   Uh oh, username not found!
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
// devtools(app, { serveStatic });

export const GET = handle(app)
export const POST = handle(app)
