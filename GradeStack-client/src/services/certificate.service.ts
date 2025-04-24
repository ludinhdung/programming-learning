import api from "./api";

export const generateCertificate = async (learnerId: string, courseId: string, name: string) => {
    const response = await api.post("/certificates/generate", { learnerId, courseId, name });
    return response.data;
}

export const getCertificatesByLearnerId = async (learnerId: string) => {
    const response = await api.get(`/learners/${learnerId}/certificates`);
    return response.data;
}
