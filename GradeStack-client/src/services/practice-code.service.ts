import axios from 'axios';
import api from './api';

// Define types
export enum SupportedLanguage {
    PYTHON = 'PYTHON',
    JAVA = 'JAVA',
    JAVASCRIPT = 'javascript'
}

export interface CodingExercise {
    id: string;
    language: SupportedLanguage;
    problem: string;
    hint?: string;
    solution: string;
    codeSnippet?: string;
    lesson: {
        title: string;
        description: string;
        module: {
            title: string;
            course: {
                title: string;
            };
        };
    };
}

export interface CompileResult {
    success: boolean;
    output: string;
    error?: string;
    warnings?: string[];
    truncated?: boolean;
}

const practiceCodeService = {
    async getCodingExerciseById(id: string): Promise<CodingExercise> {
        try {
            const response = await api.get(`/practice-code/exercises/${id}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.error || 'Failed to fetch coding exercise');
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching coding exercise: ${error.message}`);
            }
            throw new Error('Unknown error when fetching coding exercise');
        }
    },

    async compileAndExecuteCode(language: string, code: string): Promise<CompileResult> {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_EXTERNAL_COMPILER_API_URL}/api/compile`,
                {
                    language,
                    code,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error compiling code: ${error.message}`);
            }
            throw new Error('Unknown error during code compilation');
        }
    }
};

export default practiceCodeService; 