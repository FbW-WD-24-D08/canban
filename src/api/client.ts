import { siteConfig } from "../config/site";

const API_BASE_URL = siteConfig.API_BASE_URL || "http://localhost:3001";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<TRes = unknown>(endpoint: string): Promise<TRes> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch {
      // Fallback for demo when API is not available
      console.warn(`API not available, using demo data for: ${endpoint}`);
      return this.getDemoData(endpoint);
    }
  }

  async post<TReq = unknown, TRes = unknown>(
    endpoint: string,
    data: TReq
  ): Promise<TRes> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async put<TReq = unknown, TRes = unknown>(
    endpoint: string,
    data: TReq
  ): Promise<TRes> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async patch<TReq = unknown, TRes = unknown>(
    endpoint: string,
    data: TReq
  ): Promise<TRes> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async delete<TRes = unknown>(endpoint: string): Promise<TRes> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  private getDemoData(endpoint: string) {
    // Return demo data for different endpoints when API is not available
    if (endpoint.includes("/boards")) {
      return [
        {
          id: "demo-1",
          title: "🎨 Demo Board - Beautiful Design Showcase",
          description:
            "This is a demo board showcasing the beautiful Canban design",
          ownerId: "demo-user",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    if (endpoint.includes("/columns")) {
      return [
        { id: "col-1", title: "📋 To Do", boardId: "demo-1", position: 0 },
        {
          id: "col-2",
          title: "🔄 In Progress",
          boardId: "demo-1",
          position: 1,
        },
        { id: "col-3", title: "✅ Done", boardId: "demo-1", position: 2 },
      ];
    }

    if (endpoint.includes("/tasks")) {
      return [
        {
          id: "task-1",
          title: "🎨 Beautiful UI Design",
          description:
            "The Canban interface features a stunning dark theme with perfect visual hierarchy",
          columnId: "col-3",
          position: 0,
          priority: "high",
          tags: ["design", "ui"],
          dueDate: new Date().toISOString(),
        },
        {
          id: "task-2",
          title: "⚡ Lightning Fast Performance",
          description:
            "Optimized React 19 with TypeScript for maximum performance",
          columnId: "col-3",
          position: 1,
          priority: "medium",
          tags: ["performance"],
        },
        {
          id: "task-3",
          title: "🔐 Enterprise Security",
          description: "Clerk authentication with webhook integration",
          columnId: "col-2",
          position: 0,
          priority: "high",
          tags: ["security"],
        },
      ];
    }

    return [];
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
