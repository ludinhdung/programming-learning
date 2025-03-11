import { FC, useState } from 'react';
import { Layout, Input, Button, Tabs, Upload, message, Select, Modal } from 'antd';
import {
  PlusOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  CodeOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import Header from '../../components/Header/Header';

const { Content } = Layout;

interface Section {
  id: string;
  title: string;
  lectures: Lecture[];
}

interface Lecture {
  id: string;
  title: string;
  type: 'video' | 'text' | 'code';
  content?: string;
  videoUrl?: string;
  codeBase?: string;
  testCase?: string;
}

const TOPICS = [
  { value: 'react', label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'nodejs', label: 'Node.js' },
];

const CreateCourse: FC = () => {
  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: 'Introduction',
      lectures: [
        {
          id: '1',
          title: 'Introduction',
          type: 'video'
        },
        {
          id: '2',
          title: 'Second lecture',
          type: 'video'
        }
      ]
    }
  ]);

  const [activeSection, setActiveSection] = useState<string>('1');
  const [activeLecture, setActiveLecture] = useState<string>('1');
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [lectureType, setLectureType] = useState<'video' | 'text' | 'code'>('video');
  const [currentSectionId, setCurrentSectionId] = useState<string>('');
  const [lectureContent, setLectureContent] = useState({
    title: '',
    content: '',
    codeBase: '',
    testCase: ''
  });

  const handleAddSection = () => {
    const newSection: Section = {
      id: String(sections.length + 1),
      title: 'New Section',
      lectures: []
    };
    setSections([...sections, newSection]);
  };

  const handleAddLecture = (sectionId: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          lectures: [
            ...section.lectures,
            {
              id: String(section.lectures.length + 1),
              title: 'New Lecture',
              type: 'video'
            }
          ]
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const handleVideoUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
      setShowVideoUpload(false);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleAddNewLecture = () => {
    const newLecture = {
      id: String(Date.now()),
      title: lectureContent.title,
      type: lectureType,
      content: lectureType === 'text' ? lectureContent.content : undefined,
      codeBase: lectureType === 'code' ? lectureContent.codeBase : undefined,
      testCase: lectureType === 'code' ? lectureContent.testCase : undefined
    };

    const updatedSections = sections.map(section => {
      if (section.id === currentSectionId) {
        return {
          ...section,
          lectures: [...section.lectures, newLecture]
        };
      }
      return section;
    });

    setSections(updatedSections);
    setShowLectureModal(false);
    setLectureContent({ title: '', content: '', codeBase: '', testCase: '' });
  };

  const renderLectureModal = () => (
    <Modal
      title="Add New Lecture"
      open={showLectureModal}
      onCancel={() => setShowLectureModal(false)}
      onOk={handleAddNewLecture}
      width={800}
      className="lecture-modal"
      styles={{
        content: {
          backgroundColor: 'rgb(30 41 59)',
        },
        header: {
          backgroundColor: 'rgb(30 41 59)',
          color: 'white',
          borderBottom: '1px solid rgb(51 65 85)',
        },
        body: {
          backgroundColor: 'rgb(30 41 59)',
        },
        footer: {
          backgroundColor: 'rgb(30 41 59)',
          borderTop: '1px solid rgb(51 65 85)',
        },
      }}
    >
      <div className="mb-4">
        <Select
          value={lectureType}
          onChange={setLectureType}
          className="w-full mb-4"
          options={[
            { value: 'video', label: 'Video Lecture' },
            { value: 'text', label: 'Text Content' },
            { value: 'code', label: 'Code Exercise' }
          ]}
          styles={{
            selector: {
              backgroundColor: 'rgb(51 65 85)',
              color: 'white',
            },
            selection: {
              backgroundColor: 'rgb(51 65 85)',
              color: 'white',
            }
          }}
        />
        
        <Input
          placeholder="Lecture Title"
          value={lectureContent.title}
          onChange={(e) => setLectureContent({...lectureContent, title: e.target.value})}
          className="mb-4"
          styles={{
            input: {
              backgroundColor: 'rgb(51 65 85)',
              color: 'white',
              '&:hover, &:focus': {
                backgroundColor: 'rgb(51 65 85)',
              }
            }
          }}
        />

        {lectureType === 'video' && (
          <Upload.Dragger
            name="file"
            multiple={false}
            action="/api/upload"
            onChange={handleVideoUpload}
            className="bg-slate-700 border-slate-600 p-8 hover:bg-slate-600"
          >
            <p className="text-gray-400">
              <VideoCameraOutlined className="text-3xl mb-2" />
              <br />
              Click or drag video to upload
            </p>
          </Upload.Dragger>
        )}

        {lectureType === 'text' && (
          <Input.TextArea
            placeholder="Lecture Content"
            value={lectureContent.content}
            onChange={(e) => setLectureContent({...lectureContent, content: e.target.value})}
            rows={6}
            styles={{
              textarea: {
                backgroundColor: 'rgb(51 65 85)',
                color: 'white',
                '&:hover, &:focus': {
                  backgroundColor: 'rgb(51 65 85)',
                }
              }
            }}
          />
        )}

        {lectureType === 'code' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-white mb-2">Code Base</div>
              <Input.TextArea
                placeholder="Starter code..."
                value={lectureContent.codeBase}
                onChange={(e) => setLectureContent({...lectureContent, codeBase: e.target.value})}
                rows={10}
                styles={{
                  textarea: {
                    backgroundColor: 'rgb(51 65 85)',
                    color: 'white',
                    '&:hover, &:focus': {
                      backgroundColor: 'rgb(51 65 85)',
                    }
                  }
                }}
              />
            </div>
            <div>
              <div className="text-white mb-2">Test Cases</div>
              <Input.TextArea
                placeholder="Test cases..."
                value={lectureContent.testCase}
                onChange={(e) => setLectureContent({...lectureContent, testCase: e.target.value})}
                rows={10}
                styles={{
                  textarea: {
                    backgroundColor: 'rgb(51 65 85)',
                    color: 'white',
                    '&:hover, &:focus': {
                      backgroundColor: 'rgb(51 65 85)',
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );

  const renderLecture = (lecture: Lecture) => (
    <div 
      key={lecture.id}
      className="mb-2 p-3 bg-slate-700 rounded flex justify-between items-center"
    >
      <div className="flex items-center gap-2">
        {lecture.type === 'video' && <VideoCameraOutlined className="text-blue-500" />}
        {lecture.type === 'text' && <FileTextOutlined className="text-green-500" />}
        {lecture.type === 'code' && <CodeOutlined className="text-yellow-500" />}
        <Input 
          value={lecture.title}
          className="bg-transparent border-none text-white"
          styles={{
            input: {
              backgroundColor: 'transparent',
              color: 'white',
              '&:hover, &:focus': {
                backgroundColor: 'transparent',
              }
            }
          }}
          onChange={(e) => {
            const updatedSections = sections.map(s => ({
              ...s,
              lectures: s.lectures.map(l => 
                l.id === lecture.id ? { ...l, title: e.target.value } : l
              )
            }));
            setSections(updatedSections);
          }}
        />
      </div>
      <Button 
        type="text"
        icon={<DeleteOutlined />}
        className="text-gray-400 hover:text-red-500"
      />
    </div>
  );

  const handleAddLectureClick = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setShowLectureModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0d1118]">
      <Header />
      <Content className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-4">Create New Course</h1>
            <Input 
              placeholder="Course Title"
              className="bg-slate-800 border-slate-700 text-white mb-4"
            />
            <Input.TextArea
              placeholder="Course Description"
              className="bg-slate-800 border-slate-700 text-white"
              rows={4}
            />
          </div>

          <Select
            mode="multiple"
            placeholder="Select Topics"
            value={selectedTopics}
            onChange={setSelectedTopics}
            options={TOPICS}
            className="mt-4 w-1/2 text-black-400 hover:text-blue-500 hover:border-blue-500"
            styles={{
              selector: {
                backgroundColor: 'rgb(51 65 85)',
                color: 'white',
              },
              selection: {
                backgroundColor: 'rgb(51 65 85)',
                color: 'white',
              }
            }}
          />

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Curriculum</h2>
              
              {sections.map(section => (
                <div 
                  key={section.id}
                  className="mb-4 border border-slate-700 rounded-lg overflow-hidden"
                >
                  <div 
                    className="bg-slate-700 p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Input 
                      value={section.title}
                      className="bg-transparent border-none text-white font-medium w-auto"
                      onChange={(e) => {
                        const updatedSections = sections.map(s => 
                          s.id === section.id ? { ...s, title: e.target.value } : s
                        );
                        setSections(updatedSections);
                      }}
                    />
                    <Button 
                      type="text"
                      icon={<DeleteOutlined />}
                      className="text-gray-400 hover:text-red-500"
                    />
                  </div>

                  

                  {activeSection === section.id && (
                    <div className="p-4 bg-slate-800">
                      {section.lectures.map(lecture => renderLecture(lecture))}
                      
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        className="mt-4 w-1/2 text-black-400 hover:text-blue-500 hover:border-blue-500"
                        onClick={() => handleAddLectureClick(section.id)}
                      >
                        Add Lecture
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                className="mt-4 w-1/2 text-black-400 hover:text-blue-500 hover:border-blue-500"
                onClick={handleAddSection}
              >
                Add Section
              </Button>
            </div>
          </div>

         

          {renderLectureModal()}
        </div>
      </Content>
    </div>
  );
};

export default CreateCourse; 