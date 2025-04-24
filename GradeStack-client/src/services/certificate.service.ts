import api from "./api";

export const generateCertificate = async (learnerId: string, courseId: string, name: string) => {
    const response = await api.post("/certificates/generate", { learnerId, courseId, name });
    return response.data;
}

