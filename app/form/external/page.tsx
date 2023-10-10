import ExternalForm from "@/components/forms/ExternalForm"
import { Separator } from "@/components/ui/separator"

export default function ExternalFormPage() {
	return (
		<div className="mx-auto max-w-5xl px-8 my-8">
			<h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
				External Form
			</h1>
			<p className="mt-4 text-gray-500 dark:text-gray-400">
				Here is an example of external form.
			</p>
			<Separator className="my-8" />
			<ExternalForm />
		</div>
	)
}
