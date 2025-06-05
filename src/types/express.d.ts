declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        role: 'renter' | 'landlord' | 'technician' | 'admin';
        email: string;
      };
    }
  }
}

export {};
