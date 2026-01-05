import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../../constant/url";
import { toast } from "react-hot-toast";

const EditProfileModal = ({ authUser }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });

  const queryClient = useQueryClient();

  const {
    mutate: updateUserProfile,
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
      if (!res.ok) throw new Error(data.error || "Failed to update");
      return data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.fullName || "",
        username: authUser.username || "",
        email: authUser.email || "",
        bio: authUser.bio || "",
        link: authUser.link || "",
        newPassword: "",
        currentPassword: "",
      });
    }
  }, [authUser]);

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() => document.getElementById("edit_profile_modal").showModal()}
      >
        Edit profile
      </button>

      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Profile</h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              updateUserProfile(formData);
            }}
          >
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Full Name"
                name="fullName"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.fullName}
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder="Username"
                name="username"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Email"
                name="email"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.email}
                onChange={handleInputChange}
              />
              <textarea
                placeholder="Bio"
                name="bio"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.bio}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="password"
                placeholder="Current Password"
                name="currentPassword"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.currentPassword}
                onChange={handleInputChange}
              />
              <input
                type="password"
                placeholder="New Password"
                name="newPassword"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.newPassword}
                onChange={handleInputChange}
              />
            </div>
            <input
              type="text"
              placeholder="Link"
              name="link"
              className="flex-1 input border border-gray-700 rounded p-2 input-md"
              value={formData.link}
              onChange={handleInputChange}
            />
            <button className="btn btn-primary rounded-full btn-sm text-white">
              {isUpdatingProfile ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};

export default EditProfileModal;
