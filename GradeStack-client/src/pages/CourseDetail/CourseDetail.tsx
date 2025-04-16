import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import { Button } from 'antd';
import styled from "styled-components";

// Styled components
const StyledButton = styled(Button)`
  &.ant-btn {
    background-color: #29324a;
    color: #fff;
    font-weight: 500;
    border-radius: 0;
    border: none;
    transition: all 0.3s;
    
    &:hover {
      background-color: #1c2e48;
      border-color: #1b55ac;
    }
  }
`;

// Mock data for the course
const mockCourseData = {
    id: '1',
    title: 'JAVASCRIPT ESSENTIALS FOR PHP DEVELOPERS',
    description: 'Unlock the power of JavaScript with this tailored series designed for PHP developers looking to expand their skills. Learn key concepts, syntax, and practical applications to seamlessly transition from server-side to client-side coding.',
    instructor: {
        name: 'Jeremy McPeak',
        bio: 'Hi, I\'m a self-taught programmer who began his career tinkering with websites in 1998. I\'m the author of Beginning JavaScript, 5th Edition, JavaScript 24-Hour Trainer, and co-author of Professional Ajax, 2nd Edition.',
        avatar: 'https://ext.same-assets.com/3003041157/1760373688.jpeg',
        twitter: 'https://twitter.com/jwmcpeak',
        website: '/instructor/jwmcpeak'
    },
    thumbnail: 'https://images.laracasts.com/series/thumbnails/svg/javascript-for-php-devs.svg',
    stats: {
        episodes: 17,
        duration: '3h 3m',
        level: 'Beginner'
    },
    sections: [
        {
            id: '1',
            title: 'THE BASICS',
            episodes: [
                {
                    id: '1',
                    number: '01',
                    title: 'Structure, Syntax, And Scope',
                    description: 'There are a lot of similarities, and of course differences, between JavaScript and PHP. Let\'s begin this course with the fundamentals: code structure, syntax, and a little scope.',
                    duration: '10m 08s',
                    isFree: true
                },
                {
                    id: '2',
                    number: '02',
                    title: 'Data Types',
                    description: 'JavaScript is a typed language, but it is much looser than PHP. In this episode, we\'ll go over JavaScript\'s built-in types and how they differ from PHP.',
                    duration: '8m 34s',
                    isFree: true
                },
                {
                    id: '3',
                    number: '03',
                    title: 'Smooth Operators',
                    description: 'JavaScript\'s operators are, for the most part, reminiscent of PHP\'s, though there are notable differences. Let\'s explore what JavaScript has to offer.',
                    duration: '10m 56s',
                    isFree: true
                },
                {
                    id: '4',
                    number: '04',
                    title: 'Controlling Flow',
                    description: 'JavaScript\'s and PHP\'s decision and loop structures are almost identical (they are C-based languages, after all). But JavaScript has a few extra kinds of loops. Let\'s look at them.',
                    duration: '6m 43s',
                    isFree: false
                },
                {
                    id: '5',
                    number: '05',
                    title: 'Creating Functions',
                    description: 'Functions are first-class citizens in JavaScript, and you can create functions in a variety of different ways. Let\'s look at how.',
                    duration: '8m 52s',
                    isFree: false
                }
            ]
        },
        {
            id: '2',
            title: 'ALL ABOUT OBJECTS',
            episodes: [
                {
                    id: '6',
                    number: '06',
                    title: 'Intro To Objects',
                    description: 'JavaScript is an object-oriented language, and almost everything you work with in JavaScript are objects. Let\'s learn how to create them and populate them.',
                    duration: '11m 08s',
                    isFree: false
                },
                {
                    id: '7',
                    number: '07',
                    title: 'Using Objects As Parameters',
                    description: 'Modern JavaScript uses the pattern of passing objects to functions, instead of passing multiple parameters. It\'s a different way of thinking, and it has a lot of benefits. Let\'s look at how.',
                    duration: '10m 12s',
                    isFree: false
                }
            ]
        }
    ]
};

const CourseDetail: React.FC = () => {
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    return (
        <>
            <Header />
            <main className="container mx-auto px-20 pb-20 p-16 bg-[#0a1321]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Instructor Profile - Left Column */}
                    <div className="md:col-span-1 w-[390px]">
                        <div className="bg-[#1c2432] overflow-hidden">
                            <div className="flex flex-col-reverse">
                                <div className="p-8">
                                    <h2 className="text-[#354b6d] text-4xl font-extrabold uppercase tracking-wide mb-4">
                                        {mockCourseData.instructor.name}
                                    </h2>
                                    <p className="text-white text-sm font-medium leading-relaxed mb-6">
                                        {mockCourseData.instructor.bio}
                                    </p>
                                    <div className="flex space-x-4">
                                        <a
                                            href={mockCourseData.instructor.twitter}
                                            className="flex items-center justify-center w-10 h-10 bg-[#14202e] hover:bg-[#29324a] transition-colors"
                                        >
                                            <svg className="h-5 w-5 text-[#bad9fc]" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                                            </svg>
                                        </a>
                                        <a
                                            href={mockCourseData.instructor.website}
                                            className="flex items-center justify-center w-10 h-10 bg-[#14202e] hover:bg-[#29324a] transition-colors"
                                        >
                                            <svg className="h-5 w-5 text-[#bad9fc]" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3.51 3.51A11.95 11.95 0 0 0 1 12c0 3.18 1.23 6.18 3.47 8.47A11.95 11.95 0 0 0 12 23c3.18 0 6.18-1.23 8.47-3.47A11.95 11.95 0 0 0 23 12c0-3.18-1.23-6.18-3.47-8.47A11.95 11.95 0 0 0 12 1c-3.18 0-6.18 1.23-8.47 3.47zM12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-10a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                                <div className="relative">
                                    <img
                                        src={mockCourseData.instructor.avatar}
                                        alt={mockCourseData.instructor.name}
                                        className="w-full aspect-[3/4] object-cover"
                                    />

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Info - Middle and Right Columns */}
                    <div className="md:col-span-2">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className="flex-1">
                                <h1 className="mt-2 font-bold leading-tight text-5xl text-[#BAD9FC]">
                                    {mockCourseData.title}
                                </h1>
                                <p className="mt-4 text-white text-sm font-medium">
                                    {mockCourseData.description}
                                </p>
                                <div className="mt-6 flex space-x-4">
                                    <StyledButton type="primary" className="bg-[#3b8ff2] flex items-center space-x-2 py-5 px-4">
                                        <svg width="14" viewBox="0 0 14 15" fill="none" className="shrink-0"><rect x="0.928711" y="4.10059" width="10.2" height="6.8" className="fill-current"></rect><rect x="0.928467" y="0.700195" width="3.4" height="13.6" className="fill-current"></rect><rect x="0.928711" y="10.9004" width="3.4" height="3.4" className="fill-current"></rect><rect x="4.28223" y="2.40039" width="3.4" height="3.4" className="fill-current"></rect><rect x="4.28223" y="9.2002" width="3.4" height="3.4" className="fill-current"></rect><rect x="7.68066" y="7.5" width="3.4" height="3.4" className="fill-current"></rect><rect x="7.68066" y="4.10059" width="3.4" height="3.4" className="fill-current"></rect><rect x="9.66895" y="5.80078" width="3.4" height="3.4" className="fill-current"></rect><rect x="0.928711" y="2.40039" width="6.8" height="3.4" className="fill-current"></rect><rect x="0.928711" y="9.2002" width="6.8" height="3.4" className="fill-current"></rect></svg>
                                        <span>Play Course</span>
                                    </StyledButton>
                                    <StyledButton type="primary" className="flex items-center space-x-2 py-5 px-4">
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="relative inline-block shrink-0"><rect y="10" width="5" height="5" className="fill-current"></rect><rect x="9.99902" y="10" width="5" height="5" className="fill-current"></rect><rect y="6.99902" width="5" height="5" className="fill-current"></rect><rect x="9.99951" y="6.99902" width="5" height="5" className="fill-current"></rect><path fill-rule="evenodd" clip-rule="evenodd" d="M5.00049 2H2.22271V4.22222H0.000488281V7H5.00049V2Z" className="fill-current"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M12.7774 2H9.99951V7H14.9995V4.22222H12.7774V2Z" class="fill-current"></path><rect x="5" width="5" height="7" className="fill-current"></rect><rect x="5" y="5" width="5" height="5" className="fill-current"></rect></svg>
                                        <span>Add to Bookmark</span>
                                    </StyledButton>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3">
                                <img
                                    src={mockCourseData.thumbnail}
                                    alt={mockCourseData.title}
                                    className="w-full rounded-none"
                                />
                            </div>
                        </div>

                        <div className="mb-4 flex flex-wrap items-center justify-start space-x-6 text-xs text-white font-medium">
                            <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                </svg>
                                {mockCourseData.stats.episodes} lessons
                            </span>
                            <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {mockCourseData.stats.duration}
                            </span>
                        </div>

                        {/* Episodes Section */}
                        <div className="mt-8">
                            {mockCourseData.sections.map((section) => (
                                <div key={section.id}>
                                    <div className="flex flex-row justify-between mb-4 border border-[#14202e] p-4">
                                        <h2 className="text-xl font-bold text-white">
                                            <span className="text-[#3b82f6] mr-2">//</span> {section.title}
                                        </h2>
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="text-white hover:text-[#3b82f6] transition-colors duration-300"
                                        >
                                            {expandedSections.includes(section.id) ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedSections.includes(section.id) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        {section.episodes.map((episode) => (
                                            <div
                                                key={episode.id}
                                                className={`mb-4 rounded-none bg-[#14202e] p-4 border border-transparent ${!episode.isFree ? 'opacity-80' : ''} cursor-pointer transition-all duration-500 ease-in-out hover:border-[#1b55ac]`}
                                            >
                                                <div className="flex items-center">
                                                    <div className="mr-4 flex-shrink-0 rounded-full border-4 border-[#0a1321] p-4 text-center w-16 h-16 flex items-center justify-center">
                                                        {episode.isFree ? (
                                                            <span className="text-xl font-bold text-white">{episode.number}</span>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center">
                                                            <h3 className="text-xl mb-2 font-medium text-white">{episode.title}</h3>
                                                        </div>
                                                        <p className="mt-1 text-sm font-medium text-white">
                                                            {episode.description}
                                                        </p>
                                                        <div className="mt-4 flex items-center text-xs font-medium text-[#8ba2bd]">
                                                            <svg width="12" height="22" viewBox="0 0 22 22" fill="none" className="mr-2 text-grey-600/75">
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M15.1534 0.09375H6.73483V1.77746H6.30548H3.36741V3.46116H1.68371V6.82858H0V15.2471H1.68371V18.6145H2.0878H3.36741V20.2982H6.73483V21.9819H15.1534V20.2982H16.8371H18.5208V18.6145H20.2045V15.2471H20.4907H21.8882V6.82858H20.4907H20.2045V3.46116H18.5208V1.77746H15.1534V0.09375ZM11.6808 11.4585V5.1444H9.57609V11.4585V13.5632H15.8902V11.4585H11.6808Z" className="fill-current" />
                                                            </svg>
                                                            {episode.duration}
                                                            {episode.isFree && (
                                                                <span className="ml-4 p-1 text-[#3b82f6] bg-[#1c2432]">Free to Watch!</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default CourseDetail;
