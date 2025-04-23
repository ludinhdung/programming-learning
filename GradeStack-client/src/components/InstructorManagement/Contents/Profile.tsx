import React, { useState, useEffect } from "react";
import { Form, Button, Avatar, Card, message, Tooltip } from "antd";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { instructorService } from "../../../services/api";

interface Instructor {
  userId: string;
  organization: string;
  avatar: string;
  bio: string | null;
  socials: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

const getSocialIcon = (url: string) => {
  if (url.includes("twitter.com") || url.includes("x.com")) {
    return (
      <svg
        className="h-5 w-5 text-[#bad9fc]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    );
  } else if (url.includes("facebook.com")) {
    return (
      <svg
        className="h-5 w-5 text-[#bad9fc]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  } else if (url.includes("linkedin.com")) {
    return (
      <svg
        className="h-5 w-5 text-[#bad9fc]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  } else if (url.includes("github.com")) {
    return (
      <svg
        className="h-5 w-5 text-[#bad9fc]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    );
  } else if (url.includes("youtube.com")) {
    return (
      <svg
        className="h-5 w-5 text-[#bad9fc]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  } else {
    // Default icon for other social media
    return (
      <svg
        className="h-5 w-5 text-[#bad9fc]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7h2v2h-2v-2zm0-8h2v6h-2V7z" />
      </svg>
    );
  }
};

const Profile = () => {
  const [instructor, setInstructor] = useState<Instructor | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [editingSocials, setEditingSocials] = useState(false);
  const [form] = Form.useForm();
  const [socialInputs, setSocialInputs] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchInstructorData = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          const response = await instructorService.getInstructorProfile(
            user.id
          );
          if (response.success && response.data) {
            setInstructor(response.data);
            setSocialInputs([...(response.data.socials || []), ""]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch instructor data:", error);
        message.error("Failed to load instructor profile");
      } finally {
        setLoading(false);
      }
    };
    fetchInstructorData();
  }, []);

  const handleBioEdit = () => {
    setEditingBio(true);
    form.setFieldsValue({
      bio: instructor?.bio || "",
    });
  };

  const handleBioCancel = () => {
    setEditingBio(false);
  };

  const handleBioSave = async () => {
    try {
      const values = await form.validateFields(["bio"]);
      setLoading(true);

      const userData = localStorage.getItem("user");
      if (userData && instructor) {
        const user = JSON.parse(userData);
        await instructorService.updateInstructorProfile(user.id, {
          bio: values.bio,
          socials: instructor.socials,
        });

        setInstructor({
          ...instructor,
          bio: values.bio,
        });
      }

      setEditingBio(false);
      message.success("Bio updated successfully");
    } catch (error) {
      console.error("Failed to update bio:", error);
      message.error("Failed to update bio");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialsEdit = () => {
    setEditingSocials(true);
    if (instructor) {
      setSocialInputs([...instructor.socials, ""]);
    }
  };

  const handleSocialsCancel = () => {
    setEditingSocials(false);
    if (instructor) {
      setSocialInputs([...instructor.socials, ""]);
    }
  };

  const handleSocialInputChange = (value: string, index: number) => {
    const newSocials = [...socialInputs];
    newSocials[index] = value;

    // If the last input is filled, add a new empty input
    if (index === socialInputs.length - 1 && value) {
      newSocials.push("");
    }

    setSocialInputs(newSocials);
  };

  const handleSocialRemove = (index: number) => {
    const newSocials = [...socialInputs];
    //Thay đổi trực tiếp mảng gốc.  Bắt đầu tại index , xoá 1 phần tử
   //  const arr = [1, 2, 3, 4, 5];
   //  const removed = arr.splice(1, 2); // Bắt đầu tại index 1, xoá 2 phần tử
   //  console.log(removed); // [2, 3]
     //  console.log(arr); // [1, 4, 5] (đã thay đổi)
     
    newSocials.splice(index, 1);
    setSocialInputs(newSocials);
  };

  const handleSocialsSave = async () => {
    try {
      const filteredSocials = socialInputs.filter((url) => url.trim() !== "");

      setLoading(true);

      // Update instructor socials through API
      const userData = localStorage.getItem("user");
      if (userData && instructor) {
        const user = JSON.parse(userData);
        await instructorService.updateInstructorProfile(user.id, {
          bio: instructor.bio || "",
          socials: filteredSocials,
        });

        // Update local state
        setInstructor({
          ...instructor,
          socials: filteredSocials,
        });
      }

      setEditingSocials(false);
      message.success("Social media links updated successfully");
    } catch (error) {
      console.error("Failed to update social media links:", error);
      message.error("Failed to update social media links");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 p-8 items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 p-8 items-center justify-center">
        <div className="text-white text-xl">No instructor profile found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 p-8">
      <h1 className="text-white text-2xl font-bold mb-8 relative">
        <span className="relative z-10">Instructor Profile</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile card */}
        <div className="lg:col-span-1">
          <Card className="bg-zinc-700 border-none overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar
                  src={instructor.avatar}
                  alt={`${instructor.user.firstName} ${instructor.user.lastName}`}
                  size={120}
                  className="border-4 border-blue-500 shadow-md"
                />
              </div>

              <h2 className="text-white text-3xl font-extrabold uppercase tracking-wide mb-2">
                {`${instructor.user.firstName} ${instructor.user.lastName}`}
              </h2>

              <div className="text-gray-400 mb-4">
                {instructor.organization} • {instructor.user.role}
              </div>

              <div className="text-gray-400 text-sm mb-4">
                {instructor.user.email}
              </div>

              <div className="w-full border-t border-zinc-600 my-4 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-gray-300 text-sm">Member Since</div>
                  <div className="text-gray-400 text-sm">
                    {new Date(instructor.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-300 text-sm">Last Updated</div>
                  <div className="text-gray-400 text-sm">
                    {new Date(instructor.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column - Editable fields */}
        <div className="lg:col-span-2">
          <Card className="bg-zinc-700 border-none mb-6 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-white text-xl font-bold flex items-center">
                <span className="w-1 h-5 bg-blue-500 mr-2 rounded-full"></span>
                Bio
              </h3>
              {!editingBio ? (
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={handleBioEdit}
                  className="text-blue-400 hover:text-blue-300 hover:bg-zinc-600 rounded-lg transition-all"
                >
                  Edit
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={handleBioCancel}
                    className="text-red-400 hover:text-red-300 hover:bg-zinc-600 rounded-lg transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleBioSave}
                    loading={loading}
                    className="bg-blue-500 hover:bg-blue-400 border-none rounded-lg shadow-md transition-all"
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>

            {!editingBio ? (
              <p className="text-gray-300 leading-relaxed bg-zinc-800 p-4 rounded-lg">
                {instructor.bio || "No bio information available yet."}
              </p>
            ) : (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="bio"
                  rules={[{ required: true, message: "Please enter your bio" }]}
                >
                  <textarea
                    rows={5}
                    placeholder="Introduce yourself to your students..."
                    className="w-full bg-zinc-800 text-gray-200 border border-zinc-600 focus:border-blue-500 focus:outline-none hover:border-blue-400 transition-colors rounded-md resize-none p-3"
                    style={{
                      borderRadius: "8px",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  />
                </Form.Item>
              </Form>
            )}
          </Card>

          <Card className="bg-zinc-700 border-none shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-white text-xl font-bold flex items-center">
                <span className="w-1 h-5 bg-blue-500 mr-2 rounded-full"></span>
                Social Media
              </h3>
              {!editingSocials ? (
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={handleSocialsEdit}
                  className="text-blue-400 hover:text-blue-300 hover:bg-zinc-600 rounded-lg transition-all"
                >
                  Edit
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={handleSocialsCancel}
                    className="text-red-400 hover:text-red-300 hover:bg-zinc-600 rounded-lg transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSocialsSave}
                    loading={loading}
                    className="bg-blue-500 hover:bg-blue-400 border-none rounded-lg shadow-md transition-all"
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>

            {!editingSocials ? (
              <div className="flex flex-wrap gap-3 bg-zinc-800 p-4 rounded-lg">
                {instructor.socials.map((social: string, index: number) => (
                  <Tooltip title={social} key={index}>
                    <a
                      href={social}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 bg-[#29334a] hover:bg-[#29324a] rounded-lg shadow-md transition-colors hover:scale-110"
                    >
                      {getSocialIcon(social)}
                    </a>
                  </Tooltip>
                ))}
                {instructor.socials.length === 0 && (
                  <div className="text-gray-400 p-3 bg-zinc-700 rounded-lg border border-zinc-600 w-full text-center">
                    No social media links added yet.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 bg-zinc-800 p-4 rounded-lg">
                {socialInputs.map((social: string, index: number) => (
                  <div className="flex items-center gap-2" key={index}>
                    <div className="relative flex-grow">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 pr-2">
                        {social ? (
                          getSocialIcon(social)
                        ) : (
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="text"
                        value={social}
                        onChange={(e) =>
                          handleSocialInputChange(e.target.value, index)
                        }
                        placeholder="https://twitter.com/yourusername"
                        className="w-full bg-zinc-700 text-gray-200 border border-zinc-600 focus:border-blue-500 hover:border-blue-400 focus:outline-none transition-colors rounded-md pl-10 pr-3 py-2"
                        style={{
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                          borderRadius: "8px",
                          height: "42px",
                        }}
                      />
                    </div>
                    {index < (instructor?.socials?.length || 0) && (
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => handleSocialRemove(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-zinc-700 transition-colors flex-shrink-0"
                        style={{
                          height: "42px",
                          width: "42px",
                          borderRadius: "8px",
                        }}
                      />
                    )}
                  </div>
                ))}
                <div className="text-gray-400 text-xs italic mt-3 ml-1">
                  Add links to your Twitter, Facebook, LinkedIn, GitHub, or
                  YouTube profiles
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
