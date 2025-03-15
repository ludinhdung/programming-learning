import { useState } from "react";
import {
  Stepper,
  Button,
  Group,
  Select,
  Fieldset,
  TextInput,
} from "@mantine/core";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";



const CourseInformation = () => {
  const topics = [
    {
      id: 1,
      name: "JavaScript",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
    },
    {
      id: 2,
      name: "Python",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
    },
    {
      id: 3,
      name: "Java",
      image:
        "https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg",
    },
    {
      id: 4,
      name: "C++",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg",
    },
    {
      id: 5,
      name: "C#",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/4/4f/Csharp_Logo.png",
    },
    {
      id: 6,
      name: "PHP",
      image: "https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg",
    },
    {
      id: 7,
      name: "Ruby",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/7/73/Ruby_logo.svg",
    },
    {
      id: 8,
      name: "Swift",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/9/9d/Swift_logo.svg",
    },
    {
      id: 9,
      name: "Go",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg",
    },
    {
      id: 10,
      name: "Kotlin",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/7/74/Kotlin_Icon.png",
    },
  ];
  const [selected, setSelected] = useState(topics[3]);
  return (
    <div className="flex justify-center items-center mt-8">
      <div className="w-1/3">
        <Listbox value={selected} onChange={setSelected}>
          <Label className="block text-sm/6 font-medium text-gray-300">
            My topic is
          </Label>
          <div className="relative mt-1">
            <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
              <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                <img
                  alt=""
                  src={selected.image}
                  className="size-5 shrink-0 rounded-full"
                />
                <span className="block truncate">{selected.name}</span>
              </span>
              <ChevronUpDownIcon
                aria-hidden="true"
                className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
              />
            </ListboxButton>

            <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white  text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in data-[closed]:opacity-0">
              {topics.map((topic) => (
                <ListboxOption
                  key={topic.id}
                  value={topic}
                  className="group relative cursor-default py-1 pr-9 pl-3 text-gray-900 select-none data-[active]:bg-indigo-600 data-[active]:text-white"
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center">
                        <img
                          alt=""
                          src={topic.image}
                          className="size-5 shrink-0 rounded-full"
                        />
                        <span
                          className={`ml-3 block truncate ${
                            selected ? "font-semibold" : "font-normal"
                          }`}
                        >
                          {topic.name}
                        </span>
                      </div>

                      {selected && (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-4 
              ${active ? "text-white" : "text-indigo-600"}`}
                        >
                          <CheckIcon className="size-5" />
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>
      {/* <div className="w-1/2">
        <Select
          label="Your topic..."
          placeholder="Pick value"
          data={["React", "Angular", "Vue", "Javascripts", "Nodejs"]}
          searchable
          className="text-gray-400"
        />
      </div> */}
    </div>
  );
};

const CourseStructure = () => {
  return (
    <div className="flex justify-center items-center mt-8">
      <div className="">
      <Fieldset legend="topical information" className="bg-slate-500">
        <TextInput label="Your name" placeholder="Your name" />
        <TextInput label="Email" placeholder="Email" mt="md" />
      </Fieldset>
      </div>
    </div>
  );
};

const CourseSettings = () => {
  return (
    <div className="mt-8">
      <h2 className="text-white text-xl mb-4">Course Settings</h2>
      {/* Thêm elements cho cài đặt khóa học */}
    </div>
  );
};

const CourseReview = () => {
  return (
    <div className="mt-8">
      <h2 className="text-white text-xl mb-4">Review & Publish</h2>
      {/* Thêm elements cho xem lại và xuất bản */}
    </div>
  );
};

const Course: React.FC = () => {
  const [active, setActive] = useState(0);

  // Render step content based on active step
  const renderStepContent = () => {
    switch (active) {
      case 0:
        return <CourseInformation />;
      case 1:
        return <CourseStructure />;
      case 2:
        return <CourseSettings />;
      case 3:
        return <CourseReview />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8 pt-12">
      <h1 className="text-center text-white text-2xl font-bold mb-8">
        Create Your Course
      </h1>
      <div>
        <Stepper
          active={active}
          onStepClick={setActive}
          styles={{
            stepLabel: { color: "white" },
            stepDescription: { color: "gray" },
            separator: { backgroundColor: "#4F46E5" },
            stepIcon: {
              color: "black",
              borderColor: "#222222",
              backgroundColor: "#4F46E5",
              "&[data-completed]": { backgroundColor: "#6600FF" },
            },
            content: {
              color: "#9CA3AF", // Màu gray-400 cho nội dung text bên trong step
            },
          }}
        >
          <Stepper.Step label="Course Information" description="Choose topic">
            Step 1: Select your course's topic below...
          </Stepper.Step>
          <Stepper.Step label="Course Structure" description="Organize content">
            Step 2: Add sections and lessons
          </Stepper.Step>
          <Stepper.Step label="Course Settings" description="Configure options">
            Step 3: Settings and preferences
          </Stepper.Step>
          <Stepper.Step label="Review & Publish" description="Final check">
            Step 4: Review and publish course
          </Stepper.Step>
          <Stepper.Completed>
            Course creation completed! You can now manage your course.
          </Stepper.Completed>
        </Stepper>

        {/* Render current step content */}
        {renderStepContent()}

        <Group justify="center" mt="xl">
          <Button
            variant="default"
            onClick={() =>
              setActive((current) => (current > 0 ? current - 1 : current))
            }
          >
            Back
          </Button>
          <Button
            onClick={() =>
              setActive((current) => (current < 4 ? current + 1 : current))
            }
            variant="filled"
            style={{ backgroundColor: "#4F46E5" }}
          >
            Next step
          </Button>
        </Group>
      </div>
    </div>
  );
};

export default Course;
