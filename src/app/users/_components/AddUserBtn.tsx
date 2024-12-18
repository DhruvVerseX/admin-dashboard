"use client";

import { Button } from "@/components/ui/button";
import { Prisma } from "@prisma/client";
import { UserPlus } from "lucide-react";
import React, { useState } from "react";
import { AddUserModal } from "./AddUserModal";
import { toast } from "sonner";
import { addUserAction } from "../actions";
import { useUserStore } from "@/stores/userStore";
import { logAction } from "@/actions/logActions";

type UserType = Prisma.UserGetPayload<{
  select: {
    name: true;
    email: true;
    role: true;
  };
}>;

export default function AddUserBtn() {
  const { user } = useUserStore();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const handleAddUser = async (newUser: UserType) => {
    if (user?.role !== "ADMIN")
      return toast.error("You are not authorized to perform this action");
    const toastId = toast.loading("Adding user...");
    const { name, email, role } = newUser;
    try {
      const response = await addUserAction(name, email, role);
      if (response.success) {
        toast.success(response.message, { id: toastId });
        // copy password to clipboard
        navigator.clipboard.writeText(response.password ?? "");
        // notify user
        toast.info("Password copied to clipboard");

        await logAction({
          action: "CREATE",
          details: `User ${newUser.name} was created by ${user?.name}`,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message, { id: toastId });
    } finally {
      setIsAddUserModalOpen(false);
    }
  };

  if (user?.role !== "ADMIN") return null;

  return (
    <>
      <Button onClick={() => setIsAddUserModalOpen(true)}>
        <UserPlus className="mr-2 h-4 w-4" /> Add User
      </Button>
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </>
  );
}
