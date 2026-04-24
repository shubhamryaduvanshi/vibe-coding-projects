import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { refreshSession } from "../../api/auth";
import { useAuthStore } from "./auth-store";
import { socket } from "../../lib/socket";

export const useSession = () => {
  const { setReady, setUser } = useAuthStore();

  const mutation = useMutation({
    mutationFn: refreshSession,
    onSuccess: ({ user }) => {
      setUser(user);
      setReady(true);
      socket.connect();
    },
    onError: () => {
      setUser(null);
      setReady(true);
      socket.disconnect();
    }
  });

  useEffect(() => {
    mutation.mutate();
  }, []);
};

