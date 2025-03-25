import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button, Tabs, message } from 'antd';
import { PlayCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import practiceCodeService, { CompileResult, CodingExercise, SupportedLanguage as ApiLanguage } from '../../services/practice-code.service';

enum LocalLanguage {
  JAVA = 'java',
  PYTHON = 'python',
  JAVASCRIPT = 'javascript'
}

interface ApiResponse {
  success?: boolean;
  data?: CodingExercise;
  id?: string;
  language?: string;
  problem?: string;
}

const convertApiLanguageToLocal = (apiLanguage: ApiLanguage | string | undefined): LocalLanguage => {
  if (!apiLanguage) return LocalLanguage.JAVASCRIPT;

  const langUpperCase = typeof apiLanguage === 'string' ? apiLanguage.toUpperCase() : apiLanguage;

  if (langUpperCase === ApiLanguage.JAVA) return LocalLanguage.JAVA;
  if (langUpperCase === ApiLanguage.PYTHON) return LocalLanguage.PYTHON;
  if (langUpperCase === ApiLanguage.JAVASCRIPT || langUpperCase === 'JAVASCRIPT') return LocalLanguage.JAVASCRIPT;

  return LocalLanguage.JAVASCRIPT;
};

const PracticeCode: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [exercise, setExercise] = useState<CodingExercise | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<LocalLanguage>(LocalLanguage.JAVA);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [hasWarnings, setHasWarnings] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExercise = async () => {
      if (!lessonId) {
        console.log('No ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching exercise with lesson ID:', lessonId);

        let exerciseData: CodingExercise;
        try {
          const apiData = await practiceCodeService.getCodingExerciseById(lessonId);
          console.log('Raw API response data:', apiData);

          if (apiData && typeof apiData === 'object') {
            if ('data' in apiData && 'success' in apiData) {
              const typedResponse = apiData as ApiResponse;
              if (typedResponse.success && typedResponse.data) {
                exerciseData = typedResponse.data;
                console.log('Using data from API response.data');
              } else {
                throw new Error('API did not return success or data property');
              }
            } else if ('id' in apiData && 'language' in apiData && 'problem' in apiData) {
              exerciseData = apiData as CodingExercise;
              console.log('Using data directly from API response');
            } else {
              throw new Error('API response does not match expected format');
            }
          } else {
            throw new Error('API response is not an object');
          }
        } catch (apiError) {
          console.error('API call failed:', apiError);
          message.error('Failed to load coding exercise');
          setLoading(false);
          return;
        }

        if (!exerciseData) {
          console.error('Exercise data is null after all attempts');
          message.error('Failed to load coding exercise - no data returned');
          setLoading(false);
          return;
        }

        exerciseData = normalizeExerciseData(exerciseData);
        console.log('Final exercise data to use:', exerciseData);

        setExercise(exerciseData);

        const localLanguage = convertApiLanguageToLocal(exerciseData.language);
        console.log('Converted language:', exerciseData.language, 'to', localLanguage);
        setLanguage(localLanguage);

        const codeToUse = exerciseData.codeSnippet || '';
        console.log('Setting code:', codeToUse ? 'Using code (first 20 chars): ' + codeToUse.substring(0, 20) : 'No code available');
        setCode(codeToUse);
      } catch (error) {
        console.error('Overall error in fetchExercise:', error);
        message.error('Failed to load coding exercise');
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [lessonId]);

  const normalizeExerciseData = (data: Partial<CodingExercise>): CodingExercise => {
    if (!data.lesson) {
      data.lesson = {
        title: 'Coding Exercise',
        description: 'Practice your coding skills',
        module: {
          title: 'Practice Module',
          course: {
            title: 'Coding Practice'
          }
        }
      };
    }

    if (!data.language) {
      data.language = ApiLanguage.JAVA;
    }

    // Make sure other required properties are present
    return {
      id: data.id || 'unknown',
      language: data.language,
      problem: data.problem || '<p>No problem description available</p>',
      hint: data.hint || 'No hints available for this exercise.',
      solution: data.solution || '// No solution available',
      codeSnippet: data.codeSnippet || '',
      lesson: data.lesson
    };
  };

  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setIsError(false);
      setHasWarnings(false);
      let showTruncated = false;
      setOutput('');

      // Extract the language value from the enum
      const apiLanguageValue = language.toLowerCase();

      const response: CompileResult = await practiceCodeService.compileAndExecuteCode(
        apiLanguageValue,
        code
      );

      const { success, output: codeOutput, error, warnings, truncated } = response;

      if (success) {
        setOutput(`Code execution successful!\n${codeOutput}`);
        setIsError(false);

        if (truncated) {
          showTruncated = true;
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
            showTruncated = true;
            setOutput(prev => `${prev}\n\n[Output was truncated due to size limits]`);
          }
        }
      }
    } catch {
      setIsError(true);
      setOutput('Execution failed\nError: Unable to reach the server. Please try again later.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
    } catch {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1321] flex items-center justify-center">
        <LoadingOutlined style={{ fontSize: 40, color: '#3b82f6' }} />
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
  const hasValidLessonStructure = exercise.lesson && typeof exercise.lesson === 'object';
  const lessonTitle = hasValidLessonStructure ? exercise.lesson.title : 'Coding Exercise';

  return (
    <div className="min-h-screen bg-[#0a1321] font-bold">
      <div className="container">
        <div className="grid grid-cols-12 gap-4">
          {/* Main Content - Problem Description and Code Editor */}
          <div className="px-4 col-span-12 lg:col-span-12 rounded-xl border border-zinc-700/50 min-h-screen bg-[#14202e]">
            <div className="grid grid-cols-12 gap-4">
              {/* Problem Description */}
              <div className="col-span-12 lg:col-span-6 p-6 bg-[#14202e]">

                <h1 className="text-[#bad9fc] text-3xl font-bold mb-4 uppercase">
                  {lessonTitle}
                </h1>

                <Tabs
                  defaultActiveKey="description"
                  className="[&_.ant-tabs-nav]:px-6 [&_.ant-tabs-nav]:py-2 [&_.ant-tabs-tab]:p-2 [&_.ant-tabs-tab]:mr-6 [&_.ant-tabs-tab]:text-sm [&_.ant-tabs-tab]:font-medium [&_.ant-tabs-tab]:text-gray-400 [&_.ant-tabs-tab:hover]:text-white [&_.ant-tabs-tab-active]:text-blue-400 [&_.ant-tabs-ink-bar]:bg-blue-500"
                  items={[
                    {
                      key: 'description',
                      label: 'Description',
                      children: (
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
                        </div>
                      ),
                    },
                    {
                      key: 'hint',
                      label: 'Hint',
                      children: (
                        <div className="px-6 pb-6 text-[#fff] font-medium">
                          <p>{exercise.hint || 'No hints available for this exercise.'}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'solution',
                      label: 'Solution',
                      children: (
                        <div className="px-6 pb-6 bg-[#14202e]">
                          <p className="text-[#ffff] font-medium mb-4">Here's one possible solution approach:</p>
                          <div className="bg-[#0e1721]/50 rounded-xl border border-white/[0.08] overflow-hidden">
                            <MonacoEditor
                              height="450px"
                              language={language}
                              value={exercise.solution.trim()}
                              theme="mytheme"
                              readOnly={true}
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
                        <div className="px-6 pb-6 text-[#ffff] font-medium">
                          <p>No submissions yet.</p>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              {/* Code Editor */}
              <div className="col-span-12 lg:col-span-6 space-y-4 p-6 bg-[#14202e]">
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
                      {isSubmitting ? 'Saving...' : 'Save'}
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