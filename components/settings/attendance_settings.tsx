"use client";

import { IoMdArrowDroprightCircle, IoMdArrowDropleftCircle } from "react-icons/io";
import React, { useState, useEffect, SetStateAction } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { HiPencilAlt } from "react-icons/hi";
import { BsFillTrash3Fill } from "react-icons/bs";
import { IoMdAdd, IoIosAddCircleOutline, IoIosCloseCircleOutline, IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { Tab } from '@headlessui/react';
import DeleteModal from "@/components/EditEvent_Modal";
import AddFacultyUnitModal from "@/components/EditEvent_Modal";

const AttendanceSettings = () => {
    const supabase = createClientComponentClient();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    const toggleCategoryExpansion = () => {
        setIsCategoryExpanded(!isCategoryExpanded);
    };

    type FacultyUnit = {
        attsID: string;
        attsName: string;
        attsCategory: number;
        attsSubcategory: number;
        attsType: number;
        attsPosition: number;
        attsFacultyUnit: number;
    };

    // Fetch the attendance forms settings,
    const [facultyOptions, setFacultyOptions] = useState<string[]>([]);
    // const [facultyStudents, setFacultyStudents] = useState<string[]>([]);
    const [facultyStudents, setFacultyStudents] = useState<FacultyUnit[]>([]);
    const [facultyUnits, setFacultyUnits] = useState<FacultyUnit[]>([]);
    const [facultyUnitsStudents, setFacultyUnitsStudents] = useState<FacultyUnit[]>([]);

    useEffect(() => {
        const fetchFacultyOptions = async () => {
            try {
                const { data, error } = await supabase
                    .from('attendance_settings')
                    .select('*')
                    .eq('attsType', 1)
                    .order('attsName', { ascending: true });

                if (error) {
                    console.error('Error fetching faculty options:', error.message);
                    return;
                }

                // Extracting only the 'attsName' values from the data
                // const facultyNames = data.map((item) => item.attsName);

                setFacultyUnits(data || []);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        // Fetch the faculty options when the component mounts
        fetchFacultyOptions();
    }, [])

    const fetchFacultyStudent = async () => {
        const { data, error } = await supabase
            .from('attendance_settings')
            .select('*')
            .eq('attsType', 0)
            .order('attsName', { ascending: true });

        if (error) {
            console.error('Error fetching faculty units:', error);
            return;
        }

        // const facultyStudents = data.map((item) => item.attsName);
        setFacultyStudents(data || []);
    };

    useEffect(() => {
        fetchFacultyStudent();
    }, []);

    const [categories, setCategories] = useState<{ id: number; category: number; name: string; subcategories: { id: string; name: string; facultyUnit: number }[]; }[]>([]);

    // retrieve units according categories
    const fetchFacultyUnits = async () => {
        const { data, error } = await supabase
            .from('attendance_settings')
            .select('attsID, attsName, attsCategory, attsSubcategory, attsType, attsPosition, attsFacultyUnit')
            .eq('attsType', 2)
            .order('attsCategory, attsName');
        // .order('attsCategory, attsPosition');

        if (error) {
            console.error('Error fetching faculty units:', error);
            return;
        }

        if (data) {
            setFacultyUnitsStudents(data);

            // Extract unique categories and subcategories
            const uniqueCategories = Array.from(new Set(data
                .filter(unit => unit.attsCategory > 0 && unit.attsType === 2)));

            const uniqueSubcategories = Array.from(new Set(data
                .filter(unit => unit.attsSubcategory > 0)));

            // Create categories array with subcategories
            const categoriesArray = uniqueCategories.map((category) => ({
                id: category.attsCategory,
                category: category.attsPosition,
                name: category.attsName,
                subcategories: uniqueSubcategories
                    .filter((subcategory) => category.attsCategory === subcategory.attsSubcategory)
                    .map(subcategory => ({
                        id: subcategory.attsID,
                        name: subcategory.attsName,
                        facultyUnit: subcategory.attsFacultyUnit
                    }))
            }));

            setCategories(categoriesArray);
        }
    };

    useEffect(() => {
        fetchFacultyUnits();
    }, []);

    const [editedFacultyName, setEditedFacultyName] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateOptionModal, setShowCreateOptionModal] = useState(false);
    const [editOption, setEditOption] = useState("");
    const [cancelOptionUpdate, setCancelOptionUpdate] = useState(false);
    const [updateOption, setUpdateOption] = useState(false);
    const [newFacultyName, setNewFacultyName] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [newFacultyStudent, setNewFacultyStudent] = useState("");
    const [activeTab, setActiveTab] = useState('Staff');
    const [category, setCategory] = useState("");
    const [selectedOption, setSelectedOption] = useState('');


    const handleEditOption = (optionID: string, attsName: string) => {
        setEditOption(optionID);
        setUpdateOption(true);
        setCancelOptionUpdate(false);
        setEditedFacultyName(attsName);
    }

    const handleUpdateFacultyName = async (facultyID: string, facultyName: string) => {
        try {
            const { error } = await supabase
                .from('attendance_settings')
                .update({ attsName: facultyName })
                .eq('attsID', facultyID);

            if (error) {
                // console.error('Error updating faculty name: ', error);
                return;
            }

            setCategories(prevCategories => {
                return prevCategories.map(category => {
                    const updatedSubcategories = category.subcategories.map(subcategory => {
                        if (subcategory.id === facultyID) {
                            return { ...subcategory, name: facultyName };
                        }
                        return subcategory;
                    });
                    return { ...category, subcategories: updatedSubcategories };
                });
            });

            setEditedFacultyName('');

        } catch (error) {
            // console.error('Error updating faculty name:', error);
        }
    }

    //This is to delete the Faculty / Unit from the drop down list
    const handleDeleteFacultyName = async (facultyID: string) => {
        try {
            const { error } = await supabase
                .from('attendance_settings')
                .delete()
                .eq('attsID', facultyID);

            if (error) {
                console.error('Errror deleting faculty name: ', error);
                return;
            }

            // Remove the deleted faculty member from facultyUnits
            setFacultyUnits(prevFacultyUnits => prevFacultyUnits.filter(faculty => faculty.attsID !== facultyID));
            setCategories(prevCategories => prevCategories.map(category => ({
                ...category,
                subcategories: category.subcategories.filter(subcategory => subcategory.id !== facultyID)
            })));

            setShowDeleteModal(false);

        } catch (error) {
            console.log(error);
        }
    }

    const [deletingFaculty, setDeletingFaculty] = useState({ id: "", name: "" });;

    const openDeleteModal = (facultyID: string, facultyName: string) => {
        setDeletingFaculty({ id: facultyID, name: facultyName });
        setShowDeleteModal(true);
    }

    const [newCourse, setNewCourse] = useState({
        attsSubcategory: 0,
        attsFacultyUnit: 0,
    });

    const createNewFacultyUnit = async (newValue: string) => {
        try {
            const { data, error } = await supabase
                .from('attendance_settings')
                .insert({
                    attsName: newValue,
                    attsCategory: 1,
                    attsSubcategory: 1,
                    attsType: 1,
                    attsPosition: 0,
                    attsFacultyUnit: 0
                })

            if (error) {
                console.error('Error creating new faculty unit:', error);
                return;
            }

            // Fetch the updated list of faculty units from the database
            const { data: updatedFacultyUnits, error: fetchError } = await supabase
                .from('attendance_settings')
                .select('attsID, attsName, attsCategory, attsSubcategory, attsType, attsPosition, attsFacultyUnit')
                .eq('attsType', 1)
                .order('attsName');

            setFacultyUnits(updatedFacultyUnits || []);
            setNewFacultyName('');

        } catch (error) {
            console.error('Error creating new faculty unit:', error);
        }
    }

    const createNewCategory = async (newCategory: string, categoryID: number, categoryPosition: number) => {
        try {
            const { data, error } = await supabase
                .from('attendance_settings')
                .insert({
                    attsName: newCategory,
                    attsCategory: categoryID,
                    attsSubcategory: 0,
                    attsType: 2,
                    attsPosition: categoryPosition,
                    attsFacultyUnit: 0
                })

            if (error) {
                console.error('Error creating new faculty unit:', error);
                return;
            }

            setNewCategory('');
            setSelectedOption('');
            fetchFacultyUnits();
        } catch (error) {
            console.error('Error creating new category:', error);
        }
    }

    const createNewFacultyStudent = async (newFacultyStudent: string) => {
        try {
            const { data: CategoryData, error: CategoryError } = await supabase
                .from('attendance_settings')
                .select('attsCategory')
                .eq('attsType', 0)
                .order('attsCategory', { ascending: false })
                .limit(1);

            if (CategoryError) {
                console.error('Error creating new faculty unit for student:', CategoryError);
                return;
            }

            const maxCategory = CategoryData[0]?.attsCategory || 0;

            const { data, error } = await supabase
                .from('attendance_settings')
                .insert({
                    attsName: newFacultyStudent,
                    attsCategory: maxCategory + 1,
                    attsSubcategory: 0,
                    attsType: 0,
                    attsPosition: 0,
                    attsFacultyUnit: 0
                })

            if (error) {
                console.error('Error creating new faculty unit for student:', error);
                return;
            }

            setNewFacultyStudent('');
            fetchFacultyStudent();
            fetchFacultyUnits();
        } catch (error) {
            console.error('Error creating new faculty/unit:', error);
        }
    }

    const openAddCourseModal = async (
        course_subcategory: number,
        course_facultyUnit: number
    ) => {
        setNewCourse({
            attsSubcategory: course_subcategory,
            attsFacultyUnit: course_facultyUnit
        })

        setShowCreateOptionModal(true);
    }

    const createNewCourse = async (newCourse: string, categoryNum: number, facultyUnit: number) => {
        try {
            const { data, error } = await supabase
                .from('attendance_settings')
                .insert({
                    attsName: newCourse,
                    attsCategory: 0,
                    attsSubcategory: categoryNum,
                    attsType: 2,
                    attsPosition: 0,
                    attsFacultyUnit: facultyUnit
                })

            setNewFacultyName('');
            fetchFacultyUnits();
        } catch (error) {
            console.error('Error creating new course:', error);
        }
    }

    const [catFacultyID, setCatFacultyID] = useState(0);

    const handleSelectChange = (event: { target: { value: SetStateAction<string>; }; }) => {
        setSelectedOption(event.target.value);
    };

    return (
        <div>
            <div onClick={toggleExpansion} className="flex cursor-pointer">
                <div className="mr-2">
                    {isExpanded ? (
                        <IoMdArrowDropdownCircle className="text-[27px] lg:text-[30px] dark:text-dark_text" />
                    ) : (
                        <IoMdArrowDroprightCircle className="text-[27px] lg:text-[30px] dark:text-dark_text" />
                    )}
                </div>
                <h1 className="font-bold dark:text-dark_text text-[18px] lg:text-[20px]">Attendance Forms Settings</h1>
            </div>

            {isExpanded ? (
                <div className="transition-max-h duration-300 ease-linear w-full">
                    <div className="overflow-y-auto max-h-[500px] mt-1 pl-10">
                        <div>
                            <Tab.Group>
                                <Tab.List className="">
                                    <Tab
                                        className={`font-bold items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 dark:hover:bg-[#2F3335] shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 mr-2 focus:outline-none
                                        ${activeTab === 'Staff' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]'}`}
                                        onClick={() => setActiveTab('Staff')}>
                                        Staff
                                    </Tab>
                                    <Tab
                                        className={`font-bold items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 dark:hover:bg-[#2F3335] shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 mr-2 focus:outline-none
                                        ${activeTab === 'Student' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]'}`}
                                        onClick={() => setActiveTab('Student')}>
                                        Student
                                    </Tab>
                                </Tab.List>

                                {/* Settings for Staff */}
                                <Tab.Panels>
                                    <Tab.Panel>
                                        <table className="w-1/2 float-left">
                                            <thead>
                                                <tr>
                                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
                                                        No
                                                    </th>

                                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
                                                        <p className="-ml-56">Faculty / Unit</p>
                                                    </th>

                                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {facultyUnits.map((faculty, index) => (
                                                    faculty.attsID === editOption && updateOption && !cancelOptionUpdate ? (
                                                        <tr key={index} className="">
                                                            <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4 ">
                                                                {index + 1}
                                                            </td>

                                                            <td className="flex-1 lg:px-[33px] py-3s border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                                                                <input type="text"
                                                                    placeholder="Enter Faculty / Unit..."
                                                                    className="border-2 ml-3 px-2 py-1 text-base w-full"
                                                                    value={editedFacultyName}
                                                                    onChange={e => setEditedFacultyName(e.target.value)} />
                                                            </td>

                                                            <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-3/4">
                                                                <button
                                                                    className="border-[0.5px] rounded-md bg-slate-900 p-2 text-white hover:bg-red-600 duration-300 ease-in-out"
                                                                    onClick={() => {
                                                                        if (editedFacultyName.length > 0) {
                                                                            setFacultyUnits(prevFacultyUnits => {
                                                                                const updatedFacultyUnits = [...prevFacultyUnits];
                                                                                updatedFacultyUnits[index].attsName = editedFacultyName;
                                                                                return updatedFacultyUnits;
                                                                            });

                                                                            handleUpdateFacultyName(faculty.attsID, editedFacultyName);
                                                                        }

                                                                        setUpdateOption(false);
                                                                    }}
                                                                >
                                                                    Update
                                                                </button>
                                                                <button
                                                                    className="border-[0.5px] rounded-md bg-slate-100 ml-4 px-3 py-2  hover:bg-slate-200 duration-300 ease-in-out"
                                                                    onClick={() => { setCancelOptionUpdate(true); }}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        <tr key={index}>
                                                            <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-center w-1/4 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
                                                                {index + 1}
                                                            </td>

                                                            <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-left w-1/2 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
                                                                <p className="ml-4">{faculty.attsName}</p>
                                                            </td>

                                                            <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-center w-3/4 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
                                                                <div className="flex ml-12">
                                                                    <button onClick={() => {
                                                                        handleEditOption(faculty.attsID, faculty.attsName);
                                                                    }}>
                                                                        <HiPencilAlt className="text-slate-700 hover:scale-105 mt-[3px] lg:mt-[1px] text-[14px] lg:text-base dark:text-dark_text" />
                                                                    </button>
                                                                    <button onClick={() => openDeleteModal(faculty.attsID, faculty.attsName)}>
                                                                        <BsFillTrash3Fill className="text-slate-700 hover:scale-105 ml-6 mt-[3px] lg:mt-[1px] text-[14px] lg:text-base dark:text-dark_text" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className="lg:flex">
                                            <table className="w-full lg:w-1/2 lg:float-left">
                                                {/* Table content */}
                                            </table>
                                            <div className="border-2 p-7 mr-6 mt-6 lg:mt-0 shadow-lg dark:bg-dark_mode_card lg:float-right dark:border-[#363B3D]">
                                                <p className="font-bold text-md dark:text-dark_text text-sm lg:text-base">Add New Faculty / Unit</p>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Academic Office"
                                                    value={newFacultyName}
                                                    className="text-sm lg:text-base mt-7 border-[1px] border-slate-200 rounded-sm w-full px-2 py-1 dark:border-[#27374C] dark:bg-dark_mode_card"
                                                    onChange={e => setNewFacultyName(e.target.value)}
                                                />
                                                <button
                                                    className={`mt-4 rounded-lg text-sm lg:text-base py-2 px-4 lg:py-3 lg:px-5 font-medium focus:shadow-outline focus:outline-none focus:ring-2 justify-end text-right dark:bg-[#18212F] dark:text-dark_text dark:border-[#736B5E] ${!newFacultyName ? 'bg-gray-200 text-slate-900 cursor-default duration-300 ease-out' : 'text-white bg-slate-900 hover:bg-red-600 hover:text-slate-50 hover:transition duration-300 transform hover:scale-105 cursor-pointer'}`}
                                                    onClick={() => { createNewFacultyUnit(newFacultyName); }}
                                                    disabled={!newFacultyName}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>

                                    </Tab.Panel>

                                    {/* Settings for Student */}
                                    <Tab.Panel>

                                        <div className="border-2 p-7 mt-12 lg:mr-72 shadow-lg dark:bg-dark_mode_card lg:float-right lg:w-1/4">
                                            <p className="font-bold text-sm lg:text-base">Add New Faculty / Unit</p>
                                            <input type="text"
                                                placeholder="e.g., Faculty of Business, Design and Arts"
                                                value={newFacultyStudent}
                                                className="mt-4 lg:mt-7 border-[1px] border-slate-200 rounded-sm w-full px-2 py-1 text-sm lg:text-base"
                                                onChange={e => setNewFacultyStudent(e.target.value)}
                                            />
                                            <button
                                                className={`rounded-lg py-2 lg:py-3 px-[27px] lg:px-[25px] font-medium dark:bg-slate-800 mt-5 text-sm lg:text-base ${!newFacultyStudent ? 'border bg-gray-200 text-slate-900 cursor-default duration-300 ease-out' : 'text-white focus:shadow-outline focus:outline-none focus:ring-2 bg-slate-900 hover:bg-red-600 hover:text-slate-50 hover:transition duration-300 transform hover:scale-105 cursor-pointer'}`}
                                                onClick={() => { createNewFacultyStudent(newFacultyStudent); }}
                                                disabled={!newFacultyStudent}
                                            >
                                                Add
                                            </button>

                                            <p className="font-bold text-sm lg:text-base mt-7 lg:mt-20">Add New Category</p>

                                            <select
                                                name="studentFacultyUnit"
                                                id="studentFacultyUnit"
                                                defaultValue=""
                                                className="w-full px-4 py-2 border-[1px] rounded-md border-gray-300 focus:outline-none mt-3 text-xs lg:text-base"
                                                required
                                                onChange={event => {
                                                    handleSelectChange(event);
                                                    setCatFacultyID(event.target.selectedIndex);
                                                }}
                                            >
                                                <option value="" disabled>Select Faculty/ Unit</option>
                                                {facultyStudents.map((faculty, index) => (
                                                    <option key={index} value={faculty.attsName}>
                                                        {faculty.attsName}
                                                    </option>
                                                ))}
                                            </select>

                                            {selectedOption &&
                                                <>
                                                    <input type="text"
                                                        placeholder="e.g., Barchelor of Degrees"
                                                        value={newCategory}
                                                        className="mt-7 border-[1px] border-slate-200 rounded-sm w-[373px] px-2 py-1"
                                                        onChange={e => setNewCategory(e.target.value)}
                                                    /><br />
                                                </>
                                            }

                                            <button
                                                className={`rounded-lg py-2 lg:py-3 px-[27px] lg:px-[25px] font-medium dark:bg-slate-800 mt-5 text-sm lg:text-base ${!newCategory ? 'border bg-gray-200 text-slate-900 cursor-default duration-300 ease-out' : 'text-white focus:shadow-outline focus:outline-none focus:ring-2 bg-slate-900 hover:bg-red-600 hover:text-slate-50 hover:transition duration-300 transform hover:scale-105 cursor-pointer'}`}
                                                onClick={() => { createNewCategory(newCategory, categories.length + 1, catFacultyID); }}
                                                disabled={!newCategory}
                                            >
                                                Add
                                            </button>
                                        </div>


                                        {facultyStudents.map((faculty, index) => {

                                            return (
                                                <div key={index} className="mt-5">
                                                    <p className="text-lg font-semibold">{faculty.attsName}</p>

                                                    {categories
                                                        .filter(cat => cat.category === faculty.attsCategory || (cat.category === 0 && (faculty.attsCategory === 1 || faculty.attsCategory === 2)))
                                                        .map(categories => (
                                                            <React.Fragment key={categories.id}>

                                                                <div className="w-1/2 mt-5">
                                                                    <div className=" flex items-center justify-between border-[1px] bg-slate-800 text-white py-2 px-4 mt-2 rounded-t-md">
                                                                        <p>{categories.name}</p>

                                                                        <button className="flex cursor-pointer text-white text-2xl mr-1"
                                                                            onClick={() => {
                                                                                setShowCreateOptionModal(true);
                                                                                setCategory(categories.name);
                                                                                openAddCourseModal(categories.id, index + 1);
                                                                            }}
                                                                        >
                                                                            <IoIosAddCircleOutline />
                                                                            <span className="text-base ml-1 mr-2">Add Course</span>
                                                                        </button>

                                                                    </div>

                                                                    <table className="w-full shadow-sm">
                                                                        <thead>
                                                                            <tr>
                                                                                <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-l-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4">
                                                                                    <p className={`${categories.subcategories.length > 0 ? 'ml-0' : 'ml-[155px]'}`}>Course</p>
                                                                                </th>
                                                                                <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-r-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-3/4">
                                                                                    <p className={`${categories.subcategories.length > 0 ? 'ml-0' : 'ml-[155px]'}`}>Action</p>
                                                                                </th>
                                                                            </tr>
                                                                        </thead>

                                                                        <tbody>
                                                                            {categories.subcategories
                                                                                .filter(subcategory => subcategory.facultyUnit === faculty.attsCategory || subcategory.facultyUnit === 3)
                                                                                .map(subcategory => (

                                                                                    subcategory.id === editOption && updateOption && !cancelOptionUpdate ? (
                                                                                        <tr key={index}>
                                                                                            <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-l-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4">
                                                                                                <input type="text"
                                                                                                    placeholder="Enter Courses..."
                                                                                                    className="border-2 ml-3 px-2 py-1 text-base w-full"
                                                                                                    value={editedFacultyName}
                                                                                                    onChange={e => setEditedFacultyName(e.target.value)} />
                                                                                            </td>
                                                                                            <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-r-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-3/4">
                                                                                                <div className="flex">
                                                                                                    <button
                                                                                                        className="border-[0.5px] rounded-md bg-slate-900 p-2 ml-28 text-white hover:bg-red-600"
                                                                                                        onClick={() => {
                                                                                                            if (editedFacultyName.length > 0) {
                                                                                                                handleUpdateFacultyName(subcategory.id, editedFacultyName);
                                                                                                            }
                                                                                                            setUpdateOption(false);
                                                                                                        }}>
                                                                                                        Update
                                                                                                    </button>
                                                                                                    <button
                                                                                                        className="border-[0.5px] rounded-md bg-slate-100 ml-4 px-3 py-2  hover:bg-slate-200"
                                                                                                        onClick={() => { setCancelOptionUpdate(true); }}>
                                                                                                        Cancel
                                                                                                    </button>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ) : (
                                                                                        <tr key={index}>
                                                                                            <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-l-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 tracking-wider text-center w-1/2">
                                                                                                {subcategory.name}
                                                                                            </td>
                                                                                            <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-r-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 tracking-wider text-center w-3/4">
                                                                                                <div className="flex ml-40">
                                                                                                    <button onClick={() => {
                                                                                                        handleEditOption(subcategory.id, subcategory.name);
                                                                                                    }}>
                                                                                                        <HiPencilAlt className="text-slate-700 hover:scale-105 mt-[3px] lg:mt-[1px] text-[14px] lg:text-base dark:text-dark_text2" />
                                                                                                    </button>
                                                                                                    <button onClick={() => openDeleteModal(subcategory.id, subcategory.name)}>
                                                                                                        <BsFillTrash3Fill className="text-slate-700 hover:scale-105 mt-[3px] lg:mt-[1px] ml-4 text-[14px] lg:text-base dark:text-dark_text2" />
                                                                                                    </button>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>)
                                                                                ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                            </React.Fragment>
                                                        ))}
                                                </div>
                                            );
                                        })}

                                    </Tab.Panel>
                                </Tab.Panels>
                            </Tab.Group>
                        </div>
                    </div>

                    <DeleteModal
                        isVisible={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}>
                        <div className="p-4 text-lg text-center">
                            <IoIosCloseCircleOutline className="m-auto text-8xl text-red-600" />
                            <p className="mt-6">Are you sure to delete <span className="font-bold">{deletingFaculty.name}</span>? This action cannot be undone.</p>

                            <div className="mt-12">
                                <button
                                    className="border-[0.5px] rounded-md bg-white px-6 py-2 font-semibold hover:bg-slate-100 duration-300 ease-in-out"
                                    onClick={() => setShowDeleteModal(false)}>Cancel</button>

                                <button
                                    className="border-2 rounded-md bg-red-600 ml-2 text-white px-6 py-2 font-semibold hover:bg-red-700 duration-300 ease-in-out"
                                    onClick={() => handleDeleteFacultyName(deletingFaculty.id)}>Delete</button>
                            </div>
                        </div>
                    </DeleteModal>

                    <AddFacultyUnitModal
                        isVisible={showCreateOptionModal}
                        onClose={() => setShowCreateOptionModal(false)}
                    >
                        <div className="p-8 text-[17px]">
                            <p className="font-semibold">Add New Course for <span className="font-bold">{category}</span></p>
                            <input type="text"
                                placeholder="Enter New Course..."
                                value={newFacultyName}
                                className="mt-10 border-[1px] text-base border-slate-200 rounded-sm w-full px-2 py-2"
                                onChange={e => setNewFacultyName(e.target.value)}
                            />

                            <div className="flex mt-16 float-right">
                                <button
                                    className="border-[0.5px] rounded-md bg-white px-4 py-3 font-semibold hover:bg-slate-100 duration-300 ease-in-out"
                                    onClick={() => setShowCreateOptionModal(false)}>Cancel</button>
                                <button
                                    className="border-2 rounded-md bg-red-600 ml-2 text-white px-4 py-3 font-semibold hover:bg-red-700 duration-300 ease-in-out"
                                    onClick={() => {
                                        createNewCourse(newFacultyName, newCourse.attsSubcategory, newCourse.attsFacultyUnit);
                                        setShowCreateOptionModal(false);
                                    }}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>

                    </AddFacultyUnitModal>
                </div>
            ) : (
                <div className="ml-[38px]">
                    <p className="text-slate-900 dark:text-dark_text text-sm lg:text-base">Change the options for the drop-down menu for students and staff in the attendance forms.</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceSettings;


