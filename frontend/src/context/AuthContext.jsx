/**
 * Auth Context — Global authentication state management.
 * 
 * CONCEPT: React Context API
 * Problem: Many components need to know "is the user logged in?" and "who is the user?"
 * Without Context, you'd have to pass these as props through every component (prop drilling).
 * 
 * Context provides a way to share values (state) across the component tree
 * without passing props manually at every level.
 * 
 * How it works:
 * 1. Create a Context (like a "channel")
 * 2. Wrap your app in a Provider (broadcasts data on the channel)
 * 3. Any component can useContext() to listen to that channel
 * 
 * CONCEPT: useReducer
 * Similar to useState but for complex state logic.
 * Instead of directly setting state, you dispatch "actions" 
 * and a reducer function decides how state changes.
 * This pattern comes from Redux and makes state changes predictable.
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create the Context
const AuthContext = createContext(null);

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  tokens: JSON.parse(localStorage.getItem('tokens') || 'null'),
  isAuthenticated: !!localStorage.getItem('tokens'),
  loading: false,
  error: null,
};

/**
 * CONCEPT: Reducer Function
 * Takes current state + action → returns NEW state
 * NEVER modifies existing state (immutability principle)
 * 
 * Action format: { type: 'ACTION_NAME', payload: data }
 */
function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        error: null,
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

/**
 * AuthProvider Component
 * Wraps the app and provides authentication state + functions to all children.
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Register a new user
   */
  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.register(userData);
      const { user, tokens } = response.data;
      
      // Persist to localStorage so auth survives page refresh
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tokens', JSON.stringify(tokens));
      
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, tokens } });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data || { error: 'Registration failed' };
      dispatch({ type: 'AUTH_FAILURE', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Login an existing user
   */
  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.login(credentials);
      const { user, tokens } = response.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tokens', JSON.stringify(tokens));
      
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, tokens } });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Logout — clear all auth data
   */
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // The value provided to all consumers of this context
  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook for using auth context.
 * 
 * CONCEPT: Custom Hooks
 * Instead of calling useContext(AuthContext) everywhere,
 * we create a custom hook that:
 * 1. Calls useContext internally
 * 2. Adds error checking (ensures it's used within AuthProvider)
 * 3. Provides a cleaner API: const { user, login } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}