import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DoubleRightArrow from '@/components/icons/DoubleRightArrow';
import DoubleLeftArrow from '@/components/icons/DoubleLeftArrow';
import RightArrow from '@/components/icons/RightArrow';
import LeftArrow from '@/components/icons/LeftArrow';

interface Commits {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        };
    };
}

const UpdateLogs: React.FC = () => {
    const [commits, setCommits] = useState<Commits[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageCount = Math.ceil(commits.length / itemsPerPage);

    useEffect(() => {
        const fetchCommits = async () => {
            try {
                const response = await axios.get<Commits[]>(
                    'https://api.github.com/repos/Pinkslushie/NEW_FYP_EMS/commits', {
                    headers: {
                        Authorization: `Bearer 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`,
                    },
                    params: {
                        per_page: 100,
                    },
                });

                setCommits(response.data);
            } catch (error) {
                console.error('Error fetching commits:', error);
            }
        };

        fetchCommits();
    }, []);

    const generatePageNumbers = (): number[] => {
        const displayedPages = 3;
        const halfDisplayed = Math.floor(displayedPages / 2);

        if (pageCount <= displayedPages) {
            return Array.from({ length: pageCount }, (_, index) => index + 1);
        }

        const start = Math.max(currentPage - halfDisplayed, 1);
        const end = Math.min(start + displayedPages - 1, pageCount);

        const pages: number[] = [];

        if (start > 1) {
            pages.push(1);
            if (start > 2) {
                pages.push(-1);
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < pageCount) {
            if (end < pageCount - 1) {
                pages.push(-1);
            }
            pages.push(pageCount);
        }

        return pages;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= Math.ceil(commits.length / itemsPerPage)) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="pl-5 pr-5 pt-4 pb-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card text-left w-1/2">
            <h1 className="font-bold text-[20px] dark:text-dark_text">Update Logs</h1>
            <div className="border-t border-gray-300 my-2"></div>
            <ul className="dark:text-dark_text">
                {commits
                    .slice(startIndex, endIndex)
                    .map((commit) => (
                        <li key={commit.sha}>
                            <p className="font-bold">
                                {new Date(commit.commit.author.date).toLocaleString()} by{' '}
                                {commit.commit.author.name}
                            </p>
                            <p>{commit.commit.message}</p>
                            <br />
                        </li>
                    ))}
            </ul>
            {/* Pagination for Desktop */}
            <div className="hidden lg:block">
                <div className="pagination flex justify-end items-end mt-5 pb-5">
                    <button
                        className="opacity-70 ml-2"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                    >
                        <DoubleLeftArrow />
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="opacity-70 ml-2 mr-2"
                    >
                        <LeftArrow />
                    </button>

                    {generatePageNumbers().map((pageNumber, index) => (
                        <button
                            key={index}
                            className={`py-1 px-3 lg:ml-1 lg:mr-1 ml-2 mr-2 rounded font-medium text-sm lg:text-[15px] ${currentPage === pageNumber ? "text-slate-100 bg-slate-900" : "text-slate-800 bg-slate-200"
                                }`}
                            onClick={() => handlePageChange(pageNumber)}
                        >
                            {pageNumber === -1 ? '...' : pageNumber}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pageCount}
                        className="opacity-70 ml-2 mr-2"
                    >
                        <RightArrow />
                    </button>
                    <button
                        className="opacity-70 mr-2"
                        onClick={() => handlePageChange(pageCount)}
                        disabled={currentPage === pageCount}
                    >
                        <DoubleRightArrow />
                    </button>
                </div>
            </div>
            {/* Pagination for Mobile */}
            <div className="block lg:hidden">
                <div className="pagination flex justify-center items-center mt-5 pb-5">
                    <button
                        className="opacity-70 ml-2"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                    >
                        <DoubleLeftArrow />
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="opacity-70 ml-2 mr-2"
                    >
                        <LeftArrow />
                    </button>

                    <button
                        className={`py-1 px-3 lg:ml-1 lg:mr-1 ml-2 mr-2 rounded font-medium text-sm lg:text-[15px] text-slate-100 bg-slate-900`}
                        onClick={() => handlePageChange(currentPage)}
                    >
                        {currentPage}/ {pageCount}
                    </button>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pageCount}
                        className="opacity-70 ml-2 mr-2"
                    >
                        <RightArrow />
                    </button>

                    <button
                        className="opacity-70 mr-2"
                        onClick={() => handlePageChange(pageCount)}
                        disabled={currentPage === pageCount}
                    >
                        <DoubleRightArrow />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateLogs;
