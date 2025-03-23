import React, { useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button, Tabs } from 'antd';
import { PlayCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Define interfaces
interface CodingExercise {
  id: string;
  lessonId: string;
  language: SupportedLanguage;
  problem: string;
  hint?: string;
  solution: string;
  codeSnippet?: string;
}

enum SupportedLanguage {
  JAVA = 'java',
  PYTHON = 'python',
  JAVASCRIPT = 'javascript'
}

// Sample code snippets for each language with a main function
const codeSnippets: { [key in SupportedLanguage]: string } = {
  java: `// Complete the fooBar function
import java.util.List;
import java.util.ArrayList;

public class FooBar {
    public static List<String> fooBar(List<Integer> input) {
        List<String> result = new ArrayList<>();
        // Your code here
        
        return result;
    }

    public static void main(String[] args) {
        List<Integer> input = List.of(1, 2, 3, 4, 5);
        List<String> output = fooBar(input);
        System.out.println(output);
    }
}`,
  python: `# Complete the fooBar function
def fooBar(input):
    result = []
    # Your code here
    
    return result

if __name__ == "__main__":
    input = [1, 2, 3, 4, 5]
    output = fooBar(input)
    print(output)`,
  javascript: `// Complete the fooBar function
function fooBar(input) {
    const result = [];
    // Your code here
    
    return result;
}

function main() {
    const input = [1, 2, 3, 4, 5];
    const output = fooBar(input);
    console.log(output);
}

main();`
};


const PracticeCode: React.FC = () => {

  const exerciseData: CodingExercise = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    lessonId: "lesson-123",
    language: SupportedLanguage.JAVA,
    problem: `
      <h3>Problem Description</h3>
      <p>You are given an array of integers representing a sequence of elements. Your task is to implement a function called fooBar that processes the array according to the following rules:</p>
      <ol>
        <li>If the element is divisible by 3, replace it with "Foo."</li>
        <li>If the element is divisible by 5, replace it with "Bar."</li>
        <li>If the element is divisible by both 3 and 5, replace it with "FooBar."</li>
      </ol>
      <p>Your function should return the modified array after applying these rules.</p>

      <h3>Function Signature</h3>
      <pre class="ql-syntax">std::vector<std::string> fooBar(const std::vector<int>& input);</pre>

      <h3>Input</h3>
      <p>An array of integers input (1 <= input.size() <= 1000), where each element is an integer (1 <= input[i] <= 5000).</p>

      <h3>Output</h3>
      <p>Return the modified array with the appropriate replacements.</p>
    `,
    hint: "Consider using the modulo operator (%) to check divisibility. Remember to check for FooBar condition first.",
    solution: `vector<string> fooBar(const vector<int>& input) {
      vector<string> result;
      for(int num : input) {
          if(num % 3 == 0 && num % 5 == 0)
              result.push_back("FooBar");
          else if(num % 3 == 0)
              result.push_back("Foo");
          else if(num % 5 == 0)
              result.push_back("Bar");
          else
              result.push_back(to_string(num));
      }
      return result;
    }`,
    codeSnippet: codeSnippets[SupportedLanguage.JAVA]
  };

  const [code, setCode] = useState<string>(exerciseData.codeSnippet || '// Write your code here');
  const [language, setLanguage] = useState<SupportedLanguage>(exerciseData.language);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isError, setIsError] = useState<boolean>(false); // New state to track error
  const [hasWarnings, setHasWarnings] = useState<boolean>(false); // New state to track warnings
  const [isTruncated, setIsTruncated] = useState<boolean>(false); // New state to track truncated output

  const handleLanguageChange = (value: SupportedLanguage) => {
    setLanguage(value);
    setCode(codeSnippets[value]);
  };

  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setIsError(false);
      setHasWarnings(false);
      setIsTruncated(false);
      setOutput('');
      
      const response = await axios.post('http://localhost:3000/api/compile', {
        language: language.toLowerCase(),
        code: code
      });

      const { success, output, error, warnings, truncated } = response.data;

      if (success) {
        setOutput(`Code execution successful!\n${output}`);
        setIsError(false);
        
        if (truncated) {
          setIsTruncated(true);
          setOutput(prev => `${prev}\n\n[Output was truncated due to size limits]`);
        }
      } else {
        if (warnings && warnings.length > 0) {
          setHasWarnings(true);
          setOutput(`Compilation warnings:\n${warnings.join('\n')}\n\n${error || ''}`);
        } else {
          setIsError(true);
          setOutput(`Execution failed\n${error || 'Unknown error occurred'}`);
          
          if (truncated) {
            setIsTruncated(true);
            setOutput(prev => `${prev}\n\n[Output was truncated due to size limits]`);
          }
        }
      }
    } catch (error) {
      setIsError(true);
      setOutput('Execution failed\nError: Unable to reach the server. Please try again later.');
    } finally {
      setIsRunning(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a1321] font-bold"> {/* Apply bold styling */}
      <Header />
      <div className="container">
        <div className="grid grid-cols-12 gap-4">
          {/* Main Content - Problem Description and Code Editor */}
          <div className="mt-4 px-4 col-span-12 lg:col-span-12 rounded-xl border border-zinc-700/50 min-h-screen bg-[#14202e]"> {/* Updated background */}
            <div className="grid grid-cols-12 gap-4">
              {/* Problem Description */}
              <div className="col-span-12 lg:col-span-6 p-6 bg-[#14202e]"> {/* Updated background */}
                <Button
                type='none'
                  className="bg-[#29324a] mb-4 uppercase text-[#fff] text-xs font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
                  onClick={() => navigate(-1)}
                >
                  <svg width="8" height="22" viewBox="0 0 13 22" fill="none" className="fill-current mr-2.5 shrink-0">
                    <rect x="0.428223" y="8.95117" width="4.16918" height="4.16918"></rect>
                    <rect x="4.59717" y="4.7832" width="4.16918" height="4.16918"></rect>
                    <rect x="8.7666" y="0.613281" width="4.16918" height="4.16918"></rect>
                    <rect x="8.7666" y="17.29" width="4.16918" height="4.16918"></rect>
                    <rect x="4.59717" y="13.1211" width="4.16918" height="4.16918"></rect>
                  </svg>
                  Back to Lessons
                </Button>
                <h1 className="text-[#bad9fc] text-3xl font-bold mb-4 uppercase">
                  New in Laravel: Disable Lazy Loading
                </h1>

                <Tabs
                  defaultActiveKey="description"
                  className="[&_.ant-tabs-nav]:px-6 [&_.ant-tabs-nav]:py-2 [&_.ant-tabs-tab]:p-2 [&_.ant-tabs-tab]:mr-6 [&_.ant-tabs-tab]:text-sm [&_.ant-tabs-tab]:font-medium [&_.ant-tabs-tab]:text-gray-400 [&_.ant-tabs-tab:hover]:text-white [&_.ant-tabs-tab-active]:text-blue-400 [&_.ant-tabs-ink-bar]:bg-blue-500"
                  items={[
                    {
                      key: 'description',
                      label: 'Description',
                      children: (
                        <div className="px-6 pb-6 bg-[#14202e]"> {/* Updated background */}
                          <ReactQuill
                            value={exerciseData.problem}
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
                        </div>
                      ),
                    },
                    {
                      key: 'hint',
                      label: 'Hint',
                      children: (
                        <div className="px-6 pb-6 text-[#fff] font-medium">
                          <p>{exerciseData.hint}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'solution',
                      label: 'Solution',
                      children: (
                        <div className="px-6 pb-6 bg-[#14202e]"> {/* Updated background */}
                          <p className="text-[#ffff] font-medium mb-4">Here's one possible solution approach:</p>
                          <div className="bg-[#0e1721]/50 rounded-xl border border-white/[0.08] overflow-hidden">
                            <MonacoEditor
                              height="350px"
                              language={language}
                              value={exerciseData.solution.trim()}
                              theme="mytheme"
                              options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 15,
                                fontFamily: "'Jetbrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                                lineNumbers: 'on',
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 10, bottom: 10 },
                                lineHeight: 1.5,
                                folding: true,
                                scrollbar: {
                                  useShadows: false,
                                  verticalHasArrows: false,
                                  horizontalHasArrows: false,
                                  vertical: 'visible',
                                  horizontal: 'visible',
                                  verticalScrollbarSize: 10,
                                  horizontalScrollbarSize: 10,
                                },
                              }}
                            />
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'submissions',
                      label: 'Submissions',
                      children: (
                        <div className="px-6 pb-6 text-[#ffff] font-medium"> {/* Updated background */}
                          <p>No submissions yet.</p>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              {/* Code Editor */}
              <div className="col-span-12 lg:col-span-6 space-y-4 p-6 bg-[#14202e]"> {/* Updated background */}
                <div className="flex justify-between items-center p-4 rounded-none border border-blue-500 border-opacity-15">
                  <Button
                  type='none'
                    className="bg-[#29324a] uppercase text-[#fff] text-xs font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
                  >
                    {language}
                  </Button>
                  <div className="flex gap-3">
                    <Button
                    type='none'
                      icon={isRunning ? <LoadingOutlined /> : <PlayCircleOutlined />}
                      onClick={handleRunCode}
                      disabled={isRunning || isSubmitting}
                      className={`bg-[#29324a] text-[#fff] text-xs font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#29324a] disabled:hover:border-transparent`}
                    >
                      {isRunning ? 'Running...' : 'Run Code'}
                    </Button>
                    <Button
                      type="none"
                      onClick={handleSubmit}
                      disabled={isRunning || isSubmitting}
                      className={`bg-[#29324a] text-[#fff] text-xs font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#29324a] disabled:hover:border-transparent`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </div>
                </div>

                <div className="border border-blue-500 border-opacity-15">
                  <Editor
                    height="450px"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
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
                          { token: "comment", foreground: "#5a7082", fontStyle: "italic" },
                          { token: "keyword", foreground: "#81a1c1", fontStyle: "bold" },
                          { token: "string", foreground: "#a3be8c" },
                          { token: "number", foreground: "#b48ead" },
                          { token: "function", foreground: "#88c0d0" },
                          { token: "variable", foreground: "#d8dee9" },
                          { token: "type", foreground: "#8fbcbb" },
                          { token: "operator", foreground: "#81a1c1" },
                          { token: "constant", foreground: "#d08770" },
                          { token: "class", foreground: "#ebcb8b" },
                          { token: "interface", foreground: "#8fbcbb", fontStyle: "italic" },
                          { token: "string.escape", foreground: "#bf616a" },
                        ],
                      });

                      monaco.editor.setTheme("mytheme");

                      editor.updateOptions({
                        fontFamily: "'Jetbrains Mono', 'Fira Code', 'Cascadia Code', monospace",
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
                          bottom: 10
                        },
                        scrollbar: {
                          useShadows: false,
                          verticalHasArrows: false,
                          horizontalHasArrows: false,
                          vertical: 'visible',
                          horizontal: 'visible',
                          verticalScrollbarSize: 10,
                          horizontalScrollbarSize: 10,
                        },
                      });
                    }}
                  />

                  <div className={`bg-[#0e1721] rounded-none border border-blue-500 border-opacity-15 p-4 ${isError ? 'text-red-500' : hasWarnings ? 'text-yellow-500' : 'text-zinc-300'}`}>
                    <pre className="p-4 font-mono font-bold text-sm h-[200px] overflow-auto">
                      {output || 'Run your code to see the output here...'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeCode;