export interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    thumbnail: string;
    instructor: {
        name: string;
        avatar: string;
    };
    category: string;
}

export const mockCourses: Course[] = [
    {
        id: '1',
        title: "Jeffrey's Larabits",
        description: 'Quick tips and tricks about Laravel and web development',
        instructor: {
            name: 'Jeffrey Way',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Laravel',
        duration: 207,
        price: 299000
    },
    {
        id: '2',
        title: "JavaScript Essentials",
        description: 'Master the fundamentals of JavaScript programming',
        instructor: {
            name: 'Jeremy McPeak',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'JavaScript',
        duration: 255,
        price: 199000
    },
    {
        id: '3',
        title: "Vue 3 Mastery",
        description: 'Comprehensive guide to Vue 3 and its ecosystem',
        instructor: {
            name: 'Luke Downing',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Vue',
        duration: 330,
        price: 399000
    },
    {
        id: '4',
        title: "React Native Bootcamp",
        description: 'Learn to build cross-platform mobile apps with React Native',
        instructor: {
            name: 'Andrew Mead',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar4.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'React Native',
        duration: 280,
        price: 349000
    },
    {
        id: '5',
        title: "Python for Beginners",
        description: 'A step-by-step introduction to Python programming',
        instructor: {
            name: 'Jose Portilla',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar5.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Python',
        duration: 310,
        price: 259000
    },
    {
        id: '6',
        title: "Advanced CSS Techniques",
        description: 'Learn advanced CSS for modern web design',
        instructor: {
            name: 'Rachel Andrew',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar6.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'CSS',
        duration: 180,
        price: 149000
    },
    {
        id: '7',
        title: "Node.js Fundamentals",
        description: 'Build scalable network applications with Node.js',
        instructor: {
            name: 'Maximilian Schwarzmüller',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar7.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Node.js',
        duration: 240,
        price: 299000
    },
    {
        id: '8',
        title: "Docker for Developers",
        description: 'Master Docker to streamline your development workflow',
        instructor: {
            name: 'Bret Fisher',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar8.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'DevOps',
        duration: 150,
        price: 199000
    },
    {
        id: '9',
        title: "GraphQL Basics",
        description: 'Learn GraphQL for modern API development',
        instructor: {
            name: 'Eve Porcello',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar9.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'GraphQL',
        duration: 120,
        price: 179000
    },
    {
        id: '10',
        title: "Flutter for Beginners",
        description: 'Build cross-platform apps with Flutter',
        instructor: {
            name: 'Andrea Bizzotto',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar10.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Flutter',
        duration: 300,
        price: 349000
    },
    {
        id: '11',
        title: "Machine Learning with Python",
        description: 'Introduction to machine learning using Python',
        instructor: {
            name: 'Andrew Ng',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar11.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Machine Learning',
        duration: 400,
        price: 499000
    },
    {
        id: '12',
        title: "AWS Certified Solutions Architect",
        description: 'Prepare for the AWS certification exam',
        instructor: {
            name: 'Stephane Maarek',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar12.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Cloud Computing',
        duration: 500,
        price: 599000
    },
    {
        id: '13',
        title: "iOS Development with Swift",
        description: 'Learn to build iOS apps using Swift',
        instructor: {
            name: 'Paul Hudson',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar13.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'iOS',
        duration: 350,
        price: 399000
    },
    {
        id: '14',
        title: "Android Development with Kotlin",
        description: 'Build Android apps using Kotlin',
        instructor: {
            name: 'Dmitry Jemerov',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar14.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Android',
        duration: 320,
        price: 379000
    },
    {
        id: '15',
        title: "Data Structures and Algorithms",
        description: 'Master data structures and algorithms for coding interviews',
        instructor: {
            name: 'Aditya Bhargava',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar15.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Computer Science',
        duration: 280,
        price: 299000
    },
    {
        id: '16',
        title: "Ethical Hacking for Beginners",
        description: 'Learn the basics of ethical hacking',
        instructor: {
            name: 'Zaid Sabih',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar16.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Cybersecurity',
        duration: 200,
        price: 249000
    },
    {
        id: '17',
        title: "Blockchain Development",
        description: 'Learn to build blockchain applications',
        instructor: {
            name: 'Ivan on Tech',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar17.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Blockchain',
        duration: 250,
        price: 349000
    },
    {
        id: '18',
        title: "Unity Game Development",
        description: 'Create games using Unity',
        instructor: {
            name: 'Brackeys',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar18.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Game Development',
        duration: 300,
        price: 399000
    },
    {
        id: '19',
        title: "DevOps with Kubernetes",
        description: 'Learn to deploy and manage applications with Kubernetes',
        instructor: {
            name: 'Kelsey Hightower',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar19.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'DevOps',
        duration: 220,
        price: 299000
    },
    {
        id: '20',
        title: "Rust Programming",
        description: 'Learn the basics of Rust programming',
        instructor: {
            name: 'Steve Klabnik',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar20.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Rust',
        duration: 150,
        price: 199000
    },
    {
        id: '21',
        title: "Go Programming",
        description: 'Master the Go programming language',
        instructor: {
            name: 'Todd McLeod',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar21.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Go',
        duration: 200,
        price: 249000
    },
    {
        id: '22',
        title: "TypeScript Fundamentals",
        description: 'Learn TypeScript for modern JavaScript development',
        instructor: {
            name: 'Basarat Ali Syed',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar22.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'TypeScript',
        duration: 180,
        price: 199000
    },
    {
        id: '23',
        title: "Angular Advanced",
        description: 'Advanced techniques for Angular development',
        instructor: {
            name: 'Mosh Hamedani',
            avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352/avatar23.jpg'
        },
        thumbnail: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png',
        category: 'Angular',
        duration: 250,
        price: 299000
    }
];