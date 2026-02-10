import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables
vi.stubEnv("NEXT_PUBLIC_WS_URL", "ws://localhost:1234");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "mock-anon-key");
vi.stubEnv("NEXT_PUBLIC_HTTP_URL", "http://localhost:3000");
