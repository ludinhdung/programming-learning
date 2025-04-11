import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, message, Input, Spin, Tooltip } from "antd";
import { ButtonType } from "antd/lib/button";
import {
  PlayCircleOutlined,
  LoadingOutlined,
  RobotOutlined,
  UserOutlined,
  SendOutlined,
  MessageOutlined,
  CloseOutlined,
  UpOutlined,
  DownOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import practiceCodeService, {
  CompileResult,
  CodingExercise,
  SupportedLanguage as ApiLanguage,
} from "../../services/practice-code.service";
import styled from "styled-components";
import chatGPTService from "../../services/chatgpt.service";
import DOMPurify from "dompurify";
import SolutionCompareModal from "../../components/SolutionCompareModal";

enum LocalLanguage {
  JAVA = "java",
  PYTHON = "python",
  JAVASCRIPT = "javascript",
}

interface ApiResponse {
  success?: boolean;
  data?: CodingExercise;
  id?: string;
  language?: string;
  problem?: string;
}

const convertApiLanguageToLocal = (
  apiLanguage: ApiLanguage | string | undefined
): LocalLanguage => {
  if (!apiLanguage) return LocalLanguage.JAVASCRIPT;

  const langUpperCase =
    typeof apiLanguage === "string" ? apiLanguage.toUpperCase() : apiLanguage;

  if (langUpperCase === ApiLanguage.JAVA) return LocalLanguage.JAVA;
  if (langUpperCase === ApiLanguage.PYTHON) return LocalLanguage.PYTHON;
  if (
    langUpperCase === ApiLanguage.JAVASCRIPT ||
    langUpperCase === "JAVASCRIPT"
  )
    return LocalLanguage.JAVASCRIPT;

  return LocalLanguage.JAVASCRIPT;
};

const ChatboxContainer = styled.div<{
  isCollapsed: boolean;
  isHidden: boolean;
}>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: ${(props) => (props.isCollapsed ? "60px" : "600px")};
  height: ${(props) => (props.isCollapsed ? "60px" : "600px")};
  background: #14202e;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  transform: translateX(
    ${(props) => (props.isHidden ? "calc(100% + 20px)" : "0")}
  );
  opacity: ${(props) => (props.isHidden ? 0 : 1)};
  pointer-events: ${(props) => (props.isHidden ? "none" : "auto")};
`;

const FloatingChatButton = styled(Button)<{ $isHidden: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background: #1b55ac;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 999;
  transform: ${(props) => (props.$isHidden ? "scale(1)" : "scale(0)")};
  opacity: ${(props) => (props.$isHidden ? 1 : 0)};
  pointer-events: ${(props) => (props.$isHidden ? "auto" : "none")};

  &:hover {
    background: #1c2e48;
    transform: ${(props) => (props.$isHidden ? "scale(1.1)" : "scale(0)")};
  }

  .anticon {
    font-size: 24px;
  }
`;

const SuggestedQuestions = styled.div`
  padding: 8px 16px;
  background: #1c2936;
  border-top: 1px solid #29334a;
`;

const QuestionChip = styled.button`
  background: #29334a;
  color: #d8e3ee;
  border: none;
  border-radius: 16px;
  padding: 6px 12px;
  margin: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1b55ac;
    color: white;
  }
`;

const ChatHeader = styled.div`
  padding: 12px 16px;
  background: #1b55ac;
  color: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderControls = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled(Button)`
  color: white;
  background: #e11d48;
  border: none;
  padding: 4px 8px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #be123c;
    color: white;
  }

  .anticon {
    font-size: 14px;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1c2936;
  }

  &::-webkit-scrollbar-thumb {
    background: #29334a;
    border-radius: 3px;
  }
