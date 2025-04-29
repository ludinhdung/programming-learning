import { useEffect, useState } from "react";
import { 
  Container, 
  Title, 
  Button, 
  Group, 
  Text, 
  Loader, 
  Center, 
  Accordion, 
  Stack, 
  Box, 
  Paper, 
  Image, 
  Grid, 
  Badge, 
  Divider 
} from "@mantine/core";
import { useParams, useNavigate } from "react-router-dom";
import { IconCheck, IconX, IconVideo, IconCode, IconQuestionMark } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { formatVND } from "../../../utils/formatCurrency";
import courseVerification from "../../../services/courseVerification.service";
import { courseVerificationService } from "../../../services/api";

/**
 * Interface definition for an answer
 */
interface Answer {
  content: string;
  isCorrect: boolean;
}

/**
 * Interface definition for a question
 */
interface Question {
  content: string;
  order: number;
  answers: Answer[];
}

/**
 * Interface definition for a module
 */
interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  videoDuration: number;
  lessons: Lesson[];
}

/**
 * Interface definition for a lesson
 */
interface Lesson {
  id: string;
  title: string;
  description: string;
  lessonType: "VIDEO" | "CODING" | "FINAL_TEST";
  isPreview: boolean;
  video?: {
    id: string;
    lessonId: string;
    url: string;
    thumbnailUrl: string | null;
    duration: number;
  };
  coding?: {
    id: string;
    lessonId: string;
    language: string;
    problem: string;
    hint: string;
    solution: string;
    codeSnippet: string;
  };
  finalTest?: {
    questions: Question[];
  };
}

/**
 * Interface definition for a course
 */
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  duration: number;
  isPublished: boolean;
  createdAt: string;
  CourseTopic: {
    topic: {
      id: string;
      name: string;
      thumbnail: string;
      description: string;
    };
  }[];
  modules: Module[];
  _count: {
    EnrolledCourse: number;
  };
}

/**
 * Component to display course details for verification
 */
const CourseVerificationDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [publishing, setPublishing] = useState<boolean>(false);

  /**
   * Get detailed course information
   */
  useEffect(() => {
    const fetchCourseDetail = async (): Promise<void> => {
      try {
        setLoading(true);
        if (!courseId) {
          throw new Error("Course ID required");
        }
        const response = await courseVerificationService.getCoursebyCourseId(
          courseId
        );
        console.log(response);
        
        setCourse(response);
      } catch (error) {
        console.error("Error fetching course information:", error);
        notifications.show({
          title: "Error",
          message: "Unable to load course details",
          color: "red"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  /**
   * Handle course publishing
   */
  const handlePublishCourse = async (): Promise<void> => {
    try {
      setPublishing(true);
      if (!courseId) {
        throw new Error("Course ID required");
      }
      
      const id = notifications.show({
        loading: true,
        title: "Đang xử lý",
        message: course?.isPublished ? "Đang hủy xuất bản khóa học..." : "Đang xuất bản khóa học...",
        autoClose: false,
        withCloseButton: false,
      });
      
      await courseVerification.toggleCoursePublishStatus(courseId);
      
      notifications.update({
        id,
        color: "green",
        title: "Thành công",
        message: course?.isPublished ? "Đã hủy xuất bản khóa học!" : "Đã xuất bản khóa học thành công!",
        icon: <IconCheck size="1.1rem" />,
        autoClose: 3000,
      });
      
      setTimeout(() => {
        navigate("/instructor-lead/verify-courses");
      }, 2000);
    } catch (error) {
      console.error("Error publishing course:", error);
      notifications.show({
        title: "Lỗi",
        message: course?.isPublished ? "Không thể hủy xuất bản khóa học" : "Không thể xuất bản khóa học",
        color: "red"
      });
    } finally {
      setPublishing(false);
    }
  };

  /**
   * Display loading state
   */
  if (loading) {
    return (
      <Center style={{ width: '100%', height: '70vh' }}>
        <Stack align="center" gap="md">
          <Loader size="xl" />
          <Text>Loading course information...</Text>
        </Stack>
      </Center>
    );
  }

  /**
   * Display message if course not found
   */
  if (!course) {
    return (
      <Center style={{ width: '100%', height: '70vh' }}>
        <Stack align="center" gap="md">
          <IconX size={48} color="red" />
          <Text size="xl" fw={700}>Course not found</Text>
          <Button onClick={() => navigate("/instructor-lead/verify-courses")}>
            Back to List
          </Button>
        </Stack>
      </Center>
    );
  }

  /**
   * Display course details
   */
  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Course Verification</Title>
        <Button
          color="green"
          onClick={handlePublishCourse}
          loading={publishing}
          leftSection={<IconCheck size={16} />}
        >
          Publish Course
        </Button>
      </Group>

      <Paper shadow="xs" p="md" withBorder mb="xl">
        <Title order={3} mb="md">Course Information</Title>
        
        <Grid>
          <Grid.Col span={3}>
            <Image
              src={course.thumbnail}
              alt={course.title}
              radius="md"
              fallbackSrc="https://placehold.co/200x120?text=No+Image"
            />
          </Grid.Col>
          
          <Grid.Col span={9}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Title order={4}>{course.title}</Title>
                <Badge 
                  color={course.isPublished ? "green" : "yellow"}
                  size="lg"
                >
                  {course.isPublished ? "Published" : "Pending Approval"}
                </Badge>
              </Group>
              
              <Text>
                <Text span fw={600}>Topic: </Text>
                {course.CourseTopic?.[0]?.topic.name || "No topic"}
              </Text>
              
              <Text>
                <Text span fw={600}>Price: </Text>
                {formatVND(course.price)}
              </Text>
              
              <Text>
                <Text span fw={600}>Description: </Text>
                {course.description}
              </Text>
              
              <Text size="sm" c="dimmed">
                Created at: {new Date(course.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      <Title order={3} mb="md">Course Content</Title>
      
      <Accordion variant="separated" mb="xl">
        {course.modules.map((module, moduleIndex) => (
          <Accordion.Item key={module.id} value={module.id}>
            <Accordion.Control>
              <Group>
                <Text fw={600}>Module {moduleIndex + 1}: {module.title}</Text>
                <Badge>{module.lessons.length} lessons</Badge>
              </Group>
            </Accordion.Control>
            
            <Accordion.Panel>
              <Text mb="md">{module.description}</Text>
              
              <Stack gap="md">
                {module.lessons.map((lesson, lessonIndex) => (
                  <Paper key={lesson.id} p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Group>
                        <Text fw={600}>
                          {lessonIndex + 1}. {lesson.title}
                        </Text>
                        {lesson.isPreview && (
                          <Badge color="blue">Preview</Badge>
                        )}
                      </Group>
                      
                      <Badge
                        color={
                          lesson.lessonType === "VIDEO"
                            ? "green"
                            : lesson.lessonType === "CODING"
                            ? "blue"
                            : "orange"
                        }
                        leftSection={
                          lesson.lessonType === "VIDEO" ? (
                            <IconVideo size={14} />
                          ) : lesson.lessonType === "CODING" ? (
                            <IconCode size={14} />
                          ) : (
                            <IconQuestionMark size={14} />
                          )
                        }
                      >
                        {lesson.lessonType === "VIDEO"
                          ? "Video"
                          : lesson.lessonType === "CODING"
                          ? "Coding Exercise"
                          : "Final Test"}
                      </Badge>
                    </Group>
                    
                    <Text size="sm" mb="md">
                      {lesson.description}
                    </Text>
                    
                    {lesson.lessonType === "VIDEO" && lesson.video && (
                      <Box mb="md">
                        <Text size="sm" fw={600}>Thông tin video:</Text>
                        <Text size="sm">Thời lượng: {Math.floor(lesson.video.duration / 60)} phút {lesson.video.duration % 60} giây</Text>
                        <Text size="sm">URL: {lesson.video.url}</Text>
                        {lesson.video.thumbnailUrl && (
                          <Text size="sm">Thumbnail URL: {lesson.video.thumbnailUrl}</Text>
                        )}
                        <Box mt="md" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                          <iframe 
                            src={lesson.video.url} 
                            allowFullScreen 
                            style={{ width: '100%', height: '300px', border: 'none' }}
                          ></iframe>
                        </Box>
                      </Box>
                    )}
                    
                    {lesson.lessonType === "CODING" && lesson.coding && (
                      <Box mb="md">
                        <Text size="sm" fw={600}>Thông tin bài tập lập trình:</Text>
                        <Text size="sm">Ngôn ngữ: {lesson.coding.language}</Text>
                        <Divider my="xs" />
                        <Text size="sm" fw={600}>Đề bài:</Text>
                        <Text size="sm">{lesson.coding.problem}</Text>
                        <Divider my="xs" />
                        <Text size="sm" fw={600}>Gợi ý:</Text>
                        <Text size="sm">{lesson.coding.hint || 'Không có gợi ý'}</Text>
                        <Divider my="xs" />
                        <Text size="sm" fw={600}>Giải pháp:</Text>
                        <Box p="xs" bg="#f5f5f5" style={{ borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                          <Text size="sm" style={{ fontFamily: 'monospace' }}>{lesson.coding.solution}</Text>
                        </Box>
                        <Divider my="xs" />
                        <Text size="sm" fw={600}>Mã mẫu:</Text>
                        <Box p="xs" bg="#f5f5f5" style={{ borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                          <Text size="sm" style={{ fontFamily: 'monospace' }}>{lesson.coding.codeSnippet}</Text>
                        </Box>
                      </Box>
                    )}
                    
                    {lesson.lessonType === "FINAL_TEST" && lesson.finalTest && (
                      <Box>
                        <Text size="sm" fw={600} mb="xs">
                          Câu hỏi kiểm tra ({lesson.finalTest.questions.length}):
                        </Text>
                        
                        <Stack gap="md">
                          {lesson.finalTest.questions.map((question, qIndex) => (
                            <Paper key={qIndex} p="sm" withBorder>
                              <Text size="sm" fw={600}>
                                Câu hỏi {qIndex + 1}: {question.content}
                              </Text>
                              <Text size="xs" c="dimmed" mb="xs">Thứ tự: {question.order}</Text>
                              
                              <Text size="sm" fw={600} mt="xs">Các đáp án:</Text>
                              <Stack gap="xs" ml="md" mt="xs">
                                {question.answers.map((answer, aIndex) => (
                                  <Group key={aIndex} gap="xs">
                                    <Box
                                      style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        backgroundColor: answer.isCorrect 
                                          ? '#2F9E44' 
                                          : '#CED4DA'
                                      }}
                                    />
                                    <Text size="sm">{answer.content}</Text>
                                    {answer.isCorrect && (
                                      <Badge color="green" size="xs">Đáp án đúng</Badge>
                                    )}
                                  </Group>
                                ))}
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
      
      <Group justify="center" mt="xl">
        <Button
          color={course?.isPublished ? "red" : "green"}
          size="lg"
          onClick={handlePublishCourse}
          loading={publishing}
          leftSection={course?.isPublished ? <IconX size={18} /> : <IconCheck size={18} />}
        >
          {course?.isPublished ? "Hủy xuất bản khóa học" : "Xuất bản khóa học"}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate("/instructor-lead/verify-courses")}
        >
          Quay lại danh sách
        </Button>
      </Group>
    </Container>
  );
};

export default CourseVerificationDetail;
