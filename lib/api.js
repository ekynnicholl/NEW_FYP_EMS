import axios from 'axios';

export const sendContactForm = async (data) => {
    console.log('Data being sent from the client:', data);
    try {
        const response = await axios.post('/api/email', data, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        if (response.status !== 200) {
            console.error('Error:', response.data);
            throw new Error('Failed to send the contact form data');
        }

        return response.data;
    } catch (error) {
        console.error('Network error:', error);
        throw error;
    }
};