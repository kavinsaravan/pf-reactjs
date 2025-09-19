import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Paper,
    TablePagination,
    IconButton,
    Snackbar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SortIcon from '@mui/icons-material/Sort';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const Transactions = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [suggestedCategory, setSuggestedCategory] = useState('');
    const [isCategorizing, setIsCategorizing] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [showUploadMessage, setShowUploadMessage] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const fetchData = async () => {
        try {
            console.log('Fetching transactions from:', `${API_URL}/api/entries`);
            const response = await fetch(`${API_URL}/api/entries`);
            console.log('Transaction response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Transaction fetch error:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            const result = await response.json();
            console.log('Transaction data received:', result);
            console.log('Number of transactions:', result.length);
            
            setData(result);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleButtonClick = async (entry) => {
        setSelectedTransaction(entry);
        setSuggestedCategory('');
        setShowAlert(true);
        setIsCategorizing(true);
        try {
            const response = await fetch(`${API_URL}/api/categorize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ merchant: entry.merchant }),
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

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const parseCSV = (csvText) => {
        console.log('Raw CSV text:', csvText.substring(0, 500)); // Log first 500 chars for debugging
        
        const lines = csvText.trim().split('\n').filter(line => line.trim().length > 0);
        console.log('Number of lines:', lines.length);
        
        if (lines.length < 2) {
            console.log('Not enough lines in CSV');
            return [];
        }
        
        // Handle both comma and semicolon separators
        const separator = lines[0].includes(';') ? ';' : ',';
        console.log('Using separator:', separator);
        
        const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, '').replace(/'/g, ''));
        console.log('Headers found:', headers);
        
        const transactions = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines
            
            const values = lines[i].split(separator).map(v => v.trim().replace(/"/g, '').replace(/'/g, ''));
            console.log(`Line ${i} values:`, values);
            
            if (values.length >= headers.length - 1) { // Allow for slight length differences
                const transaction = {};
                headers.forEach((header, index) => {
                    if (index < values.length) {
                        const lowerHeader = header.toLowerCase();
                        const value = values[index];
                        
                        if (lowerHeader.includes('date') || lowerHeader.includes('transaction date') || lowerHeader.includes('posted date')) {
                            transaction.date = value;
                        } else if (lowerHeader.includes('merchant') || lowerHeader.includes('description') || lowerHeader.includes('payee') || lowerHeader.includes('memo') || lowerHeader.includes('details')) {
                            transaction.merchant = value;
                        } else if (lowerHeader.includes('amount') || lowerHeader.includes('value') || lowerHeader.includes('debit') || lowerHeader.includes('credit')) {
                            // Handle negative amounts in parentheses or with minus sign
                            let amountStr = value.replace(/[^-0-9.()]/g, '');
                            if (amountStr.includes('(') && amountStr.includes(')')) {
                                amountStr = '-' + amountStr.replace(/[()]/g, '');
                            }
                            const amount = parseFloat(amountStr);
                            if (!isNaN(amount)) {
                                transaction.amount = amount;
                            }
                        } else if (lowerHeader.includes('category') || lowerHeader.includes('type')) {
                            transaction.category = value;
                        }
                    }
                });
                
                console.log('Parsed transaction:', transaction);
                
                // More flexible validation - at least date and either merchant or amount
                if (transaction.date && (transaction.merchant || transaction.amount !== undefined)) {
                    if (!transaction.merchant) {
                        transaction.merchant = 'Unknown Merchant';
                    }
                    if (transaction.amount === undefined) {
                        transaction.amount = 0;
                    }
                    if (!transaction.category) {
                        transaction.category = 'Uncategorized';
                    }
                    transactions.push(transaction);
                    console.log('Transaction added to list');
                } else {
                    console.log('Transaction validation failed:', {
                        hasDate: !!transaction.date,
                        hasMerchant: !!transaction.merchant,
                        hasAmount: transaction.amount !== undefined
                    });
                }
            } else {
                console.log(`Line ${i} has ${values.length} values, expected ${headers.length}`);
            }
        }
        
        console.log('Total transactions parsed:', transactions.length);
        return transactions;
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            setUploadMessage('Please select a CSV file');
            setShowUploadMessage(true);
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const csvText = e.target.result;
                const newTransactions = parseCSV(csvText);
                
                if (newTransactions.length === 0) {
                    setUploadMessage('No valid transactions found in CSV file');
                    setShowUploadMessage(true);
                } else {
                    // Send transactions to API
                    try {
                        const response = await fetch(`${API_URL}/api/uploadcsv`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(newTransactions),
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok) {
                            // Refresh all transactions from database
                            await fetchData();
                            setUploadMessage(`Successfully uploaded ${result.inserted_count} transactions to database`);
                            setShowUploadMessage(true);
                        } else {
                            console.error('API error:', result);
                            setUploadMessage(`API Error: ${result.error}`);
                            setShowUploadMessage(true);
                        }
                    } catch (apiError) {
                        console.error('Error calling API:', apiError);
                        // Fallback to local-only storage
                        setData(prevData => [...prevData, ...newTransactions]);
                        setUploadMessage(`Parsed ${newTransactions.length} transactions locally (API unavailable)`);
                        setShowUploadMessage(true);
                    }
                }
            } catch (error) {
                console.error('Error parsing CSV:', error);
                setUploadMessage('Error parsing CSV file');
                setShowUploadMessage(true);
            } finally {
                setUploading(false);
                event.target.value = '';
            }
        };

        reader.onerror = () => {
            setUploadMessage('Error reading file');
            setShowUploadMessage(true);
            setUploading(false);
            event.target.value = '';
        };

        reader.readAsText(file);
    };

    const filteredData = data.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            item.merchant?.toLowerCase().includes(searchLower) ||
            item.category?.toLowerCase().includes(searchLower) ||
            item.amount?.toString().includes(searchTerm) ||
            new Date(item.date).toLocaleDateString().includes(searchTerm)
        );
    });

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aValue = sortConfig.key === 'date' ? new Date(a[sortConfig.key]) : a[sortConfig.key];
        const bValue = sortConfig.key === 'date' ? new Date(b[sortConfig.key]) : b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    const SortIconComponent = ({ column }) => {
        if (sortConfig.key !== column) {
            return <SortIcon sx={{ color: 'grey.500', ml: 1 }} />;
        }
        return sortConfig.direction === 'asc' ? (
            <ArrowUpwardIcon sx={{ color: 'primary.main', ml: 1 }} />
        ) : (
            <ArrowDownwardIcon sx={{ color: 'primary.main', ml: 1 }} />
        );
    };

    const columns = [
        {
            field: 'date',
            headerName: 'Date',
            width: 150,
            renderHeader: () => (
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('date')}>
                    <Typography variant="subtitle2">Date</Typography>
                    <SortIconComponent column="date" />
                </Box>
            ),
            renderCell: (params) => new Date(params.value).toLocaleDateString(),
        },
        {
            field: 'merchant',
            headerName: 'Merchant',
            flex: 1,
            minWidth: 200,
            renderHeader: () => (
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('merchant')}>
                    <Typography variant="subtitle2">Merchant</Typography>
                    <SortIconComponent column="merchant" />
                </Box>
            ),
        },
        {
            field: 'category',
            headerName: 'Category',
            width: 150,
            renderHeader: () => (
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('category')}>
                    <Typography variant="subtitle2">Category</Typography>
                    <SortIconComponent column="category" />
                </Box>
            ),
            renderCell: (params) => (
                <Typography variant="body2">{params.value}</Typography>
            ),
        },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 150,
            type: 'number',
            renderHeader: () => (
                <Box
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'flex-end' }}
                    onClick={() => handleSort('amount')}
                >
                    <Typography variant="subtitle2">Amount</Typography>
                    <SortIconComponent column="amount" />
                </Box>
            ),
            renderCell: (params) => `$${Number(params.value).toFixed(2)}`,
            align: 'right',
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleButtonClick(params.row)}
                    sx={{ textTransform: 'none' }}
                >
                    Analyze
                </Button>
            ),
            align: 'center',
        },
    ];

    const rows = sortedData.map((entry, index) => ({
        id: entry._id || index,
        date: entry.date,
        merchant: entry.merchant,
        category: entry.category,
        amount: entry.amount,
    }));

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading data...</Typography>
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                <Alert severity="error" sx={{ maxWidth: '400px' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Error!
                    </Typography>
                    <Typography>{error}</Typography>
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        Make sure your API endpoint is running and accessible.
                    </Typography>
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
            <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 2, width: '100%' }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Financial Transaction Categorizer
                </Typography>

                <Dialog open={showAlert} onClose={() => setShowAlert(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {selectedTransaction?.merchant}
                        <IconButton
                            aria-label="close"
                            onClick={() => setShowAlert(false)}
                            sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" gutterBottom>
                            Current Category: {selectedTransaction?.category}
                        </Typography>
                        <Typography variant="body2">
                            AI Suggested Category:{' '}
                            {isCategorizing ? (
                                <span>Analyzing...</span>
                            ) : (
                                <Typography component="span" fontWeight="bold">
                                    {suggestedCategory}
                                </Typography>
                            )}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowAlert(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

                <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: '300px', flexWrap: 'wrap' }}>
                            <TextField
                                label="Search"
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{ minWidth: '200px' }}
                            />
                            <FormControl size="small" sx={{ minWidth: '120px' }}>
                                <InputLabel>Rows per page</InputLabel>
                                <Select
                                    value={rowsPerPage}
                                    label="Rows per page"
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(0);
                                    }}
                                >
                                    <MenuItem value={5}>5 rows</MenuItem>
                                    <MenuItem value={10}>10 rows</MenuItem>
                                    <MenuItem value={25}>25 rows</MenuItem>
                                    <MenuItem value={50}>50 rows</MenuItem>
                                </Select>
                            </FormControl>
                            <Box sx={{ position: 'relative' }}>
                                <input
                                    accept=".csv"
                                    id="csv-upload-input"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <label htmlFor="csv-upload-input">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<UploadFileIcon />}
                                        disabled={uploading}
                                        size="small"
                                        sx={{ textTransform: 'none' }}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload CSV'}
                                    </Button>
                                </label>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Showing {currentPage * rowsPerPage + 1} to {Math.min((currentPage + 1) * rowsPerPage, sortedData.length)} of{' '}
                            {sortedData.length} entries
                        </Typography>
                    </Box>
                </Paper>

                <Paper elevation={3} sx={{ width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={rowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        page={currentPage}
                        onPageChange={(newPage) => setCurrentPage(newPage)}
                        rowCount={sortedData.length}
                        autoHeight
                        disableSelectionOnClick
                        sx={{
                            '& .MuiDataGrid-cell': { py: 1 },
                            '& .MuiDataGrid-columnHeader': { bgcolor: 'grey.100' },
                            '& .MuiDataGrid-row:hover': { bgcolor: 'grey.50' },
                            width: '100%',
                        }}
                    />
                    <TablePagination
                        component="div"
                        count={sortedData.length}
                        page={currentPage}
                        onPageChange={(event, newPage) => setCurrentPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setCurrentPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        labelRowsPerPage="Rows per page:"
                        sx={{ borderTop: '1px solid', borderColor: 'grey.200', width: '100%' }}
                    />
                </Paper>

                <Snackbar
                    open={showUploadMessage}
                    autoHideDuration={4000}
                    onClose={() => setShowUploadMessage(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setShowUploadMessage(false)}
                        severity={uploadMessage.includes('Successfully') ? 'success' : 'error'}
                        sx={{ width: '100%' }}
                    >
                        {uploadMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default Transactions;
