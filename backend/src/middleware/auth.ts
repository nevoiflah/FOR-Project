import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.js';

export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email?: string;
    };
}

export const checkAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];

        if (!token) {
            res.status(401).json({ error: 'Unauthorized: No token provided' });
            return
        }

        // Verify the ID token
        // Note: This will fail if Firebase Admin is not properly configured with Service Account
        // For development without Service Account, we might need a bypass or mock
        // But for production, this is mandatory.

        try {
            const decodedToken = await auth.verifyIdToken(token);
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email
            };
            next();
        } catch (verifyError) {
            // FALLBACK FOR DEV if no service account:
            // We can temporarily allow requests if we are just testing network flow
            // BUT this is insecure. 
            // Let's enforce strictness but log carefully.
            console.error('Token Verification Failed:', verifyError);
            res.status(403).json({ error: 'Unauthorized: Invalid token' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Auth Middleware Error' });
    }
};
