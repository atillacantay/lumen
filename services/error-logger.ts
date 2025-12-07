import { db } from "@/config/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { trackAnalyticsError } from "./analytics-service";

interface ErrorContext {
  userId?: string;
  screen?: string;
  action?: string;
  [key: string]: any;
}

interface ErrorLog {
  message: string;
  stack?: string;
  context?: ErrorContext;
  timestamp: Timestamp;
  type: "error" | "warning";
  userAgent?: string;
}

export const errorLogger = {
  logError: async (error: Error | unknown, context?: ErrorContext) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const errorLog: ErrorLog = {
      message: errorMessage,
      stack: errorStack,
      context,
      timestamp: serverTimestamp() as Timestamp,
      type: "error",
      userAgent: "react-native",
    };

    // Send to analytics as well
    trackAnalyticsError({
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: errorMessage,
      screen: context?.screen || "unknown",
    });

    try {
      // Save error to Firebase
      await addDoc(collection(db, "error_logs"), errorLog);
    } catch (logError) {
      // Don't crash the app if logging fails
      if (__DEV__) {
        console.error("Error logging failed:", logError);
      }
    }
  },

  logWarning: async (message: string, context?: ErrorContext) => {
    const warningLog: ErrorLog = {
      message: `WARNING: ${message}`,
      context,
      timestamp: serverTimestamp() as Timestamp,
      type: "warning",
      userAgent: "react-native",
    };

    try {
      await addDoc(collection(db, "error_logs"), warningLog);
    } catch (logError) {
      if (__DEV__) {
        console.error("Warning logging failed:", logError);
      }
    }
  },
};
