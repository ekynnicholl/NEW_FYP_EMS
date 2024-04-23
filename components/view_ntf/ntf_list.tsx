"use client";

import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ViewNTF_Modal from "@/components/ViewNTF_Modal";
import { BsFiletypePdf } from "react-icons/bs";
import Link from "next/link";
import FormsView from "@/components/view_ntf/ntf_forms_view"
import { Tab } from "@headlessui/react";
import TimelineNTF from "@/components/view_ntf/timeline_ntf";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { sendReminderEmail } from "@/lib/api";
import { useRouter } from "next/navigation";

interface NTFListProps {
    atIdentifier: string | null;
}

interface Form {
    id: string;
    email: string;
    program_title: string;
    program_description: string;
    commencement_date: string;
    completion_date: string;
    organiser: string;
    venue: string;
    formStage: number;
    hrdf_claimable: string;

    full_name: string;
    staff_id: string;
    course: string;
    faculty: string;
    transport: string;
    travelling: string;
    other_members: string;

    flight_number: string;
    flight_date: string;
    flight_time: string;
    destination_from: string;
    destination_to: string;
    hotel_name: string;
    check_in_date: string;
    check_out_date: string;

    course_fee: string;
    airfare_fee: string;
    accommodation_fee: string;
    per_diem_fee: string;
    transportation_fee: string;
    travel_insurance_fee: string;
    other_fees: string;
    grand_total_fees: string;
    staff_development_fund: string;
    consolidated_pool_fund: string;
    research_fund: string;
    travel_fund: string;
    student_council_fund: string;
    other_funds: string;
    expenditure_cap: string;
    expenditure_cap_amount: string;

    supporting_documents: string[];

    applicant_declaration_name: string;
    applicant_declaration_position_title: string;
    applicant_declaration_date: string;
    applicant_declaration_signature: string;

    verification_name: string;
    verification_position_title: string;
    verification_date: string;
    verification_signature: string;

    approval_name: string;
    approval_position_title: string;
    approval_date: string;
    approval_signature: string;

    revertComment: string;
    last_updated: string;
}

