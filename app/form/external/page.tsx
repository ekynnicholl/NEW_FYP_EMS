import AdminExternalForm from "@/components/forms/AdminExternalForm";
import ExternalForm from "@/components/forms/ApplicantExternalForm";
import BottomLeftPopup from "@/components/ntf/bottomleftpopup";
import Image from "next/image";

export default function ExternalFormPage() {
	return (
		<div>
			<ExternalForm />
			<BottomLeftPopup />
		</div>
	);
}
