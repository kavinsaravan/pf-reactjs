import { auth } from '../firebaseConfig';

export const authenticatedFetch = async (url, options = {}) => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Not authenticated');
    }

    const token = await user.getIdToken();

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
    };

    return fetch(url, {
        ...options,
        headers
    });
};
