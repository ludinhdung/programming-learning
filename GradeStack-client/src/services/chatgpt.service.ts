import { LocalLanguage } from '../types/language.types';
import OpenAI from 'openai';
import DOMPurify from 'dompurify';

interface ChatGPTContext {
    problem?: string;
    language: LocalLanguage;
    currentCode: string;
    hint?: string;
}

class ChatGPTService {
    private readonly openai: OpenAI;

    constructor() {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key is missing');
        }

        this.openai = new OpenAI({
            baseURL: "https://models.inference.ai.azure.com",
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
        });
    }

    private formatCodeBlock(code: string, language: string): string {
        return `<pre><code class="language-${language}">${DOMPurify.sanitize(code)}</code></pre>`;
    }

    private createPrompt(context: ChatGPTContext, question: string): string {
        const cleanProblem = DOMPurify.sanitize(context.problem || '');
        const formattedCode = this.formatCodeBlock(context.currentCode, context.language);

        return `
You are a coding tutor providing answers in HTML format for Quill.js rendering.

CONTEXT:
<strong>Problem:</strong> ${cleanProblem}<br/>
<strong>Language:</strong> ${context.language.toUpperCase()}<br/>
<strong>Current Code:</strong> ${formattedCode}<br/>
<strong>Hint:</strong> ${context.hint || 'None provided'}<br/>

<strong>Question:</strong> ${question}<br/>

Return the response in only structured HTML format:
1. <strong>SOLUTION</strong>
   - Direct answer
   - Code example (use <pre><code> for code formatting)
   - Key explanation points

2. <strong>BEST PRACTICES</strong>
   - Language-specific tips
   - Common pitfalls
   - Testing approach

Ensure code snippets are enclosed in <pre><code> tags for Quill.js to render properly.
`;
    }

    private formatResponse(response: string): string {
        let formattedResponse = response;

        formattedResponse = formattedResponse
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(\*\*)(.*?)\1/g, '<strong>$2</strong>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/```([\w]+)?\n([\s\S]+?)```/g, (match, lang, code) => {
                return `<pre><code class="language-${lang || 'plaintext'}">${DOMPurify.sanitize(code)}</code></pre>`;
            });

        // Đảm bảo danh sách <ul> được bọc đúng
        formattedResponse = formattedResponse.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');

        return DOMPurify.sanitize(formattedResponse);
    }

    public async generateResponse(context: ChatGPTContext, question: string): Promise<string> {
        try {
            const prompt = this.createPrompt(context, question);

            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a coding tutor. Provide HTML-formatted answers with <strong>, <br>, <pre>, and <code> for Quill.js rendering."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "gpt-4o",
                temperature: 0.5,
                max_tokens: 2048,
                top_p: 0.7,
                frequency_penalty: 0.2,
                presence_penalty: 0.2
            });

            let response = completion.choices[0].message.content || "Sorry, I couldn't generate a response.";

            response = this.formatResponse(response);
            console.log(response);

            return response;
        } catch (error) {
            console.error('Error calling OpenAI:', error);
            throw error;
        }
    }
}

export const chatGPTService = new ChatGPTService();
export default chatGPTService;
