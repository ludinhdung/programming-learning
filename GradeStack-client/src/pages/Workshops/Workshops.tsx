import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Grid, 
  Card, 
  Image, 
  Badge, 
  Button, 
  Group, 
  Stack,
  Skeleton,
  Pagination,
  Center,
  Box,
  Paper,
  Divider,
  rem
} from '@mantine/core';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { IconCalendar, IconClock, IconUser } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import workshopService, { Workshop } from '../../services/workshopService';
import Header from '../../components/Header/Header';

/**
 * Styles for the Workshops page
 */
const classes = {
  wrapper: {
    backgroundColor: '#0f1117',
    minHeight: '100vh',
    paddingTop: '2rem',
    paddingBottom: '2rem',
    color: 'white'
  },
  title: {
    color: 'white',
    fontWeight: 700
  },
  subtitle: {
    color: '#a1a1aa'
  },
  card: {
    backgroundColor: '#1a1b26',
    border: '1px solid #2e2e3c',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      borderColor: '#3b82f6'
    }
  },
  cardTitle: {
    color: 'white'
  },
  cardText: {
    color: '#a1a1aa'
  },
  button: {
    backgroundColor: '#3b82f6',
    '&:hover': {
      backgroundColor: '#2563eb'
    }
  },
  pagination: {
    control: {
      color: 'white',
      borderColor: '#2e2e3c',
      '&[data-active]': {
        backgroundColor: '#3b82f6'
      }
    }
  }
};

/**
 * Page displaying the list of public workshops
 */
