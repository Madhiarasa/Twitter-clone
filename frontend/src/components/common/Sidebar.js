import XSvg from "../svgs/X";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant/url";

const Sidebar = () => {
	const queryClient = useQueryClient();
	const {
		data: authUser,
		isLoading,
	} = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			const res = await fetch(`${baseUrl}/api/auth/me`, {
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Auth failed");
			return data;
		},
	});

	const { mutate: logout } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${baseUrl}/api/auth/logout`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Logout failed");
		},
		onSuccess: () => {
			toast.success("Logged out successfully");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
		onError: () => toast.error("Logout failed"),
	});
    //    const {data:authUser}=useQuery({queryKey:["authUser"]})
	return (
		<div className='md:flex-[2_2_0] w-18 max-w-52'>
			<div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full'>

				{/* Logo */}
				<Link to='/' className='flex justify-center md:justify-start mt-2'>
					<XSvg className='px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900' />
				</Link>

				{/* Nav Items */}
				<ul className='flex flex-col gap-3 mt-4'>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<MdHomeFilled className='w-8 h-8' />
							<span className='text-lg hidden md:block'>Home</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link
							to='/notifications'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<IoNotifications className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Notifications</span>
						</Link>
					</li>

					{authUser && (
						<li className='flex justify-center md:justify-start'>
							<Link
								to={`/profile/${authUser.username}`}
								className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
							>
								<FaUser className='w-6 h-6' />
								<span className='text-lg hidden md:block'>Profile</span>
							</Link>
						</li>
					)}
				</ul>

				{/* Logout & Profile section */}
				{authUser && (
					<div className='mt-auto mb-6 px-2'>
						<div className='flex items-center justify-between hover:bg-stone-900 transition-all rounded-full p-2 cursor-pointer'>
							<Link to={`/profile/${authUser.username}`} className='flex items-center gap-2'>
								<img
									src={authUser?.profileImg || "/avatar-placeholder.png"}
									className='w-9 h-9 rounded-full'
									alt='Profile'
								/>
								<div className='hidden md:block'>
									<p className='text-white font-bold text-sm truncate w-28'>{authUser.fullname}</p>
									<p className='text-slate-500 text-sm truncate'>@{authUser.username}</p>
								</div>
							</Link>
							<BiLogOut
								className='w-5 h-5 text-white hover:text-red-500'
								onClick={logout}
								title='Logout'
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Sidebar;
