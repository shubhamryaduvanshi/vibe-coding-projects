import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBoard } from "../../api/tasks";
import { socket } from "../../lib/socket";

export const boardQueryKey = ["board"];

export const useBoard = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: boardQueryKey,
    queryFn: fetchBoard
  });

  useEffect(() => {
    const handleBoardUpdate = () => {
      void queryClient.invalidateQueries({ queryKey: boardQueryKey });
    };

    socket.on("board:updated", handleBoardUpdate);
    return () => {
      socket.off("board:updated", handleBoardUpdate);
    };
  }, [queryClient]);

  return query;
};

