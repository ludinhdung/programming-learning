import React from 'react';
import { Typography } from 'antd';

// const { Text } = Typography;

interface CourseCardProps {
    title: string;
    instructorName?: string;
    avatar?: string;
    progress?: number;
    thumbnail?: string;
    id: string;
}

interface NoteCardProps {
    note: string;
    timestamp: string;
    courseTitle?: string;
    onDelete?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ title, instructorName, avatar, progress, thumbnail, id }) => {
    return (
        <div className="course-card">
            {/* Add your course card content here */}
        </div>
    );
};

const NoteCard: React.FC<NoteCardProps> = ({ note, timestamp, courseTitle, onDelete }) => {
    return (
        <div className="note-card">
            {/* Add your note card content here */}
        </div>
    );
};

const UserDashboard: React.FC = () => {
    // Add your dashboard logic here
    return (
        <div>
            {/* Add your dashboard content here */}
        </div>
    );
};

export default UserDashboard; 