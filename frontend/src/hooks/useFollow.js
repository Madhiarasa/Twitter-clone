import toast from "react-hot-toast"
import { baseUrl } from "../constant/url"
import { useQueryClient ,useMutation} from "@tanstack/react-query"
const useFollow = () => {
       const queryClient=useQueryClient();
       const {mutate: follow, isPending} = useMutation({
        mutationFn: async (userId) => {
                try {
                        const res = await fetch(`${baseUrl}/api/users/follow/${userId}`, {
                                method: "POST",
                                credentials: "include",
                                headers: {
                                        "Content-Type": "application/json"
                                }
                        });
                        const data = await res.json();
                        if (!res.ok) {
                                throw new Error(data.error || "Something went wrong");
                        }
                        return data;
                } catch (error) {
                        throw new Error(error.message);
                }
        },
        onSuccess: (data) => {
               Promise.all([
                        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
                        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
                ]);
                toast.success("Followed successfully");
        },
        onError: (error) => {
                toast.error(error.message || "Failed to follow user");
        }
       })
       return { follow, isPending };

}

export default useFollow;