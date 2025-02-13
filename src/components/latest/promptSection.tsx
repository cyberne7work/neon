import {
  Center,
  Heading,
  HStack,
  IconButton,
  Input,
  VStack,
  Button,
  Span,
  Box,
} from "@chakra-ui/react";
import {
  BirthdayIcon,
  BulbIcon,
  ChartIcon,
  CodeIcon,
  EnterIcon,
  IllustrationIcon,
} from "./icons/other-icons";
import { useState, useRef, useEffect } from "react";

type PromptType = "game" | "image" | "sound" | "imageAssets" | "soundAssets";
type ExtraFeaturesType = "checkErrors" | "generateSound" | "enhance" | "";

interface PromptButtonProps {
  icon?: React.ReactElement;
  description?: string;
  type: PromptType;
  isActive: boolean;
  px?: number; // Added px prop
  py?: number; // Added py prop
  onClick: (type: PromptType) => void;
}

interface ExtraFeaturesButtonProps {
  icon?: React.ReactElement;
  description?: string;
  type: ExtraFeaturesType;
  onClick: (type: ExtraFeaturesType) => void;
}

const PromptButton = (props: PromptButtonProps) => {
  const { icon, description, type, isActive, onClick, px = 4, py = 2 } = props; // Default padding values
  return (
    <Button
      color={isActive ? "white" : "fg.muted"}
      variant={isActive ? "solid" : "outline"}
      borderRadius="full"
      bg={isActive ? "blue.500" : "transparent"}
      _hover={{
        bg: isActive ? "blue.600" : "bg.subtle",
        transform: "scale(1.02)",
        transition: "all 0.3s ease-in-out",
      }}
      onClick={() => onClick(type)}
      px={px}
      py={py}
    >
      {icon}
      <Span color={isActive ? "white" : "fg.subtle"}>{description}</Span>
    </Button>
  );
};

const ExtraFeaturesButton = (props: ExtraFeaturesButtonProps) => {
  const { icon, description, type, onClick } = props;
  return (
    <Button
      borderRadius="full"
      color="white"
      variant="outline"
      bg="transparent"
      borderColor="whiteAlpha.400"
      _hover={{
        transform: "scale(1.02)",
        transition: "all 0.3s ease-in-out",
      }}
      onClick={() => onClick(type)}
    >
      {icon}
      <Span color="fg.subtle">{description}</Span>
    </Button>
  );
};

export const PromptSection = () => {
  const [inputValue, setInputValue] = useState("");
  const [activePrompt, setActivePrompt] = useState<PromptType>("game");
  const [isKeyboardFocus, setIsKeyboardFocus] = useState(false);
  const [loggedPrompts, setLoggedPrompts] = useState<string[]>([]); // New state to log prompts
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.type === "focus" && !isMouseDownRef.current) {
      setIsKeyboardFocus(true);
    }
  };

  const handleMouseDown = () => {
    isMouseDownRef.current = true;
    setIsKeyboardFocus(false);
  };

  const handleBlur = () => {
    setIsKeyboardFocus(false);
    isMouseDownRef.current = false;
  };

  const handleExtraFeatures = (type: ExtraFeaturesType) => {
    switch (type) {
      case "checkErrors":
        console.log("checkErrors");
        break;
      case "generateSound":
        console.log("generateSound");
        break;
      case "enhance":
        console.log("enhance");
        break;
      default:
        break;
    }
  };

  const handleSend = () => {
    if (inputValue.trim() !== "") {
      // Log the prompt when the send button is clicked
      setLoggedPrompts((prevPrompts) => [
        ...prevPrompts,
        `${activePrompt}: ${inputValue}`,
      ]);
      setInputValue(""); // Clear the input after logging
    }
  };

  // Ref to track if the mouse is down
  const isMouseDownRef = useRef(false);

  useEffect(() => {
    // Log to console whenever loggedPrompts changes
    console.log("Logged Prompts:", loggedPrompts);
  }, [loggedPrompts]);

  return (
    <Center flex="1">
      <VStack spacing={6}>
        <Heading size="3xl">What can I help you with?</Heading>

        <Box bg="bg.muted" minW="768px" p="4" borderRadius="3xl">
          <VStack spacing={1}>
            <Input
              ref={inputRef}
              placeholder="Describe your game idea..."
              size="lg"
              variant="subtle"
              value={inputValue}
              onChange={handleInputValue}
              pl="0"
              onFocus={handleFocus}
              onMouseDown={handleMouseDown}
              onBlur={handleBlur}
              border={isKeyboardFocus ? "1px solid" : "none"}
              borderColor={isKeyboardFocus ? "green.500" : "transparent"}
              _focus={{
                border: isKeyboardFocus ? "1px solid" : "none",
                borderColor: isKeyboardFocus ? "white" : "transparent",
                boxShadow: isKeyboardFocus ? "0 0 0 1px white" : "none",
                outline: "none",
              }}
            />
            <HStack justify="space-between" width="full">
              <HStack gap="8" w="100%">
                <PromptButton
                  type="game"
                  icon={
                    <CodeIcon
                      size="lg"
                      color={activePrompt === "game" ? "white" : "yellow.500"}
                    />
                  }
                  description="Game"
                  isActive={activePrompt === "game"}
                  onClick={setActivePrompt}
                />
                <PromptButton
                  type="image"
                  icon={
                    <IllustrationIcon
                      size="md"
                      color={activePrompt === "image" ? "white" : "green.500"}
                    />
                  }
                  description="Image"
                  isActive={activePrompt === "image"}
                  onClick={setActivePrompt}
                />
                <PromptButton
                  type="sound"
                  icon={
                    <ChartIcon
                      size="md"
                      color={activePrompt === "sound" ? "white" : "cyan.500"}
                    />
                  }
                  description="Sound"
                  isActive={activePrompt === "sound"}
                  onClick={setActivePrompt}
                />
              </HStack>
              <IconButton
                fontSize="2xl"
                size="sm"
                borderRadius="full"
                disabled={inputValue.trim() === ""}
                px={4}
                py={2}
                onClick={handleSend} // Add onClick handler to send button
              >
                <EnterIcon size="2xl" />
              </IconButton>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Center>
  );
};
