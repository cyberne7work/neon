import { useState } from "react";
import {
  Box,
  Button,
  Circle,
  Flex,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  MenuSeparator,
} from "./menu/menu";
import { ChartIcon, CheckIcon } from "./icons/other-icons";
import { UpgradeIcon } from "./icons/sidebar-icons";

const projects = [
  { id: "pac-man", name: "Pac-Man", date: "2/11/2025 13:26" },
  { id: "astroid", name: "Astroid", date: "2/01/2025 03:02" },
  { id: "donkey-kong", name: "Donkey Kong", date: "1/01/2025 19:03" },
];

interface MenuItemDetailProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  element?: React.ReactNode;
}
const MenuItemDetail = ({
  icon,
  title,
  description,
  element,
}: MenuItemDetailProps) => (
  <HStack w="260px">
    {icon && (
      <Circle size="8" bg="bg.muted">
        {icon}
      </Circle>
    )}
    <Stack gap="0" flex="1">
      <Text>{title}</Text>
      {description && (
        <Text fontSize="xs" color="fg.muted">
          {description}
        </Text>
      )}
    </Stack>
    {element && <Box>{element}</Box>}
  </HStack>
);

export const ProjectSelectMenu = () => {
  const [selectedProject, setSelectedProject] = useState(projects[0].id);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          fontWeight="bold"
          color="fg.muted"
          aria-label="Select a project"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Flex w="260px" justifyContent="space-between">
            <Flex alignItems="center" gap={2}>
              <UpgradeIcon size="sm" />
              <Text fontSize="sm">
                {projects.find((p) => p.id === selectedProject)?.name}
              </Text>
            </Flex>
            <Text
              fontSize="sm"
              transform={isOpen ? "rotate(0deg)" : "rotate(180deg)"}
              transition="transform 0.2s"
            >
              ▼
            </Text>
          </Flex>
        </Button>
      </MenuTrigger>
      <MenuContent w="260px" borderRadius="2xl">
        <MenuItem value="new-game" py="2">
          <MenuItemDetail title="New Game" icon={<ChartIcon size="sm" />} />
        </MenuItem>
        <MenuSeparator />
        {projects.map(({ id, name, date }) => (
          <MenuItem
            key={id}
            value={id}
            py="2"
            onClick={() => setSelectedProject(id)}
          >
            <MenuItemDetail
              title={name}
              description={date}
              element={selectedProject === id ? <CheckIcon size="lg" /> : null}
            />
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  );
};
