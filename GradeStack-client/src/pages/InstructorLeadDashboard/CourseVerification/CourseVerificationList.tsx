import { useState, useEffect } from "react";
import { 
  Text, 
  Badge, 
  Button, 
  Loader, 
  Group, 
  Stack, 
  Image, 
  Title, 
  Container, 
  Grid, 
  Flex, 
  Box, 
  Paper
} from "@mantine/core";
import { Link } from "react-router-dom";
import { 
  IconClock, 
  IconVideo, 
  IconCheck, 
  IconX, 
  IconInfoCircle 
} from "@tabler/icons-react";
import { formatVND } from "../../../utils/formatCurrency";
import { notifications } from "@mantine/notifications";
import courseVerificationService from "../../../services/courseVerification.service";
import { formatDuration } from "../../../utils/formatDuration";

/**
 * Interface definition for a lesson
 */
interface Lesson {
  id: string;
  title: string;
  lessonType?: string;
  duration?: number;
  video?: {
    duration: number;
  };
  finalTest?: {
    estimatedDuration: number;
  };
}

/**
 * Interface definition for a module
 */
interface Module {
  id: string;
  title: string;
  videoDuration?: number;
  lessons: Lesson[];
}

/**
 * Interface definition for a course
 */
interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  isPublished: boolean;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  modules: Module[];
  _count: {
    students: number;
    modules: number;
    lessons: number;
  };
}

/**
 * Calculate the total duration of a course
 * @param course Course to calculate duration for
 * @returns Total duration in seconds
 */
const calculateCourseDuration = (course: Course): number => {
  let totalDurationInSeconds = 0;

  if (course.modules && course.modules.length > 0) {
    course.modules.forEach((module) => {
      // Add module video duration if available
      if (module.videoDuration) {
        totalDurationInSeconds += module.videoDuration;
      }

      // Add duration from lessons
      if (module.lessons && module.lessons.length > 0) {
        module.lessons.forEach((lesson) => {
          if (lesson.lessonType === "VIDEO" && lesson.video) {
            totalDurationInSeconds += lesson.video.duration || 0;
          } else if (lesson.lessonType === "FINAL_TEST" && lesson.finalTest) {
            totalDurationInSeconds +=
              (lesson.finalTest.estimatedDuration || 0) * 60;
          } else {
            totalDurationInSeconds += lesson.duration || 0;
          }
        });
      }
    });
  }

  return totalDurationInSeconds;
};

/**
 * Component to display the list of courses that need verification
 */
const CourseVerificationList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Get the list of unpublished courses
   */
  const fetchCourses = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await courseVerificationService.getUnpublishedCourses();
      console.log("Course list:", data);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching course list:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể tải danh sách khóa học",
        color: "red"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /**
   * Handle publishing or unpublishing a course
   * @param courseId ID of the course
   * @param isCurrentlyPublished Current publishing status
   */
  const handlePublishToggle = async (
    courseId: string,
    isCurrentlyPublished: boolean
  ): Promise<void> => {
    try {
      // Display notification based on current status
      const loadingMessage = isCurrentlyPublished
        ? "Đang hủy xuất bản khóa học..."
        : "Đang xuất bản khóa học và gửi email thông báo...";

      const id = notifications.show({
        loading: true,
        title: "Đang xử lý",
        message: loadingMessage,
        autoClose: false,
        withCloseButton: false,
      });

      await courseVerificationService.toggleCoursePublishStatus(courseId);

      // Show success notification
      const successMessage = isCurrentlyPublished
        ? "Đã hủy xuất bản khóa học thành công"
        : "Đã xuất bản khóa học và gửi email thông báo thành công";

      notifications.update({
        id,
        color: "green",
        title: "Thành công",
        message: successMessage,
        icon: <IconCheck size="1.1rem" />,
        autoClose: 3000,
      });

      fetchCourses();
    } catch (error) {
      console.error("Error changing course status:", error);
      notifications.show({
        title: "Lỗi",
        message: isCurrentlyPublished 
          ? "Không thể hủy xuất bản khóa học" 
          : "Không thể xuất bản khóa học",
        color: "red"
      });
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Flex justify="center" align="center" h="70vh">
          <Loader size="xl" />
        </Flex>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="lg">Course Verification</Title>
      <Text mb="xl" c="dimmed">List of courses waiting for verification and approval before publishing</Text>

      <Stack gap="md">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Link 
              key={course.id} 
              to={`/instructor-lead/verify-courses/${course.id}`}
              style={{ textDecoration: 'none' }}
            >
              <Paper 
                shadow="sm" 
                p="md" 
                withBorder 
                style={{
                  backgroundColor: '#1A1B1E',
                  '&:hover': {
                    backgroundColor: '#25262B',
                  },
                }}
              >
                <Grid>
                  <Grid.Col span={2}>
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      height={120}
                      radius="md"
                      fallbackSrc="https://placehold.co/200x120?text=No+Image"
                    />
                  </Grid.Col>
                  <Grid.Col span={10}>
                    <Flex justify="space-between" align="flex-start">
                      <Box>
                        <Group gap="xs" mb="xs">
                          <Text fw={700} size="lg">{course.title}</Text>
                          <Badge 
                            color={course.isPublished ? "green" : "yellow"}
                            variant="light"
                            size="lg"
                          >
                            {course.isPublished ? "Đã xuất bản" : "Chờ duyệt"}
                          </Badge>
                        </Group>
                        
                        <Text lineClamp={2} size="sm" mb="md" c="dimmed">
                          {course.description}
                        </Text>

                        <Group gap="md">
                          <Group gap="xs">
                            <IconClock size={16} />
                            <Text size="sm">
                              {formatDuration(calculateCourseDuration(course))}
                            </Text>
                          </Group>
                          
                          <Group gap="xs">
                            <IconVideo size={16} />
                            <Text size="sm">
                              {course.modules?.reduce(
                                (total, module) => total + module.lessons.length,
                                0
                              ) || 0}{" "}
                              bài học
                            </Text>
                          </Group>
                          
                          <Badge color="blue" variant="light">
                            {formatVND(course.price)}
                          </Badge>
                        </Group>
                      </Box>

                      <Box>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePublishToggle(course.id, course.isPublished);
                          }}
                          variant="light"
                          color={course.isPublished ? "red" : "green"}
                          leftSection={
                            course.isPublished ? (
                              <IconX size={16} />
                            ) : (
                              <IconCheck size={16} />
                            )
                          }
                          mb="md"
                        >
                          {course.isPublished ? "Hủy xuất bản" : "Xuất bản"}
                        </Button>
                        <Text size="xs" c="dimmed">
                          Cập nhật lần cuối:{" "}
                          {new Date(course.updatedAt).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Text>
                      </Box>
                    </Flex>
                  </Grid.Col>
                </Grid>
              </Paper>
            </Link>
          ))
        ) : (
          <Paper p="xl" withBorder ta="center">
            <IconInfoCircle size={48} color="gray" style={{ margin: '0 auto 16px' }} />
            <Title order={3} mb="sm">Không có khóa học nào đang chờ xác minh</Title>
            <Text c="dimmed">Tất cả các khóa học đã được xác minh và phê duyệt</Text>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};

export default CourseVerificationList;
