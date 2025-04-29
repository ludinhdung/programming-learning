import { FC, useEffect, useState } from 'react';
import { Typography, Spin, Empty, Card, Button, message, Tag } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import workshopService from '../../services/workshopService';
import { Workshop } from '../../services/workshopService';
import { format } from 'date-fns';

const { Title, Text } = Typography;

/**
 * Component to display the list of workshops registered by the user
 */
const UserWorkshops: FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Get the list of registered workshops when the component is mounted
   */
  useEffect(() => {
    fetchRegisteredWorkshops();
  }, []);

  /**
   * Get the list of registered workshops from API
   */
  const fetchRegisteredWorkshops = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await workshopService.getUserRegisteredWorkshops();
      setWorkshops(data);
    } catch (error) {
      console.error('Error when fetching registered workshops:', error);
      message.error('Unable to get the list of registered workshops');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel workshop registration
   * @param workshopId - ID of the workshop
   */
  const handleCancelRegistration = async (workshopId: string): Promise<void> => {
    try {
      await workshopService.cancelWorkshopRegistration(workshopId);
      message.success('Workshop registration cancelled successfully');
      // Update the workshop list
      setWorkshops(workshops.filter(workshop => workshop.id !== workshopId));
    } catch (error) {
      console.error('Error when cancelling workshop registration:', error);
      message.error('Unable to cancel workshop registration');
    }
  };

  /**
   * Check if the workshop has already taken place
   * @param scheduledAt - Time of the workshop
   * @returns true if the workshop has already taken place, false otherwise
   */
  const isWorkshopPassed = (scheduledAt: string): boolean => {
    const workshopDate = new Date(scheduledAt);
    const now = new Date();
    return workshopDate < now;
  };

  /**
   * Format the workshop time
   * @param scheduledAt - Time of the workshop
   * @returns Formatted time string
   */
  const formatScheduledAt = (scheduledAt: string): string => {
    try {
      return format(new Date(scheduledAt), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return scheduledAt;
    }
  };

  /**
   * Format workshop duration
   * @param duration - Workshop duration in minutes
   * @returns Formatted duration string
   */
  const formatDuration = (duration: number): string => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-[#0a1321]">
      <Header />
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="mb-8">
          <Title level={2} style={{ color: 'white', marginBottom: '24px' }}>
            Registered Workshops
          </Title>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : workshops.length === 0 ? (
            <Empty
              description={
                <Text style={{ color: '#94a3b8' }}>
                  You haven't registered for any workshops yet
                </Text>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="space-y-6">
              {workshops.map((workshop) => {
                const isPassed = isWorkshopPassed(workshop.scheduledAt);
                
                return (
                  <Card
                    key={workshop.id}
                    className="bg-[#13151f] border-[#1e2736] hover:border-[#3b82f6] transition-colors"
                    style={{ borderRadius: '8px' }}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {workshop.thumbnail && (
                        <div className="w-full md:w-1/4">
                          <img
                            src={workshop.thumbnail}
                            alt={workshop.title}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <Title level={4} style={{ color: 'white', marginBottom: '8px' }}>
                            {workshop.title}
                          </Title>
                          {isPassed ? (
                            <Tag color="red">Ended</Tag>
                          ) : (
                            <Tag color="green">Upcoming</Tag>
                          )}
                        </div>
                        
                        <Text style={{ color: '#94a3b8', marginBottom: '16px', display: 'block' }}>
                          {workshop.description}
                        </Text>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                          <div className="flex items-center">
                            <CalendarOutlined style={{ color: '#3b82f6', marginRight: '8px' }} />
                            <Text style={{ color: '#e2e8f0' }}>
                              {formatScheduledAt(workshop.scheduledAt)}
                            </Text>
                          </div>
                          <div className="flex items-center">
                            <ClockCircleOutlined style={{ color: '#3b82f6', marginRight: '8px' }} />
                            <Text style={{ color: '#e2e8f0' }}>
                              {formatDuration(workshop.duration)}
                            </Text>
                          </div>
                          <div className="flex items-center">
                            <UserOutlined style={{ color: '#3b82f6', marginRight: '8px' }} />
                            <Text style={{ color: '#e2e8f0' }}>
                              {workshop.instructor?.user.firstName} {workshop.instructor?.user.lastName}
                            </Text>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          {workshop.meetUrl && !isPassed && (
                            <Button
                              type="primary"
                              icon={<VideoCameraOutlined />}
                              href={workshop.meetUrl}
                              target="_blank"
                            >
                              Join Session
                            </Button>
                          )}
                          
                          {!isPassed && (
                            <Button
                              danger
                              onClick={() => handleCancelRegistration(workshop.id)}
                            >
                              Cancel Registration
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserWorkshops;
