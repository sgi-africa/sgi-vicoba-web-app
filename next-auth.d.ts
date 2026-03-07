import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
    phone?: string;
    accessToken: string;
    memberships: {
      groupId: number;
      groupName: string;
      title: string;
    }[];
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    role: string;
    phone?: string;
    accessToken: string;
    memberships: {
      groupId: number;
      groupName: string;
      title: string;
    }[];
  }
}