`;

const MessageContent = styled.div`
  width: 100%;
  font-size: 14px;
  line-height: 1.5;
  color: #d8e3ee;

  .message-text {
    white-space: pre-wrap;
    font-family: inherit;
  }

  pre {
    background: #0e1721;
    color: #d8dee9;
    padding: 12px;
    border-radius: 6px;
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    margin: 12px 0;
    white-space: pre;
    overflow-x: auto;
    position: relative;
  }

  pre code {
    font-family: "JetBrains Mono", monospace;
    background: transparent;
    padding: 0;
    color: inherit;
  }

  code {
    font-family: "JetBrains Mono", monospace;
    background: #0e1721;
    padding: 2px 4px;
    border-radius: 4px;
    color: #d8dee9;
  }

  strong {
    color: #88c0d0;
    font-weight: 600;
  }

  br {
    content: "";
    display: block;
    margin: 4px 0;
  }

  ul,
  ol {
    margin: 8px 0;
    padding-left: 24px;
    list-style-position: outside;
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  li {
    margin: 6px 0;
    padding-left: 4px;
    line-height: 1.6;

    &::marker {
      color: #88c0d0;
    }
  }

  p {
    margin: 8px 0;
    line-height: 1.6;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: #88c0d0;
    margin: 16px 0 8px 0;
    font-weight: 600;
    line-height: 1.4;
  }

  h1 {
    font-size: 1.5em;
  }
  h2 {
    font-size: 1.3em;
  }
  h3 {
    font-size: 1.2em;
  }
  h4 {
    font-size: 1.1em;
  }
  h5,
  h6 {
    font-size: 1em;
  }

  // Language label for code blocks
  pre::before {
    content: attr(data-language);
    position: absolute;
    top: 0;
    right: 0;
    padding: 4px 8px;
    font-size: 11px;
    font-family: inherit;
    color: #88c0d0;
    background: #1c2936;
    border-bottom-left-radius: 4px;
    border-top-right-radius: 6px;
    opacity: 0.8;
  }
`;

const MessageBubble = styled.div<{ isUser?: boolean }>`
  max-width: 90%;
  padding: 12px;
  border-radius: 12px;
  ${(props) =>
    props.isUser
      ? `
    background: #1b55ac;
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  `
      : `
    background: #1c2936;
    color: #d8e3ee;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  `}
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const ChatInput = styled.div`
  padding: 16px;
  background: #1c2936;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  display: flex;
  gap: 8px;
`;

const UnreadBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e11d48;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExplainButton = styled.div<{ visible: boolean; x: number; y: number }>`
  position: fixed;
  display: ${(props) => (props.visible ? "flex" : "none")};
  left: ${(props) => props.x}px;
  top: ${(props) => props.y}px;
  background: #1b55ac;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  transform-origin: left center;
  animation: popIn 0.2s ease-out;

  @keyframes popIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  &:hover {
    background: #1c2e48;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .anticon {
    font-size: 14px;
  }
`;

// Add new styled component for console header
const ConsoleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #1c2936;
  border-bottom: 1px solid rgba(27, 85, 172, 0.15);
  font-size: 13px;
  color: #81a1c1;

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Add new styled components for resize handle
const ResizeHandle = styled.div`
  width: 100%;
  height: 4px;
  background: #1c2936;
  cursor: ns-resize;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    background: #1b55ac;
    height: 2px;
  }

  &:active {
    background: #1b55ac;
    height: 6px;
  }

  &::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 2px;
    background: currentColor;
    opacity: 0.5;
    transition: all 0.2s ease;
  }

  &:hover::before {
    opacity: 1;
    width: 50px;
  }

  &:active::before {
    opacity: 1;
    width: 50px;
  }
`;

const ConsoleContainer = styled.div<{ height: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${(props) => props.height}px;
  background: #0e1721;
  border: 1px solid rgba(27, 85, 172, 0.15);
  display: flex;
  flex-direction: column;
  transform-origin: bottom;
  will-change: transform, height;
  backface-visibility: hidden;
  transform: translateZ(0);
  z-index: 10;
`;

const EditorContainer = styled.div`
  position: relative;
  border: 1px solid rgba(27, 85, 172, 0.15);
  height: 600px;
  overflow: hidden;
`;

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  code?: string;
}

interface PracticeCodeProps {
  lessonId?: string;
}

const PracticeCode: React.FC<PracticeCodeProps> = ({ lessonId }) => {
  const [exercise, setExercise] = useState<CodingExercise | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<LocalLanguage>(LocalLanguage.JAVA);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [hasWarnings, setHasWarnings] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatHidden, setIsChatHidden] = useState(true);
  const [explainButtonState, setExplainButtonState] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedCode: "",
  });
  const [consoleHeight, setConsoleHeight] = useState(250);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const lastFrameRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [isHintVisible, setIsHintVisible] = useState(false);

  const suggestedQuestions = [
    "Can you explain this problem?",
    "What's the best approach to solve this?",
    "Help me debug my code",
    "Give me a hint",
    "Show me similar problems",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isCollapsed && messages.length > 0) {
      setUnreadCount(0);
    }
  }, [isCollapsed, messages]);

  useEffect(() => {
    if (isCollapsed && messages.length > 0) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages]);

  const renderMessage = (content: string, isUser: boolean) => {
    if (isUser) {
      // Check if the message contains code block
      const codeBlockMatch = content.match(/```(\w+)\n([\s\S]*?)```/);
      if (codeBlockMatch) {
        const [fullMatch, language, code] = codeBlockMatch;
        const beforeCode = content.slice(0, content.indexOf(fullMatch));
        const afterCode = content.slice(
          content.indexOf(fullMatch) + fullMatch.length
        );

        return (
          <div className="message-text">
            {beforeCode && <p>{beforeCode}</p>}
            <pre data-language={language}>
              <code>{code.trim()}</code>
            </pre>
            {afterCode && <p>{afterCode}</p>}
          </div>
        );
      }
      return <span className="message-text">{content}</span>;
    }

    // Sanitize HTML content
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "div",
        "p",
        "br",
        "strong",
        "pre",
        "code",
        "ul",
        "ol",
        "li",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ],
      ALLOWED_ATTR: ["class", "data-language"],
    });

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = sanitizedContent;

    // Process code blocks
    const codeBlocks = tempDiv.getElementsByTagName("pre");
    Array.from(codeBlocks).forEach((block) => {
      // Extract language from markdown code block
      const codeContent = block.textContent || "";
      const languageMatch = codeContent.match(/^```(\w+)\n([\s\S]*?)\n```$/);

      if (languageMatch) {
        const [, language, code] = languageMatch;
        block.setAttribute("data-language", language);
        block.innerHTML = `<code>${code.trim()}</code>`;
      } else {
        block.innerHTML = `<code>${codeContent}</code>`;
      }
    });

    return <div dangerouslySetInnerHTML={{ __html: tempDiv.innerHTML }} />;
  };

  const handleExplainCode = () => {
    setIsChatHidden(false);
    setIsCollapsed(false);
    const formattedMessage = `Can you explain this code and provide suggestions for improvement:

    \`\`\`${language.toLowerCase()}
    ${explainButtonState.selectedCode.trim()}
    \`\`\``;

    handleSendMessage(formattedMessage);
    setExplainButtonState((prev) => ({ ...prev, visible: false }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = consoleHeight;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const now = performance.now();
        // Limit to 60fps
        if (now - lastFrameRef.current < 16) {
          return;
        }
        lastFrameRef.current = now;

        const editorContainer = document
          .querySelector(".monaco-editor")
          ?.getBoundingClientRect();
        if (!editorContainer) return;

        const distanceFromBottom = editorContainer.bottom - e.clientY;
        const targetHeight = Math.max(150, Math.min(450, distanceFromBottom));

        // Smooth interpolation
        const currentHeight = consoleHeight;
        const diff = targetHeight - currentHeight;
        const smoothing = 0.3; // Increased smoothing factor
        const newHeight = currentHeight + diff * smoothing;

        setConsoleHeight(Math.round(newHeight)); // Round to avoid sub-pixel rendering
      });
    },
    [consoleHeight]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleReplaceSolution = async (newCode: string) => {
    setIsReplacing(true);
    // Add a small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 800));
    setCode(newCode);
    setIsReplacing(false);
  };

  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setIsError(false);
      setHasWarnings(false);
      setOutput("");
      setRunCount((prev) => prev + 1);

      const apiLanguageValue = language.toLowerCase();

      const response: CompileResult =
        await practiceCodeService.compileAndExecuteCode(apiLanguageValue, code);

      const {
        success,
        output: codeOutput,
        error,
        warnings,
        truncated,
      } = response;

      if (success) {
        let finalOutput = `Code execution successful!\n${codeOutput}`;
        if (truncated) {
          finalOutput += "\n\n[Output was truncated due to size limits]";
        }
        setOutput(finalOutput);
        setIsError(false);
      } else {
        if (warnings && warnings.length > 0) {
          setHasWarnings(true);
          setOutput(
            `Compilation warnings:\n${warnings.join("\n")}\n\n${error || ""}`
          );
        } else {
          setIsError(true);
          let finalOutput = `Execution failed\n${
            error || "Unknown error occurred"
          }`;
          if (truncated) {
            finalOutput += "\n\n[Output was truncated due to size limits]";
          }
          setOutput(finalOutput);
        }
      }
    } catch (err) {
      console.error("Execution error:", err);
      setIsError(true);
      setOutput(
        "Execution failed\nError: Unable to reach the server. Please try again later."
      );
    } finally {
      setIsRunning(false);
    }
  };

  const generateAIResponse = async (question: string): Promise<string> => {
    try {
      const context = {
        problem: exercise?.problem,
        language,
        currentCode: code,
        hint: exercise?.hint,
      };

      return await chatGPTService.generateResponse(context, question);
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I'm having trouble connecting to my AI service. Please try again later.";
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text || inputMessage;
    if (!messageToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      const aiResponse = await generateAIResponse(messageToSend);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
        setShowSuggestions(true);
      }, 1000);
    } catch (err) {
      console.error("Failed to get AI response:", err);
      message.error("Failed to get AI response");
      setIsTyping(false);
      setShowSuggestions(true);
    }
  };

  useEffect(() => {
    const fetchExercise = async () => {
      if (!lessonId) {
        console.log("No lesson ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching exercise with lesson ID:", lessonId);

        let exerciseData: CodingExercise;
        try {
          const apiData = await practiceCodeService.getCodingExerciseById(
            lessonId
          );
          console.log("Raw API response data:", apiData);

          if (apiData && typeof apiData === "object") {
            if ("data" in apiData && "success" in apiData) {
              const typedResponse = apiData as ApiResponse;
              if (typedResponse.success && typedResponse.data) {
                exerciseData = typedResponse.data;
                console.log("Using data from API response.data");
              } else {
                throw new Error("API did not return success or data property");
              }
            } else if (
              "id" in apiData &&
              "language" in apiData &&
              "problem" in apiData
            ) {
              exerciseData = apiData as CodingExercise;
              console.log("Using data directly from API response");
            } else {
              throw new Error("API response does not match expected format");
            }
          } else {
            throw new Error("API response is not an object");
          }
        } catch (apiError) {
          console.error("API call failed:", apiError);
          message.error("Failed to load coding exercise");
          setLoading(false);
          return;
        }

        if (!exerciseData) {
          console.error("Exercise data is null after all attempts");
          message.error("Failed to load coding exercise - no data returned");
          setLoading(false);
          return;
        }

        exerciseData = normalizeExerciseData(exerciseData);
        console.log("Final exercise data to use:", exerciseData);

        setExercise(exerciseData);

        const localLanguage = convertApiLanguageToLocal(exerciseData.language);
        console.log(
          "Converted language:",
          exerciseData.language,
          "to",
          localLanguage
        );
        setLanguage(localLanguage);

        const codeToUse = exerciseData.codeSnippet || "";
        console.log(
          "Setting code:",
          codeToUse
            ? "Using code (first 20 chars): " + codeToUse.substring(0, 20)
            : "No code available"
        );
        setCode(codeToUse);
      } catch (error) {
        console.error("Overall error in fetchExercise:", error);
        message.error("Failed to load coding exercise");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [lessonId]);

  const normalizeExerciseData = (
    data: Partial<CodingExercise>
  ): CodingExercise => {
    if (!data.lesson) {
      data.lesson = {
        title: "Coding Exercise",
        description: "Practice your coding skills",
        module: {
          title: "Practice Module",
          course: {
            title: "Coding Practice",
          },
        },
      };
    }

    if (!data.language) {
      data.language = ApiLanguage.JAVA;
    }

    // Make sure other required properties are present
    return {
      id: data.id || "unknown",
      language: data.language,
      problem: data.problem || "<p>No problem description available</p>",
      hint: data.hint || "No hints available for this exercise.",
      solution: data.solution || "// No solution available",
      codeSnippet: data.codeSnippet || "",
      lesson: data.lesson,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1321] flex items-center justify-center">
        <LoadingOutlined style={{ fontSize: 40, color: "#3b82f6" }} />
        <span className="ml-4 text-white text-xl">Loading exercise...</span>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-[#0a1321] flex items-center justify-center flex-col">
        <h2 className="text-white text-2xl mb-4">Exercise not found</h2>
      </div>
    );
  }

  // Check if lesson structure is intact before rendering
  const hasValidLessonStructure =
    exercise.lesson && typeof exercise.lesson === "object";
  const lessonTitle = hasValidLessonStructure
    ? exercise.lesson.title
    : "Coding Exercise";

  const buttonType: ButtonType = "default";

  return (
    <div className="min-h-screen bg-[#0a1321] font-bold">
      <div className="w-full">
        <div className="grid grid-cols-12 gap-4">
          {/* Main Content - Problem Description and Code Editor */}
          <div className="px-4 col-span-12 lg:col-span-12 rounded-xl border border-zinc-700/50 min-h-screen bg-[#14202e]">
            <div className="grid grid-cols-12 gap-4">
              {/* Problem Description */}
              <div className="col-span-12 lg:col-span-6 p-6 bg-[#14202e]">
                <h1 className="text-[#bad9fc] text-3xl font-bold mb-4 uppercase p-4 border-b-2 border-[#gray]">
                  {lessonTitle}
                </h1>
                <div className="px-6 pb-6 bg-[#14202e]">
                  <ReactQuill
                    value={exercise.problem}
                    readOnly={true}
                    theme="snow"
                    modules={{ toolbar: false }}
                    className="font-medium border-0 [&_.ql-container]:border-0 [&_.ql-container]:font-inherit [&_.ql-editor]:p-0 [&_.ql-editor]:text-zinc-300
                      [&_.ql-editor_h3]:text-white [&_.ql-editor_h3]:text-lg [&_.ql-editor_h3]:font-medium [&_.ql-editor_h3]:my-6
                      [&_.ql-editor_p]:text-zinc-300 [&_.ql-editor_p]:mb-4 [&_.ql-editor_p]:leading-relaxed
                      [&_.ql-editor_ol]:text-zinc-300 [&_.ql-editor_ol]:pl-6 [&_.ql-editor_ol]:mb-4
                      [&_.ql-editor_li]:text-zinc-300 [&_.ql-editor_li]:mb-2
                      [&_.ql-editor_pre.ql-syntax]:bg-[#0e1721] [&_.ql-editor_pre.ql-syntax]:text-zinc-300 [&_.ql-editor_pre.ql-syntax]:p-4 [&_.ql-editor_pre.ql-syntax]:rounded-lg [&_.ql-editor_pre.ql-syntax]:font-mono [&_.ql-editor_pre.ql-syntax]:my-4"
                  />

                  <div className="mt-4 border-l-4 border-blue-500 pl-4">
                    <button
                      onClick={() => setIsHintVisible(!isHintVisible)}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                    >
                      {isHintVisible ? <UpOutlined /> : <DownOutlined />}
                      {isHintVisible ? "Hide Hint" : "Show Hint"}
                    </button>
                    {isHintVisible && (
                      <div className="mt-2 text-gray-300">
                        {exercise.hint ||
                          "No hints available for this exercise."}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Code Editor */}
              <div className="col-span-12 lg:col-span-6 space-y-4 p-6 bg-[#14202e]">
                <div className="flex justify-between items-center p-4 rounded-none border border-blue-500 border-opacity-15">
                  <Button
                    type={buttonType}
                    className="bg-[#29324a] uppercase text-[#fff] text-xs font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
                  >
                    {language}
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      type={buttonType}
                      icon={
                        isRunning ? <LoadingOutlined /> : <PlayCircleOutlined />
                      }
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className={`bg-[#29324a] text-[#fff] text-xs font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#29324a] disabled:hover:border-transparent`}
                    >
                      {isRunning ? "Running..." : "Run Code"}
                    </Button>
                    {runCount >= 3 && (
                      <Button
                        type={buttonType}
                        icon={<EyeOutlined />}
                        onClick={() => setIsSolutionModalOpen(true)}
                        className={`bg-[#29324a] text-[#fff] text-xs font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]`}
                      >
                        View Solution
                      </Button>
                    )}
                  </div>
                </div>

                <div className="border border-blue-500 border-opacity-15">
                  <EditorContainer>
                    {isReplacing && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(10, 19, 33, 0.7)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 20,
                        }}
                      >
                        <LoadingOutlined
                          style={{ fontSize: 40, color: "#3b82f6" }}
                        />
                      </div>
                    )}
                    <Editor
                      height="100%"
                      language={language}
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      theme="mytheme"
                      onMount={(editor, monaco) => {
                        monaco.editor.defineTheme("mytheme", {
                          base: "vs-dark",
                          inherit: true,
                          colors: {
                            "editor.background": "#0e1721",
                            "editor.foreground": "#d8dee9",
                            "editor.lineHighlightBackground": "#1d2b3a",
                            "editor.lineHighlightBorder": "#283e52",
                            "editorCursor.foreground": "#82aaff",
                            "editor.selectionBackground": "#1f4b7d",
                            "editor.selectionHighlightBackground": "#1f4b7d77",
                            "editor.inactiveSelectionBackground": "#1f4b7d55",
                            "editorLineNumber.foreground": "#4c566a",
                            "editorLineNumber.activeForeground": "#88c0d0",
                            "editorGutter.background": "#0b131b",
                            "editorSuggestWidget.background": "#1c2e48",
                            "editorSuggestWidget.border": "#375a7f",
                            "editorSuggestWidget.foreground": "#d8dee9",
                            "editorSuggestWidget.selectedBackground": "#375a7f",
                            "editorWidget.background": "#1c2e48",
                            "editorWidget.border": "#375a7f",
                          },
                          rules: [
                            {
                              token: "comment",
                              foreground: "#5a7082",
                              fontStyle: "italic",
                            },
                            {
                              token: "keyword",
                              foreground: "#81a1c1",
                              fontStyle: "bold",
                            },
                            { token: "string", foreground: "#a3be8c" },
                            { token: "number", foreground: "#b48ead" },
                            { token: "function", foreground: "#88c0d0" },
                            { token: "variable", foreground: "#d8dee9" },
                            { token: "type", foreground: "#8fbcbb" },
                            { token: "operator", foreground: "#81a1c1" },
                            { token: "constant", foreground: "#d08770" },
                            { token: "class", foreground: "#ebcb8b" },
                            {
                              token: "interface",
                              foreground: "#8fbcbb",
                              fontStyle: "italic",
                            },
                            { token: "string.escape", foreground: "#bf616a" },
                          ],
                        });

                        monaco.editor.setTheme("mytheme");

                        // Add selection change listener
                        editor.onDidChangeCursorSelection(() => {
                          const selection = editor.getSelection();
                          if (selection && !selection.isEmpty()) {
                            const selectedText =
                              editor.getModel()?.getValueInRange(selection) ||
                              "";
                            if (selectedText.trim()) {
                              const editorContainer = editor.getDomNode();
                              if (editorContainer) {
                                const containerRect =
                                  editorContainer.getBoundingClientRect();
                                const selectionStartPos =
                                  editor.getScrolledVisiblePosition(
                                    selection.getStartPosition()
                                  );

                                if (selectionStartPos) {
                                  // Add delay before showing the button
                                  setTimeout(() => {
                                    setExplainButtonState({
                                      visible: true,
                                      x:
                                        containerRect.left +
                                        selectionStartPos.left +
                                        10,
                                      y:
                                        containerRect.top +
                                        selectionStartPos.top -
                                        40,
                                      selectedCode: selectedText,
                                    });
                                  }, 300); // 300ms delay
                                }
                              }
                            }
                          } else {
                            setExplainButtonState((prev) => ({
                              ...prev,
                              visible: false,
                            }));
                          }
                        });

                        // Add mouse down listener to hide button when clicking outside
                        document.addEventListener("mousedown", (e) => {
                          if (explainButtonState.visible) {
                            const target = e.target as HTMLElement;
                            if (!target.closest(".explain-button")) {
                              setExplainButtonState((prev) => ({
                                ...prev,
                                visible: false,
                              }));
                            }
                          }
                        });

                        editor.updateOptions({
                          fontFamily:
                            "'Jetbrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                          fontSize: 15,
                          lineHeight: 1.5,
                          minimap: {
                            enabled: true,
                            maxColumn: 80,
                            renderCharacters: false,
                            scale: 1,
                          },
                          cursorBlinking: "smooth",
                          cursorSmoothCaretAnimation: "on",
                          smoothScrolling: true,
                          scrollBeyondLastLine: false,
                          padding: {
                            top: 10,
                            bottom: 10,
                          },
                          scrollbar: {
                            useShadows: false,
                            verticalHasArrows: false,
                            horizontalHasArrows: false,
                            vertical: "visible",
                            horizontal: "visible",
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10,
                          },
                        });
                      }}
                    />

                    <ConsoleContainer height={consoleHeight}>
                      <ResizeHandle onMouseDown={handleMouseDown} />
                      <ConsoleHeader>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.75 8.75L11.25 12L7.75 15.25"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13.75 15.25H16.25"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3.75 5.75C3.75 4.64543 4.64543 3.75 5.75 3.75H18.25C19.3546 3.75 20.25 4.64543 20.25 5.75V18.25C20.25 19.3546 19.3546 20.25 18.25 20.25H5.75C4.64543 20.25 3.75 19.3546 3.75 18.25V5.75Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Console Output
                      </ConsoleHeader>
                      <div
                        className={`flex-1 p-4 ${
                          isError
                            ? "text-red-500"
                            : hasWarnings
                            ? "text-yellow-500"
                            : "text-zinc-300"
                        }`}
                      >
                        <pre className="h-full overflow-auto font-mono font-bold text-sm p-4">
                          {output || "Run your code to see the output here..."}
                        </pre>
                      </div>
                    </ConsoleContainer>
                  </EditorContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingChatButton
        $isHidden={isChatHidden}
        type="primary"
        onClick={() => {
          setIsChatHidden(false);
          setIsCollapsed(false);
          setUnreadCount(0);
        }}
        icon={<MessageOutlined />}
      >
        {unreadCount > 0 && <UnreadBadge>{unreadCount}</UnreadBadge>}
      </FloatingChatButton>

      <ChatboxContainer isCollapsed={isCollapsed} isHidden={isChatHidden}>
        {!isCollapsed && (
          <>
            <ChatHeader>
              <HeaderTitle>
                <RobotOutlined />
                <span>AI Assistant</span>
              </HeaderTitle>
              <HeaderControls>
                <Tooltip title={showSuggestions ? "Ẩn gợi ý" : "Hiện gợi ý"}>
                  <Button
                    type="text"
                    size="small"
                    icon={showSuggestions ? <UpOutlined /> : <DownOutlined />}
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    style={{ color: "white" }}
                  />
                </Tooltip>
                <CloseButton
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setIsChatHidden(true);
                    setIsCollapsed(true);
                  }}
                />
              </HeaderControls>
            </ChatHeader>

            <ChatMessages>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} isUser={msg.isUser}>
                  {msg.isUser ? <UserOutlined /> : <RobotOutlined />}
                  <MessageContent>
                    {renderMessage(msg.content, msg.isUser)}
                  </MessageContent>
                </MessageBubble>
              ))}
              {isTyping && (
                <MessageBubble>
                  <RobotOutlined />
                  <Spin size="small" />
                </MessageBubble>
              )}
              <div ref={messagesEndRef} />
            </ChatMessages>

            {showSuggestions && messages.length === 0 && (
              <SuggestedQuestions>
                {suggestedQuestions.map((q, i) => (
                  <QuestionChip key={i} onClick={() => handleSendMessage(q)}>
                    {q}
                  </QuestionChip>
                ))}
              </SuggestedQuestions>
            )}

            <ChatInput>
              <Input
                placeholder="Ask me anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onPressEnter={() => handleSendMessage()}
                style={{
                  background: "#29334a",
                  border: "none",
                  color: "white",
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => handleSendMessage()}
                style={{ background: "#1b55ac" }}
              />
            </ChatInput>
          </>
        )}
      </ChatboxContainer>

      <ExplainButton
        visible={explainButtonState.visible}
        x={explainButtonState.x}
        y={explainButtonState.y}
        onClick={handleExplainCode}
      >
        <RobotOutlined />
        Explain Code
      </ExplainButton>

      <SolutionCompareModal
        isOpen={isSolutionModalOpen}
        onClose={() => setIsSolutionModalOpen(false)}
        currentCode={code}
        solutionCode={exercise?.solution || ""}
        language={language.toLowerCase()}
        onReplaceSolution={handleReplaceSolution}
      />
    </div>
  );
};

export default PracticeCode;
