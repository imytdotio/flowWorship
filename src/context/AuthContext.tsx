import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  phoneNumber: string | null;
  login: (phoneNumber: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  const login = (phone: string) => {
    setPhoneNumber(phone);
  };

  const logout = () => {
    setPhoneNumber(null);
  };

  return (
    <AuthContext.Provider value={{ phoneNumber, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
