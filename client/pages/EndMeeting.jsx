import React from "react";
import { useNavigate } from "react-router-dom";

const EndMeeting = () => {
	const navigate = useNavigate();
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
			<div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center">
				<h1 className="text-2xl font-bold mb-4 text-cyan-700">Meeting Ended</h1>
				<p className="mb-6 text-gray-600">Your interview session has ended. Thank you for participating!</p>
				<button
					className="px-6 py-2 rounded bg-cyan-700 text-white font-semibold hover:bg-cyan-800"
					onClick={() => navigate("/")}
				>
					Go to Home
				</button>
			</div>
		</div>
	);
};

export default EndMeeting;
