import React, { useEffect, useState } from "react";
import {
  Drawer,
  Input,
  Button,
  Collapse,
  message,
  Select,
  Form,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { PlusOutlined } from "@ant-design/icons";
import { instructorService } from "../../../../services/api";
import { RcFile } from "antd/es/upload";

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  videoDuration: number;
  lessons: {
    id: string;
    title: string;
    description: string;
    lessonType: "VIDEO" | "CODING" | "FINAL_TEST";
    video?: {
      duration: number;
    };
    isPreview: boolean;
    content?: {
      video?: {
        url: string;
      };
      coding?: {
        language: string;
        problem: string;
        solution: string;
        hint: string;
        codeSnippet: string;
      };
      finalTest?: {
        questions: Array<{
          content: string;
          order: number;
          answers: Array<{
            content: string;
            isCorrect: boolean;
          }>;
        }>;
      };
    };
  }[];
}

interface EditModuleDrawerProps {
  open: boolean;
  onClose: () => void;
  module: Module;
  onSave: (updatedModule: Module) => void;
  onDelete?: (moduleId: string) => void;
}

export type SupportedLanguage = "PYTHON" | "C" | "JAVA";

const EditModuleDrawer: React.FC<EditModuleDrawerProps> = ({
  open,
  onClose,
  module,
  onSave,
  onDelete,
}) => {
  const [editingModule, setEditingModule] = useState<Module>(module);
  const [activeLessonKeys, setActiveLessonKeys] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form] = Form.useForm();
  const [isCreateLessonModalVisible, setIsCreateLessonModalVisible] =
    useState(false);

  //Upload
  const [videoInfo, setVideoInfo] = useState<{
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
  } | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([{ ...file, originFileObj: file }]);
      return false;
    },
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
  };
  const handleUploadClick = () => {
    const file = fileList[0]?.originFileObj;
    return file ? handleUploadVideo(file) : message.error("No file found");
  };

    const handleUploadVideo = async (file: RcFile) => {
      try {
        if (!file) {
          message.error("No file selected");
          return null;
        }
        setUploading(true);
        const response = await instructorService.uploadVideo(file);
        console.log("Upload response:", response);
        if (response?.videoUrl && response?.duration) {
          setVideoInfo({
            videoUrl: response.videoUrl,
            thumbnailUrl: response.thumbnailUrl,
            duration: response.duration,
          })
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        message.error("Failed to upload video");
        return null;
      } finally {
        setUploading(false);
      }
    };
  //state editingModule sẽ được cập nhật tương ứng khi chon Module khac
  useEffect(() => {
    setEditingModule(module);
  }, [module]);

  const handleModuleChange = (field: string, value: string) => {
    setEditingModule((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLessonChange = (
    lessonIndex: number,
    field: string,
    value: string | boolean | { [key: string]: any }
  ) => {
    setEditingModule((prev) => {
      const updatedLessons = [...prev.lessons];
      updatedLessons[lessonIndex] = {
        ...updatedLessons[lessonIndex],
        [field]: value,
      };
      return {
        ...prev,
        lessons: updatedLessons,
      };
    });
  };

  const handleSave = () => {
    onSave(editingModule);
    message.success("Module updated successfully");
    onClose();
  };

  const handleConfirmDelete = () => {
    if (module.id && onDelete) {
      onDelete(module.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };



  const handleCreateLessonSubmit = async (values: any) => {
    try {
      const lessonData = {
        title: values.title,
        description: values.description,
        isPreview: values.isPreview || false,
      };

      let response;
      switch (values.lessonType) {
        case "VIDEO":
          response = await instructorService.createNewVideoLesson(
            editingModule.id,
            lessonData,
            {
              url: videoInfo?.videoUrl || "",
              thumbnailUrl: videoInfo?.thumbnailUrl || "",
              duration: videoInfo?.duration || 0,
            }
          );
          break;
        case "CODING":
          response = await instructorService.createNewCodingLesson(
            editingModule.id,
            lessonData,
            {
              language: values.language,
              problem: values.problem,
              hint: values.hint,
              solution: values.solution,
              codeSnippet: values.codeSnippet,
            }
          );
          break;
        case "FINAL_TEST":
          response = await instructorService.createNewFinalTestLesson(
            editingModule.id,
            lessonData,
            {
              passingScore: values.passingScore,
              estimatedDuration: values.estimatedDuration,
              questions: values.questions.map((q: any, index: number) => ({
                content: q.content,
                order: index + 1,
                answers: q.answers.map((a: any) => ({
                  content: a.content,
                  isCorrect: a.isCorrect,
                })),
              })),
            }
          );
          break;
        default:
          throw new Error("Invalid lesson type");
      }

      // Cập nhật state sau khi tạo lesson thành công
      setEditingModule((prev) => ({
        ...prev,
        lessons: [...prev.lessons, response],
      }));

      message.success("Lesson created successfully");
      form.resetFields();
      setActiveLessonKeys(
        activeLessonKeys.filter((key) => key !== "new-lesson")
      );
    } catch (error) {
      console.error("Error creating lesson:", error);
      message.error("Failed to create lesson");
    }
  };

  const handleDeleteLesson = async (lessonId: string, lessonIndex: number) => {
    try {
      await instructorService.deleteLesson(lessonId);

      // Cập nhật state sau khi xóa thành công
      setEditingModule((prev) => ({
        ...prev,
        lessons: prev.lessons.filter((_, index) => index !== lessonIndex),
      }));

      message.success("Lesson deleted successfully");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      message.error("Failed to delete lesson");
    }
  };

  const items = editingModule.lessons.map((lesson, index) => ({
    key: index.toString(),
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1">
          <span className="font-medium line-clamp-1 max-w-72">
            {lesson.title || `Lesson ${index + 1}`}
          </span>
          <span
            className={`text-xs text-white p-1 rounded-lg ${
              lesson.lessonType === "VIDEO"
                ? "bg-red-400"
                : lesson.lessonType === "CODING"
                ? "bg-blue-500"
                : "bg-green-500"
            }`}
          >
            {lesson.lessonType}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="flex items-center border-r pr-2 border-gray-400"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={lesson.isPreview}
              onChange={(e) =>
                handleLessonChange(index, "isPreview", e.target.checked)
              }
            />
            <span className="ml-1">Preview</span>
          </div>
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteLesson(lesson.id, index);
            }}
            className="cursor-pointer text-red-500 hover:text-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 20 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-trash"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
          </span>
        </div>
      </div>
    ),
    children: (
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Title
          </label>
          <Input
            value={lesson.title}
            onChange={(e) => handleLessonChange(index, "title", e.target.value)}
            placeholder="Enter lesson title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Input.TextArea
            value={lesson.description}
            onChange={(e) =>
              handleLessonChange(index, "description", e.target.value)
            }
            placeholder="Enter lesson description"
            rows={3}
          />
        </div>
        {lesson.lessonType === "VIDEO" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview Video
            </label>
            <div className="flex justify-center">
              <iframe src={lesson.content?.video?.url} allowFullScreen></iframe>
            </div>
          </div>
        )}
        {lesson.lessonType === "CODING" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <Select
                value={lesson.content?.coding?.language || undefined}
                onChange={(value) =>
                  handleLessonChange(index, "content", {
                    ...lesson.content,
                    coding: {
                      ...lesson.content?.coding,
                      language: value,
                    },
                  })
                }
                className="w-full"
                placeholder="Select programming language"
                options={[
                  { value: "PYTHON", label: "Python" },
                  { value: "C", label: "C" },
                  { value: "JAVA", label: "Java" },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem Description
              </label>
              <ReactQuill
                value={lesson.content?.coding?.problem || ""}
                onChange={(value) =>
                  handleLessonChange(index, "content", {
                    ...lesson.content,
                    coding: { ...lesson.content?.coding, problem: value },
                  })
                }
                className="h-32 mb-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hint
              </label>
              <Input.TextArea
                value={lesson.content?.coding?.hint || ""}
                onChange={(e) =>
                  handleLessonChange(index, "content", {
                    ...lesson.content,
                    coding: {
                      ...lesson.content?.coding,
                      hint: e.target.value,
                    },
                  })
                }
                placeholder="Enter hint for students"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Snippet
              </label>
              <Input.TextArea
                value={lesson.content?.coding?.codeSnippet || ""}
                onChange={(e) =>
                  handleLessonChange(index, "content", {
                    ...lesson.content,
                    coding: {
                      ...lesson.content?.coding,
                      codeSnippet: e.target.value,
                    },
                  })
                }
                placeholder="Enter starter code snippet"
                rows={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solution
              </label>
              <Input.TextArea
                value={lesson.content?.coding?.solution || ""}
                onChange={(e) =>
                  handleLessonChange(index, "content", {
                    ...lesson.content,
                    coding: {
                      ...lesson.content?.coding,
                      solution: e.target.value,
                    },
                  })
                }
                placeholder="Enter solution code"
                rows={5}
              />
            </div>
          </div>
        )}
        {lesson.lessonType === "FINAL_TEST" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Questions
              </label>
              <div className="space-y-4">
                {(lesson.content?.finalTest?.questions || []).map(
                  (question, qIndex) => (
                    <div key={qIndex} className="border p-4 rounded-md">
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question {qIndex + 1}
                        </label>
                        <Input.TextArea
                          value={question.content}
                          onChange={(e) => {
                            const updatedQuestions = [
                              ...(lesson.content?.finalTest?.questions || []),
                            ];
                            updatedQuestions[qIndex] = {
                              ...updatedQuestions[qIndex],
                              content: e.target.value,
                            };
                            handleLessonChange(index, "content", {
                              ...lesson.content,
                              finalTest: {
                                ...lesson.content?.finalTest,
                                questions: updatedQuestions,
                              },
                            });
                          }}
                          placeholder="Enter question text"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        {question.answers.map((answer, aIndex) => (
                          <div key={aIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={answer.isCorrect}
                              onChange={() => {
                                const updatedQuestions = [
                                  ...(lesson.content?.finalTest?.questions ||
                                    []),
                                ];
                                updatedQuestions[qIndex] = {
                                  ...updatedQuestions[qIndex],
                                  answers: updatedQuestions[qIndex].answers.map(
                                    (ans, idx) => ({
                                      ...ans,
                                      isCorrect: idx === aIndex,
                                    })
                                  ),
                                };
                                handleLessonChange(index, "content", {
                                  ...lesson.content,
                                  finalTest: {
                                    ...lesson.content?.finalTest,
                                    questions: updatedQuestions,
                                  },
                                });
                              }}
                              className="h-4 w-4 text-indigo-600"
                            />
                            <Input
                              value={answer.content}
                              onChange={(e) => {
                                const updatedQuestions = [
                                  ...(lesson.content?.finalTest?.questions ||
                                    []),
                                ];
                                updatedQuestions[qIndex] = {
                                  ...updatedQuestions[qIndex],
                                  answers: updatedQuestions[qIndex].answers.map(
                                    (ans, idx) =>
                                      idx === aIndex
                                        ? { ...ans, content: e.target.value }
                                        : ans
                                  ),
                                };
                                handleLessonChange(index, "content", {
                                  ...lesson.content,
                                  finalTest: {
                                    ...lesson.content?.finalTest,
                                    questions: updatedQuestions,
                                  },
                                });
                              }}
                              placeholder={`Answer ${aIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
                <Button
                  onClick={() => {
                    const updatedQuestions = [
                      ...(lesson.content?.finalTest?.questions || []),
                      {
                        content: "",
                        order:
                          (lesson.content?.finalTest?.questions?.length || 0) +
                          1,
                        answers: [
                          { content: "", isCorrect: true },
                          { content: "", isCorrect: false },
                          { content: "", isCorrect: false },
                          { content: "", isCorrect: false },
                        ],
                      },
                    ];
                    handleLessonChange(index, "content", {
                      ...lesson.content,
                      finalTest: {
                        ...lesson.content?.finalTest,
                        questions: updatedQuestions,
                      },
                    });
                  }}
                  className="mt-2"
                >
                  Add Question
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    ),
  }));

  // Thêm một item mới vào cuối danh sách lessons cho form tạo lesson mới
  items.push({
    key: "new-lesson",
    label: (
      <>
        <div className="flex items-center justify-between w-full">
          <div className="flex font-semibold items-center text-blue-500">
            <PlusOutlined className="mr-1" />
            <span>Add New Lesson</span>
          </div>
        </div>
      </>
    ),
    children: (
      <div className="space-y-4 p-4">
        <Form
          layout="vertical"
          form={form}
          onFinish={handleCreateLessonSubmit}
          initialValues={{
            title: "",
            description: "",
            lessonType: undefined,
            isPreview: false,
          }}
        >
          <div className="flex justify-end items-center">
            <div
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Form.Item name="isPreview" valuePropName="checked" noStyle>
                <input type="checkbox" />
              </Form.Item>
              <span className="ml-1">Preview</span>
            </div>
          </div>
          <Form.Item
            name="title"
            label="Lesson Title"
            rules={[{ required: true, message: "Please input lesson title!" }]}
          >
            <Input placeholder="Enter lesson title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please input lesson description!" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter lesson description" />
          </Form.Item>

          <Form.Item
            name="lessonType"
            label="Lesson Type"
            rules={[{ required: true, message: "Please select lesson type!" }]}
          >
            <Select placeholder="Select lesson type">
              <Select.Option value="VIDEO">Video Lesson</Select.Option>
              <Select.Option value="CODING">Coding Exercise</Select.Option>
              <Select.Option value="FINAL_TEST">Final Test</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.lessonType !== currentValues.lessonType
            }
          >
            {({ getFieldValue }) => {
              const lessonType = getFieldValue("lessonType");

              return (
                <>
                  {lessonType === "VIDEO" && (
                    <div className="py-4 space-y-3">
                      <h4 className="flex justify-center text-lg font-semibold text-gray-800">
                        Video Content
                      </h4>
                      <div className="flex flex-col items-center w-full">
                        <Upload
                          {...uploadProps}
                          accept="video/*"
                          maxCount={1}
                          className="flex flex-col items-center w-full"
                        >
                          {fileList.length === 0 && (
                            <Button className="w-32 bg-blue-500">
                              Select Video
                            </Button>
                          )}
                        </Upload>

                        {fileList.length > 0 && (
                          <Button
                            onClick={handleUploadClick}
                            loading={uploading}
                            className="mt-4 w-32 bg-blue-500"
                          >
                            {uploading ? "Uploading" : "Start Upload"}
                          </Button>
                        )}

                        {/* Form Item ẩn để lưu videoUrl */}
                        <Form.Item name="videoUrl" hidden>
                          <Input />
                        </Form.Item>
                      </div>
                    </div>
                  )}

                  {lessonType === "CODING" && (
                    <div className="space-y-4">
                      <Form.Item
                        name="language"
                        label="Programming Language"
                        initialValue="PYTHON"
                      >
                        <Select>
                          <Select.Option value="PYTHON">Python</Select.Option>
                          <Select.Option value="C">C</Select.Option>
                          <Select.Option value="JAVA">Java</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="problem"
                        label="Problem Description"
                        rules={[
                          {
                            required: true,
                            message: "Please input problem description!",
                          },
                        ]}
                      >
                        <ReactQuill className="h-32 mb-12" theme="snow" />
                      </Form.Item>

                      <Form.Item name="hint" label="Hint">
                        <Input.TextArea
                          rows={3}
                          placeholder="Enter hint for students"
                        />
                      </Form.Item>

                      <Form.Item name="codeSnippet" label="Code Snippet">
                        <Input.TextArea
                          rows={5}
                          placeholder="Enter starter code snippet"
                        />
                      </Form.Item>

                      <Form.Item
                        name="solution"
                        label="Solution"
                        rules={[
                          { required: true, message: "Please input solution!" },
                        ]}
                      >
                        <Input.TextArea
                          rows={5}
                          placeholder="Enter solution code"
                        />
                      </Form.Item>
                    </div>
                  )}

                  {lessonType === "FINAL_TEST" && (
                    <div className="space-y-4">
                      <Form.Item
                        name="estimatedDuration"
                        label="Estimated Duration (minutes)"
                      >
                        <Input type="number" className="w-32" />
                      </Form.Item>

                      <Form.List
                        name="questions"
                        initialValue={[
                          {
                            content: "",
                            order: 0,
                            answers: [
                              { content: "", isCorrect: true },
                              { content: "", isCorrect: false },
                              { content: "", isCorrect: false },
                              { content: "", isCorrect: false },
                            ],
                          },
                        ]}
                      >
                        {(fields, { add, remove }) => (
                          <div className="space-y-4">
                            {fields.map((field, index) => (
                              <div
                                key={field.key}
                                className="p-4 border rounded-md"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "content"]}
                                    label={`Question ${index + 1}`}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Missing question content",
                                      },
                                    ]}
                                    className="flex-1 mr-4"
                                  >
                                    <Input.TextArea
                                      rows={2}
                                      placeholder="Enter question..."
                                    />
                                  </Form.Item>
                                  <Button
                                    type="text"
                                    onClick={() => remove(field.name)}
                                    className="text-red-500"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M4 7h16" />
                                      <path d="M10 11v6" />
                                      <path d="M14 11v6" />
                                      <path d="M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12" />
                                      <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                                    </svg>
                                  </Button>
                                </div>

                                <Form.List name={[field.name, "answers"]}>
                                  {(
                                    answerFields,
                                    { add: addAnswer, remove: removeAnswer }
                                  ) => (
                                    <div className="ml-4 space-y-2">
                                      {answerFields.map(
                                        (answerField, answerIndex) => (
                                          <div
                                            key={answerField.key}
                                            className="flex items-center space-x-4"
                                          >
                                            <Form.Item
                                              {...answerField}
                                              name={[
                                                answerField.name,
                                                "isCorrect",
                                              ]}
                                              valuePropName="checked"
                                            >
                                              <input
                                                type="radio"
                                                className="text-indigo-600"
                                              />
                                            </Form.Item>
                                            <Form.Item
                                              {...answerField}
                                              name={[
                                                answerField.name,
                                                "content",
                                              ]}
                                              className="flex-1 mb-0"
                                            >
                                              <Input
                                                placeholder={`Answer ${
                                                  answerIndex + 1
                                                }`}
                                              />
                                            </Form.Item>
                                            <Button
                                              type="text"
                                              onClick={() =>
                                                removeAnswer(answerField.name)
                                              }
                                              className="text-red-500"
                                            >
                                              Remove
                                            </Button>
                                          </div>
                                        )
                                      )}
                                      <Button
                                        type="dashed"
                                        onClick={() => addAnswer()}
                                        className="ml-7"
                                      >
                                        + Add Answer
                                      </Button>
                                    </div>
                                  )}
                                </Form.List>
                              </div>
                            ))}
                            <Button type="dashed" onClick={() => add()} block>
                              + Add Question
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </div>
                  )}
                </>
              );
            }}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="mt-3">
              Create Lesson
            </Button>
          </Form.Item>
        </Form>
      </div>
    ),
  });

  return (
    <>
      <Drawer
        title="Edit Module"
        placement="right"
        onClose={onClose}
        open={open}
        width={720}
        extra={
          <Button className="font-semibold" type="primary" onClick={handleSave}>
            Save Changes
          </Button>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Title
            </label>
            <Input
              value={editingModule.title}
              onChange={(e) => handleModuleChange("title", e.target.value)}
              placeholder="Enter module title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Input.TextArea
              value={editingModule.description}
              onChange={(e) =>
                handleModuleChange("description", e.target.value)
              }
              placeholder="Enter module description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lessons
            </label>
            <Collapse
              items={items}
              activeKey={activeLessonKeys}
              onChange={setActiveLessonKeys}
            />
          </div>
        </div>
      </Drawer>

      {/* Custom Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Module</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this module? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditModuleDrawer;