const Workshops: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [registering, setRegistering] = useState<string | null>(null); // ID of workshop being registered
  const [registeredWorkshops, setRegisteredWorkshops] = useState<string[]>([]); // List of IDs of registered workshops
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false); // User login status
  const navigate = useNavigate(); // Used to navigate to login page if needed
  const ITEMS_PER_PAGE = 9;

  /**
   * Get workshop list from API
   */
  const fetchWorkshops = async (page: number = 1): Promise<void> => {
    try {
      setLoading(true);
      const response = await workshopService.getPublicWorkshops(page, ITEMS_PER_PAGE);
      setWorkshops(response.data);
      setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check login status and get list of registered workshops
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUserLoggedIn(true);
      fetchRegisteredWorkshops();
    } else {
      setUserLoggedIn(false);
      setRegisteredWorkshops([]);
    }
  }, []);

  // Get workshop list when component mounts or page changes
  useEffect(() => {
    fetchWorkshops(activePage);
  }, [activePage]);
  
  /**
   * Get list of workshops registered by the user
   */
  const fetchRegisteredWorkshops = async (): Promise<void> => {
    try {
      const workshops = await workshopService.getUserRegisteredWorkshops();
      // Save list of IDs of registered workshops
      setRegisteredWorkshops(workshops.map(workshop => workshop.id));
    } catch (error) {
      console.error('Error fetching registered workshops:', error);
    }
  };

  /**
   * Handle workshop registration
   */
  const handleRegister = async (workshopId: string): Promise<void> => {
    try {
      // Check if the user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        // If not logged in, redirect to login page
        if (confirm('You need to log in to register for the workshop. Do you want to go to the login page?')) {
          navigate('/login', { state: { returnUrl: '/workshops' } });
        }
        return;
      }

      // Check if already registered for this workshop
      if (registeredWorkshops.includes(workshopId)) {
        alert('You have already registered for this workshop!');
        return;
      }

      // Mark as registering
      setRegistering(workshopId);

      // Call API to register for the workshop
      await workshopService.registerWorkshop(workshopId);
      
      // Update list of registered workshops
      setRegisteredWorkshops(prev => [...prev, workshopId]);
      
      // Display success message
      alert('Workshop registration successful');
      
      // Update workshop list
      fetchWorkshops(activePage);
    } catch (error: any) {
      console.error('Error registering for workshop:', error);
      
      // Display more detailed error message
      if (error.response?.data?.message) {
        alert(`Registration failed: ${error.response.data.message}`);
      } else {
        alert('Workshop registration failed. Please try again later.');
      }
    } finally {
      // Remove registering mark
      setRegistering(null);
    }
  };
  
  /**
   * Cancel workshop registration
   */
  const handleCancelRegistration = async (workshopId: string): Promise<void> => {
    try {
      if (confirm('Are you sure you want to cancel your registration for this workshop?')) {
        // Mark as processing
        setRegistering(workshopId);
        
        // Call API to cancel registration
        await workshopService.cancelWorkshopRegistration(workshopId);
        
        // Update list of registered workshops
        setRegisteredWorkshops(prev => prev.filter(id => id !== workshopId));
        
        // Display success message
        alert('Workshop registration cancelled successfully');
        
        // Update workshop list
        fetchWorkshops(activePage);
      }
    } catch (error: any) {
      console.error('Error cancelling workshop registration:', error);
      
      // Display more detailed error message
      if (error.response?.data?.message) {
        alert(`Cancellation failed: ${error.response.data.message}`);
      } else {
        alert('Failed to cancel workshop registration. Please try again later.');
      }
    } finally {
      // Remove processing mark
      setRegistering(null);
    }
  };

  /**
   * Display skeleton loading while fetching data
   */
  const renderSkeletons = () => {
    return Array(ITEMS_PER_PAGE).fill(0).map((_, index) => (
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={index}>
        <Card padding="lg" radius="md" withBorder styles={{ root: classes.card }}>
          <Skeleton height={200} mb="md" />
          <Skeleton height={28} width="70%" mb="xs" />
          <Skeleton height={20} width="90%" mb="xs" />
          <Skeleton height={20} width="40%" mb="md" />
          <Group>
            <Skeleton height={36} width="100%" />
          </Group>
        </Card>
      </Grid.Col>
    ));
  };

  /**
   * Display message when there are no workshops
   */
  const renderEmptyState = () => {
    return (
      <Paper p="xl" withBorder radius="md" style={{ textAlign: 'center' }} styles={{ root: classes.card }}>
        <Title order={3} mb="md">No Workshops Available</Title>
        <Text c="dimmed">
          There are currently no workshops scheduled. Please check back later.
        </Text>
      </Paper>
    );
  };

  /**
   * Format workshop time
   */
  const formatWorkshopTime = (scheduledAt: string, duration: number): string => {
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    const formattedDate = format(startTime, 'EEEE, MM/dd/yyyy', { locale: enUS });
    const formattedStartTime = format(startTime, 'HH:mm');
    const formattedEndTime = format(endTime, 'HH:mm');
    
    return `${formattedDate}, ${formattedStartTime} - ${formattedEndTime}`;
  };

  /**
   * Check if workshop has already ended
   */
  const isWorkshopPast = (scheduledAt: string, duration: number): boolean => {
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const now = new Date();
    
    return endTime < now;
  };

  return (
    <div style={classes.wrapper}>
      <Header />
      <Container size="lg">
        <Stack gap="xl">
        <Box>
          <Title order={2} mb="xs" style={classes.title}>Workshops</Title>
          <Text style={classes.subtitle} mb="lg">
            Join online workshops with leading instructors
          </Text>
          <Divider mb="xl" color="#2e2e3c" />
        </Box>

        {loading ? (
          <Grid>{renderSkeletons()}</Grid>
        ) : workshops.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <Grid>
              {workshops.map((workshop) => (
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={workshop.id}>
                  <Card padding="lg" radius="md" withBorder h="100%" style={{ display: 'flex', flexDirection: 'column' }} styles={{ root: classes.card }}>
                    <Card.Section>
                      <Image
                        src={workshop.thumbnail || 'https://placehold.co/600x400?text=Workshop'}
                        height={200}
                        alt={workshop.title}
                      />
                    </Card.Section>

                    <Stack gap="xs" mt="md" style={{ flex: 1 }}>
                      <Title order={4} style={classes.cardTitle}>{workshop.title}</Title>
                      
                      <Group gap="xs">
                        <IconUser style={{ width: rem(16), height: rem(16) }} color="#a1a1aa" />
                        <Text size="sm" style={classes.cardText}>
                          {workshop.instructor?.user?.firstName} {workshop.instructor?.user?.lastName}
                        </Text>
                      </Group>
                      
                      <Group gap="xs">
                        <IconCalendar style={{ width: rem(16), height: rem(16) }} color="#a1a1aa" />
                        <Text size="sm" style={classes.cardText}>
                          {formatWorkshopTime(workshop.scheduledAt, workshop.duration)}
                        </Text>
                      </Group>
                      
                      <Group gap="xs">
                        <IconClock style={{ width: rem(16), height: rem(16) }} color="#a1a1aa" />
                        <Text size="sm" style={classes.cardText}>
                          {workshop.duration} minutes
                        </Text>
                      </Group>
                      
                      {isWorkshopPast(workshop.scheduledAt, workshop.duration) ? (
                        <Badge color="gray" variant="light" size="lg" mt="auto">
                          Ended
                        </Badge>
                      ) : (
                        <>
                          {workshop.meetUrl && (
                            <Button 
                              component="a"
                              href={workshop.meetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="outline"
                              color="blue"
                              fullWidth 
                              mb="xs"
                              leftSection={<IconCalendar size={16} />}
                            >
                              Join Google Meet
                            </Button>
                          )}
                          
                          {userLoggedIn && registeredWorkshops.includes(workshop.id) ? (
                            <>
                              <Badge color="green" variant="light" size="lg" mb="xs" fullWidth>
                                Registered
                              </Badge>
                              <Button 
                                onClick={() => handleCancelRegistration(workshop.id)} 
                                fullWidth 
                                mt="auto"
                                color="red"
                                variant="outline"
                                loading={registering === workshop.id}
                                disabled={registering !== null}
                              >
                                Cancel Registration
                              </Button>
                            </>
                          ) : (
                            <Button 
                              onClick={() => handleRegister(workshop.id)} 
                              fullWidth 
                              mt="auto"
                              styles={{ root: classes.button }}
                              loading={registering === workshop.id}
                              disabled={registering !== null}
                            >
                              Register
                            </Button>
                          )}
                        </>
                      )}
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Center mt="xl">
                <Pagination 
                  value={activePage} 
                  onChange={setActivePage} 
                  total={totalPages} 
                  styles={classes.pagination}
                />
              </Center>
            )}
          </>
        )}
      </Stack>
      </Container>
    </div>
  );
};

export default Workshops;