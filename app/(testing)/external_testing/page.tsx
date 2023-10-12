import React from 'react'

export default function page() {
    return (
        <div className="p-10">
            <p className="text-[15px] text-slate-800 font-medium ml-[1px] mt-8">Source of Fund <br></br><span className="text-slate-800 text-sm font-normal">Details of account(s) to be debited. (It is encouraged to have a single source of funding)</span>.
            </p>

            <div className="grid grid-cols-2 gap-5 mt-4">
                <div>
                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Name
                    </p>

                    <div>
                        <input
                            type="text"
                            id="name"
                            placeholder="Amount (RM)"
                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                        />
                    </div>
                </div>

                <div>
                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Consolidated Pool Fund
                    </p>

                    <div>
                        <input
                            type="number"
                            id="consolidated_pool_fund"
                            placeholder="Amount (RM)"
                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                        />
                    </div>
                </div>
            </div>

            <fieldset disabled>
                <div className="mt-5 cursor-not-allowed">
                    <p className="text-sm text-slate-800 font-medium">Any Expenditure Cap?
                    </p>
                    <div className="mt-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="expenditure_cap"
                                value="yes"
                                className="form-checkbox h-4 w-4 text-slate-800 cursor-not-allowed"
                            />
                            <span className="text-slate-800 text-[15px]">Yes</span>
                        </label>
                    </div>
                    <div className="mt-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="expenditure_cap"
                                value="no"
                                className="form-checkbox h-4 w-4 text-slate-800 cursor-not-allowed"
                            />
                            <span className="text-slate-800 text-[15px]">No</span>
                        </label>
                    </div>

                    <div className="mt-5 cursor-not-allowed">
                        <p className="text-sm text-slate-800 font-medium ml-[1px]">Capped Amount
                        </p>

                        <div>
                            <input
                                type="number"
                                id="capped_amount"
                                placeholder="Amount (RM)"
                                className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-5">
                <div>
                    <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">HOS Email
                    </p>
                    <div>
                        <select
                            id="hos"
                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[6px]  hover:bg-slate-100 text-slate-800"
                        >
                            <option value="" className="text-slate-800">Please select an option</option>
                            <option value="aeroplane" className="text-slate-800">testing@gmail.com</option>
                        </select>
                    </div>
                </div>

                <div>
                    <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Dean Email
                    </p>
                    <div>
                        <select
                            id="dean"
                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[10px]  hover:bg-slate-100 text-slate-800"
                        >
                            <option value="" className="text-slate-800">Choose an item</option>
                            <option value="alone" className="text-slate-800">testing@gmail.com</option>
                        </select>
                    </div>
                </div>
            </div>

            <button className="rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 p-4 w-[120px] mt-5">
                Submit
            </button>

        </div>

    )
}
