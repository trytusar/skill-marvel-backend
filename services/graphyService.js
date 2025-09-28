// services/graphyService.js
const axios = require('axios');

const createGraphyLearner = async (user, graphyApiKey, merchantId) => {
    const url = 'https://api.ongraphy.com/public/v1/learners';
    const data = {
        mid: merchantId,
        key: graphyApiKey,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        mobile: user.phoneNumber,
        sendEmail: true,
    };

    try {
        const response = await axios.post(url, new URLSearchParams(data).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating Graphy learner:', error);
        throw error;
    }
};

module.exports = { createGraphyLearner };
