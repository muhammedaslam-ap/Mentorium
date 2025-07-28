 import { authAxiosInstance } from "@/api/authAxiosInstance";
  import { AxiosError } from "axios";
  import { toast } from "sonner";

  export const messageService = {
    async deleteMessage(messageId: string) {
      try {
        const response = await authAxiosInstance.delete(`/users/messages/${messageId}`);
        toast.success("Message deleted");
        console.log("deleteMessage Response:", response.data);
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          const errorMessage = error.response?.data?.message || "Failed to delete message";
          toast.error(errorMessage);
          console.error("Error deleting message:", errorMessage);
          throw error;
        }
        toast.error("An unexpected error occurred");
        console.error("Unexpected error:", error);
        throw error;
      }
    },

    async reactToMessage(messageId: string, emoji: string) {
      try {
        const response = await authAxiosInstance.post(`/users/messages/${messageId}/react`, {
          emoji,
        });
        toast.success("Reaction added");
        console.log("reactToMessage Response:", response.data);
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          const errorMessage = error.response?.data?.message || "Failed to react to message";
          toast.error(errorMessage);
          console.error("Error reacting to message:", errorMessage);
          throw error;
        }
        toast.error("An unexpected error occurred");
        throw error;
      }
    },

    async removeReaction(messageId: string) {
      try {
        const response = await authAxiosInstance.delete(`/users/messages/${messageId}/react`, {
          data: { emoji: "❤️" } // Pass the emoji to remove
        });
        toast.success("Reaction removed");
        console.log("removeReaction Response:", response.data);
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          const errorMessage = error.response?.data?.message || "Failed to remove reaction";
          toast.error(errorMessage);
          console.error("Error removing reaction:", errorMessage);
          throw error;
        }
        toast.error("An unexpected error occurred");
        throw error;
      }
    },
  }