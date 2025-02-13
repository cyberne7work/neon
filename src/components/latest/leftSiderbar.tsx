import {
  Box,
  Flex,
  HStack,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ExploreIcon, NewChatIcon, SidebarIcon } from "./icons/sidebar-icons";
import { Tooltip } from "./tooltip";
import { IllustrationIcon } from "./icons/other-icons";
import { ProjectSelectMenu } from "./ProjectSelectMenu";
import useLeftSideBarStore from "./store/useLeftSideBarStore";

export const LeftSidebar = () => {
  const { leftSidebarVisible, toggleLeftSidebar } = useLeftSideBarStore();
  console.log("leftSidebarVisible: ", leftSidebarVisible);
  return (
    <Box
      bg="bg.muted"
      w={!leftSidebarVisible ? "0" : "270px"}
      overflow="hidden"
      transition="width 0.3s"
    >
      <Stack
        h="full"
        // px='3'
        py="2"
      >
        <Flex justify="space-between">
          <Tooltip
            content="Close project panel"
            positioning={{ placement: "right" }}
            showArrow
          >
            <IconButton variant="ghost">
              <SidebarIcon
                fontSize="2xl"
                color="fg.muted"
                onClick={toggleLeftSidebar}
              />
            </IconButton>
          </Tooltip>

          <Tooltip
            content="New chat"
            positioning={{ placement: "bottom" }}
            showArrow
          >
            <IconButton variant="ghost">
              <NewChatIcon fontSize="2xl" color="fg.muted" />
            </IconButton>
          </Tooltip>
        </Flex>

        <Stack px="2" gap="0" flex="1">
          <HStack
            _hover={{
              layerStyle: "fill.muted",
              textDecor: "none",
            }}
            px="1"
            h="10"
            borderRadius="lg"
            w="100%"
            // not sure if we need any if this in our code. check it later
            // whiteSpace='nowrap'
          >
            <Link href="#" variant="plain" _hover={{ textDecoration: "none" }}>
              <ExploreIcon size="sm" fontSize="md" color="fg.muted" />
              <Text fontSize="sm" fontWeight="md">
                Sound
              </Text>
            </Link>
          </HStack>
          <HStack
            _hover={{
              layerStyle: "fill.muted",
              textDecor: "none",
            }}
            px="1"
            h="10"
            borderRadius="lg"
            w="100%"
            // whiteSpace='nowrap'
          >
            <Link href="#" variant="plain" _hover={{ textDecoration: "none" }}>
              <IllustrationIcon size="sm" fontSize="md" color="fg.muted" />
              <Text fontSize="sm" fontWeight="md">
                index.html
              </Text>
            </Link>
          </HStack>
        </Stack>
        <ProjectSelectMenu />
      </Stack>
    </Box>
  );
};
