import { Flex, IconButton, Text } from "@chakra-ui/react";
import { NewChatIcon, SidebarIcon } from "./icons/sidebar-icons";
import { Tooltip } from "./tooltip";
import { Avatar } from "./icons/avatar";
import useLeftSideBarStore from "./store/useLeftSideBarStore";

export const TopSection = () => {
  const { leftSidebarVisible, toggleLeftSidebar } = useLeftSideBarStore();

  return (
    <Flex justify="space-between" align="center" p="2">
      {!leftSidebarVisible && (
        <Flex align="center" gap="2">
          <Flex gap="0">
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
          <Text textStyle="lg" fontWeight="semibold">
            Pac-Man
          </Text>
        </Flex>
      )}
      {leftSidebarVisible && (
        <Text textStyle="lg" fontWeight="semibold">
          Pac-Man
        </Text>
      )}

      <Avatar
        name="Mr Anderson"
        size="xs"
        colorPalette="teal"
        variant="solid"
      />
    </Flex>
  );
};
