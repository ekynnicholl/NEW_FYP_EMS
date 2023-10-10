import NavigationBar from "./layouts/SideBarDesktop";

// This is the navigation bar design,
const NavigationBarLayout = () => {
	return (
		<div className="h-screen flex flex-row justify-start">
			<NavigationBar />
			{/* PLACE YOUR CONTENTS HERE. WRAP THE ABOVE INTO YOUR EXISTING DIV. INCLUDE FLEX-1 IN YOUR NEXT DIV. */}
		</div>
	);
};

export default NavigationBarLayout;
