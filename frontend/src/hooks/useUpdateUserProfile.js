import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { baseUrl } from "../constant/url";

const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();

	const {
		mutateAsync: updateUserProfile,
		isPending: isUpdatingProfile,
	} = useMutation({
		mutationFn: async (formData) => {
			const res = await fetch(`${baseUrl}/api/users/update`, {
				method: "PUT",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || "Failed to update profile");
			return data;
		},
		onSuccess: () => {
			toast.success("Profile updated successfully");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
		},
		onError: (error) => {
			toast.error(error?.message || "Update failed");
		},
	});

	return { updateUserProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