const NTFList: React.FC<NTFListProps> = ({ atIdentifier }) => {
    const supabase = createClientComponentClient();
    const [forms, setForms] = useState<Form[]>([]);
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
    const [showModalViewNTF, setShowModalViewNTF] = useState(false);
    const [totalHours, setTotalHours] = useState<number>(0);
    const [activeTab, setActiveTab] = useState("Timeline");
    const router = useRouter();

    const [openReminderDialogs, setOpenReminderDialogs] = useState<{ [key: string]: boolean }>({});
    const toggleReminderDialog = (formId: string) => {
        setOpenReminderDialogs((prev) => ({
            ...prev,
            [formId]: !prev[formId],
        }));
    };

    const [formStage, setFormStage] = useState<number>(0);

    const handleViewForm = (formId: string) => {
        setSelectedFormId(formId);
        setShowModalViewNTF(true);
    };

    const sendReminder = async (row: Form) => {
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from("external_forms")
            .update({ last_updated: todayDateString })
            .eq("id", row.id)
            .select();

        if (error) {
            toast.error("Failed to send reminder.")
        } else {
            toast.success("You have successfully sent an email to the Academic Administration Office.")
            sendReminderEmail(data[0]);
            fetchData();
            router.refresh();
        }
    }

    const fetchData = async () => {
        try {
            if (atIdentifier) {
                const isEmail = /@/.test(atIdentifier);
                let searchQuery = atIdentifier;

                if (!isEmail) {
                    searchQuery = atIdentifier.startsWith('SS') ? atIdentifier : `SS${atIdentifier}`;
                }

                const { data, error } = await (isEmail
                    ? supabase
                        .from('external_forms')
                        // .select('id, email, program_title, program_description, commencement_date, completion_date, organiser, venue, hrdf_claimable, formStage, full_name, staff_id, course, faculty, transport, travelling, other_members, total_members, flight_number, flight_date, flight_time, destination_from, destination_to, hotel_name, check_in_date, check_out_date, course_fee, airfare_fee, accommodation_fee, per_diem_fee, transportation_fee, travel_insurance_fee, other_fees, grand_total_fees, staff_development_fund, consolidated_pool_fund, research_fund, travel_fund, student_council_fund, other_funds, expenditure_cap, expenditure_cap_amount, applicant_declaration_name, applicant_declaration_position_title, applicant_declaration_date, applicant_declaration_signature, verification_name, verification_position_title, verification_date, verification_signature, approval_name, approval_position_title, approval_date, approval_signature, revertComment')
                        .select('*')
                        .eq('email', searchQuery)
                        .order('formStage')
                    : supabase
                        .from('external_forms')
                        // .select('id, email, program_title, program_description, commencement_date, completion_date, organiser, venue, hrdf_claimable, formStage, full_name, staff_id, course, faculty, transport, travelling, other_members, total_members, flight_number, flight_date, flight_time, destination_from, destination_to, hotel_name, check_in_date, check_out_date, course_fee, airfare_fee, accommodation_fee, per_diem_fee, transportation_fee, travel_insurance_fee, other_fees, grand_total_fees, staff_development_fund, consolidated_pool_fund, research_fund, travel_fund, student_council_fund, other_funds, expenditure_cap, expenditure_cap_amount, applicant_declaration_name, applicant_declaration_position_title, applicant_declaration_date, applicant_declaration_signature, verification_name, verification_position_title, verification_date, verification_signature, approval_name, approval_position_title, approval_date, approval_signature, revertComment')
                        .select('*')
                        .eq('staff_id', searchQuery)
                        .order('formStage'));

                if (error) {
                    console.error('Error querying external_forms:', error);
                    toast.error('Error fetching forms');
                    return;
                }

                setForms(data || []);

                // If data is not empty, set the corresponding values for each form
                if (data && data.length > 0) {
                    const sumTotalHours = data.reduce((total, ntf) => {
                        const hoursToAdd = parseFloat(ntf.total_hours) || 0;
                        return total + hoursToAdd;
                    }, 0);
                    setTotalHours(sumTotalHours);
                }
            }
        } catch (e) {
            // console.error('Error in fetchData:', e);
        }
    };

    useEffect(() => {
        fetchData();
    }, [atIdentifier, supabase]);

    const isRemindButtonEnabled = (lastUpdatedDate: string) => {
        const lastUpdated = new Date(lastUpdatedDate);
        const currentDate = new Date();

        // Check if today is Saturday (6) or Sunday (0)
        if (currentDate.getDay() === 6 || currentDate.getDay() === 0) {
            // Move current date to next Monday
            currentDate.setDate(currentDate.getDate() + (1 + 7 - currentDate.getDay()));
        }

        const diffInMilliseconds = currentDate.getTime() - lastUpdated.getTime();
        const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

        return diffInDays > 2;
    };

    return (
        <div>
            <ViewNTF_Modal isVisible={showModalViewNTF} onClose={() => setShowModalViewNTF(false)}>
                <Tab.Group>
                    <Tab.List className="m-5">
                        <Tab
                            className={`font-bold items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 dark:hover:bg-[#2F3335] shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 mr-2 focus:outline-none
                                        ${activeTab === "Timeline"
                                    ? "bg-red-600 text-white"
                                    : "bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]"
                                }`}
                            onClick={() => setActiveTab("Timeline")}
                        >
                            Timeline
                        </Tab>
                        <Tab
                            className={`font-bold items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 dark:hover:bg-[#2F3335] shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 mr-2 focus:outline-none
                                        ${activeTab === "Review"
                                    ? "bg-red-600 text-white"
                                    : "bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]"
                                }`}
                            onClick={() => setActiveTab("Review")}
                        >
                            Review
                        </Tab>
                    </Tab.List>

                    <Tab.Panels>
                        <Tab.Panel>
                            <TimelineNTF selectedFormId={selectedFormId || ''} formStage={formStage} />
                        </Tab.Panel>

                        <Tab.Panel>
                            <FormsView selectedFormId={selectedFormId || ''} formStage={formStage} forms={forms} />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </ViewNTF_Modal >

            <div className="text-justify pr-5">
                <p className="text-[20px] font-bold">Past Nominations/ Travelling Form(s)</p>
                <p className="text-[16px] italic">Total Event(s) Attended Count: {forms.length}</p>
                <p className="text-[16px] italic">Total Hours: {totalHours}</p>
            </div>

            <div className="mt-5">
                {forms.length > 0 && (
                    <div className="max-w-screen-lg max-h-[400px] overflow-x-auto">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Program Title
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Commencement Date
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Completion Date
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Organiser
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Venue
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Status
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {forms.map((form) => (
                                    <tr key={form.id}>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {form.program_title}
                                        </td>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {form.commencement_date}
                                        </td>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {form.completion_date}
                                        </td>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {form.organiser}
                                        </td>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {form.venue}
                                        </td>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {(() => {
                                                switch (form.formStage) {
                                                    case 1:
                                                        return <div className="uppercase text-red-500">Reverted to Staff</div>;
                                                    case 2:
                                                        return <div className="uppercase text-blue-500">Reviewing by AAO</div>;
                                                    case 3:
                                                        return <div className="uppercase text-blue-500">Reviewing by HOS/ ADCR/ MGR</div>;
                                                    case 4:
                                                        return <div className="uppercase text-blue-500">Reviewing by HMU/ Dean</div>;
                                                    case 5:
                                                        return <div className="uppercase text-green-500">Approved</div>;
                                                    case 6:
                                                        return <div className="uppercase text-red-500">Rejected</div>;
                                                    default:
                                                        return <div className="uppercase">Unknown</div>;
                                                }
                                            })()}
                                        </td>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            <div className="flex items-center justify-between gap-x-2">
                                                {form.formStage !== 5 && form.formStage !== 6 ? (
                                                    <Button
                                                        onMouseUp={() => {
                                                            handleViewForm(form.id);
                                                            setFormStage(form.formStage)
                                                        }}>
                                                        View
                                                    </Button>
                                                ) : (
                                                    <div className="">
                                                        <a
                                                            href={`/form/external/${form.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Button>
                                                                View
                                                            </Button>
                                                        </a>
                                                    </div>
                                                )}

                                                {
                                                    form.formStage === 2 && !isRemindButtonEnabled(form.last_updated) ? (
                                                        <Dialog
                                                            open={openReminderDialogs[form.id]}
                                                            onOpenChange={() => toggleReminderDialog(form.id)}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    className={`p-2 bg-red-600`}
                                                                    type="button"
                                                                >
                                                                    Remind
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Send Reminder</DialogTitle>
                                                                </DialogHeader>
                                                                <DialogDescription>
                                                                    Sorry! You are only allowed to send a reminder <span className="font-bold"> after 3 working days </span> from the last updated date, {form.last_updated}.
                                                                </DialogDescription>
                                                                <DialogFooter>
                                                                    <DialogClose asChild>
                                                                        <Button>Understood</Button>
                                                                    </DialogClose>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    ) : form.formStage === 2 && isRemindButtonEnabled(form.last_updated) ? (
                                                        <Dialog
                                                            open={openReminderDialogs[form.id]}
                                                            onOpenChange={() => toggleReminderDialog(form.id)}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    className={`p-2 bg-green-600`}
                                                                    type="button"
                                                                >
                                                                    Remind
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Send Reminder</DialogTitle>
                                                                </DialogHeader>
                                                                <DialogDescription>
                                                                    <div className="text-left lg:text-justify">
                                                                        The last updated date of this form is {form.last_updated}, and I hereby send an email reminder to the Academic Administration Office to remind them regarding my forms because it is urgent and not just for the sake of spamming.
                                                                    </div>
                                                                </DialogDescription>
                                                                <DialogFooter>
                                                                    <DialogClose asChild>
                                                                        <Button>Cancel</Button>
                                                                    </DialogClose>
                                                                    <Button
                                                                        onMouseUp={() => {
                                                                            toggleReminderDialog(form.id);
                                                                            sendReminder(form);
                                                                        }}>
                                                                        Agree
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    ) : null
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
                }
            </div >
        </div >
    )
};

export default NTFList;