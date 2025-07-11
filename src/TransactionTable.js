import React, { useState, useEffect } from 'react';

const Transactions = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [suggestedCategory, setSuggestedCategory] = useState('');
    const [isCategorizing, setIsCategorizing] = useState(false);

    // DataTable features
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Update this URL to match your Flask server's port
                const response = await fetch('http://localhost:5000/api/entries');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                setData(result);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleButtonClick = async (entry) => {
        setSelectedTransaction(entry);
        setSuggestedCategory('');
        setShowAlert(true);
        setIsCategorizing(true);

        try {
            // Call the categorize API endpoint
            const response = await fetch('http://localhost:5000/api/categorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description: entry.description })
            });

            if (!response.ok) {
                throw new Error('Failed to categorize');
            }

            const result = await response.json();
            setSuggestedCategory(result.suggested_category);
        } catch (error) {
            console.error('Error categorizing transaction:', error);
            setSuggestedCategory('Error determining category');
        } finally {
            setIsCategorizing(false);
        }
    };

    // Sorting functionality
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter data based on search term
    const filteredData = data.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
            item.description?.toLowerCase().includes(searchLower) ||
            item.category?.toLowerCase().includes(searchLower) ||
            item.amount?.toString().includes(searchTerm) ||
            new Date(item.date).toLocaleDateString().includes(searchTerm)
        );
    });

    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = sortConfig.key === 'date' ? new Date(a[sortConfig.key]) : a[sortConfig.key];
        const bValue = sortConfig.key === 'date' ? new Date(b[sortConfig.key]) : b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentData = sortedData.slice(startIndex, endIndex);

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) {
            return <span className="text-gray-400 ml-1">↕</span>;
        }
        return sortConfig.direction === 'asc'
            ? <span className="text-blue-600 ml-1">↑</span>
            : <span className="text-blue-600 ml-1">↓</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                    <p className="mt-2 text-sm">Make sure your API endpoint is running and accessible.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Sample Data Table</h1>

                {/* Alert Pop-up */}
                {showAlert && selectedTransaction && (
                    <div className="fixed top-4 right-4 z-50">
                        <div className="bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="font-medium mb-2">{selectedTransaction.description}</div>
                                    <div className="text-sm">
                                        <div>Current Category: {selectedTransaction.category}</div>
                                        <div className="mt-2">
                                            AI Suggested Category: {
                                            isCategorizing ? (
                                                <span>Analyzing...</span>
                                            ) : (
                                                <span className="font-bold">{suggestedCategory}</span>
                                            )
                                        }
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAlert(false)}
                                    className="ml-4 text-white hover:text-gray-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg">
                    {/* Search and Controls */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value={5}>5 rows</option>
                                    <option value={10}>10 rows</option>
                                    <option value={25}>25 rows</option>
                                    <option value={50}>50 rows</option>
                                </select>
                            </div>
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('date')}
                                >
                                    Date <SortIcon column="date" />
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('description')}
                                >
                                    Description <SortIcon column="description" />
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('category')}
                                >
                                    Category <SortIcon column="category" />
                                </th>
                                <th
                                    className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('amount')}
                                >
                                    Amount <SortIcon column="amount" />
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {currentData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No data found
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((entry, index) => (
                                    <tr key={entry._id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(entry.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {entry.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {entry.category}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                            ${Number(entry.amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleButtonClick(entry)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200 text-sm"
                                            >
                                                Select
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1 text-sm font-medium rounded-lg ${
                                                currentPage === pageNum
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                    <>
                                        <span className="text-gray-400">...</span>
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            className="px-3 py-1 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
