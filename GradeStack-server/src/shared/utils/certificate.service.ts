import dotenv from "dotenv";

dotenv.configDotenv();

interface CertificateCustomAttributes {
    'custom.coursename': string;
}

interface CertificateResponse {
    id: string;
    publicId: string;
    groupId: string;
    status: string;
    recipient: {
        id: string;
        name: string;
        email: string;
    };
    issueDate: string;
    expiryDate: string;
    attributes: {
        'recipient.name': string;
    };
    customAttributes: CertificateCustomAttributes;
    createdAt: string;
    updatedAt: string;
}

export class CertificateService {
    private static readonly API_URL = process.env.CERTIFIER_API_URL || 'https://api.certifier.io/v1/credentials/create-issue-send';
    private static readonly API_KEY = process.env.CERTIFIER_API_KEY;
    private static readonly GROUP_ID = process.env.CERTIFIER_GROUP_ID;

    private static formatDate(date: string): string {
        try {
            // Parse the date
            const parsedDate = new Date(date);

            // Validate the date
            if (isNaN(parsedDate.getTime())) {
                throw new Error('Invalid date format');
            }

            // Get the date components
            const year = parsedDate.getFullYear();
            const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
            const day = String(parsedDate.getDate()).padStart(2, '0');

            // Return in YYYY-MM-DD format
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            throw new Error('Invalid date format. Please provide a valid date.');
        }
    }

    public static async generateCertificate(
        name: string,
        email: string,
        courseName: string,
        issueDate: string,
        expiryDate: string
    ): Promise<string> {
        if (!this.API_KEY || !this.GROUP_ID) {
            throw new Error('Missing required environment variables: CERTIFIER_API_KEY or CERTIFIER_GROUP_ID');
        }

        const formattedIssueDate = this.formatDate(issueDate);
        const formattedExpiryDate = this.formatDate(expiryDate);

        // Validate that expiry date is after issue date
        if (new Date(formattedExpiryDate) <= new Date(formattedIssueDate)) {
            throw new Error('Expiry date must be after issue date');
        }

        const requestBody = {
            groupId: this.GROUP_ID,
            recipient: {
                name: name,
                email: email
            },
            issueDate: formattedIssueDate,
            expiryDate: formattedExpiryDate,
            customAttributes: {
                'custom.coursename': courseName
            }
        };

        console.log('Certificate request body:', JSON.stringify(requestBody, null, 2));

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Certifier-Version': '2022-10-26',
                    'content-type': 'application/json',
                    'authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Certificate API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`Failed to generate certificate: ${response.statusText}. Details: ${errorText}`);
            }

            const data: CertificateResponse = await response.json();
            console.log('Certificate API Success Response:', data);
            return `https://credsverse.com/credentials/${data.publicId}`;
        } catch (error) {
            console.error('Error generating certificate:', error);
            throw error;
        }
    }
}
