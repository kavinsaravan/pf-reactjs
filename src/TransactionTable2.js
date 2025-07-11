import React, { useState, useEffect } from 'react';

const Transactionsss = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');
    const [message, setMessage] = useState(null);
    const baseURL = 'http://127.0.0.1:5000';

    useEffect(() => {
        // Fetch data from your API endpoint that connects to MongoDB
        const fetchData = async () => {
            try {
                // Update this URL to match your Flask server's port
                /*const response = await fetch('http://127.0.0.1:7777/api/entries', {
                    method: 'GET',
                    credentials: 'same-origin'  // or 'same-origin' if appropriate
                });*/
                const response = await fetch(baseURL + '/api/entries', {
                    method: 'GET',
                });

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

    const oldhandleButtonClick = (description) => {
        setSelectedDescription(description);
        setShowAlert(true);
        // Auto-hide the alert after 3 seconds
        setTimeout(() => {
            setShowAlert(false);
        }, 3000);
    };

    const handleButtonClick = async (entry) => {
        setLoading(true);
        setError(null);
        setSelectedDescription(null);
        setShowAlert(false);


        try {
            const response = await fetch(baseURL + '/api/check_transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers like authorization if needed
                    // 'Authorization': 'Bearer your-token'
                },
                body: JSON.stringify({
                    category: entry.category,
                    description: entry.description,
                    amount: entry.amount
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Success:', data);
            setShowAlert(true);
            setSelectedDescription(JSON.stringify(data));
            // Handle success (update state, show message, etc.)

        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
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
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Sample Data Table</h1>

                {/* Alert Pop-up */}
                {showAlert && (
                    <div className="fixed top-4 right-4 z-50 animate-fade-in">
                        <div className="bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg">
                            <span className="font-medium">{selectedDescription}</span>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {data.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No data available
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {data.map((entry, index) => (
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
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transactionsss;
