import {useQuery} from "@tanstack/react-query";
import {getMe} from "@/api/user";

export const useMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        staleTime: Infinity,
    })
}