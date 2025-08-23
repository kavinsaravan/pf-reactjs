import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const InsightsPanel = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState(null);
    const [error, setError] = useState('');

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const handleSearch = async () => {
        if (!query.trim()) {
            setError('Please enter a search query');
            return;
        }

        setLoading(true);
        setError('');
        setInsights(null);

        try {
            console.log('Starting search with query:', query);
            console.log('API URL:', API_URL);

            // Single API call to get insights (Python handles all steps internally)
            const insightsResponse = await fetch(`${API_URL}/api/insights?query=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Insights response status:', insightsResponse.status);

            if (!insightsResponse.ok) {
                const errorText = await insightsResponse.text();
                console.error('Insights error:', errorText);
                throw new Error(`Failed to get insights: ${insightsResponse.status} ${errorText}`);
            }

            const responseData = await insightsResponse.json();
            console.log('Response data:', responseData);
            
            // Extract data from the response
            const { time_window } = responseData;
            const { start_date, end_date } = time_window;

            setInsights({
                query: responseData.query,
                timeWindow: { start_date, end_date },
                transactionCount: 0, // Not available in the simplified response
                insights: responseData
            });

        } catch (err) {
            console.error('Error getting insights:', err);
            
            // Provide more specific error messages
            if (err.message.includes('Failed to fetch')) {
                setError(`Cannot connect to server at ${API_URL}. Please check if the server is running.`);
            } else {
                setError(err.message || 'Failed to get insights');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const renderInsights = (insightsData) => {
        if (typeof insightsData === 'string') {
            return <Typography variant="body1">{insightsData}</Typography>;
        }

        if (typeof insightsData === 'object') {
            return (
                <Box>
                    {Object.entries(insightsData).map(([key, value]) => (
                        <Box key={key} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {key.replace(/_/g, ' ').toUpperCase()}:
                            </Typography>
                            <Typography variant="body2">
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            );
        }

        return <Typography variant="body1">{JSON.stringify(insightsData)}</Typography>;
    };

    return (
        <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Transaction Insights
            </Typography>
            
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <TextField
                        fullWidth
                        label="Ask about your transactions"
                        placeholder="e.g., Show me my spending on food last month"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        variant="outlined"
                        multiline
                        rows={2}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                        sx={{ minWidth: '120px', height: 'fit-content' }}
                    >
                        {loading ? 'Searching' : 'Search'}
                    </Button>
                </Box>
                
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Paper>

            {insights && (
                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                            Results for: "{insights.query}"
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Time Period: {insights.timeWindow.start_date} to {insights.timeWindow.end_date}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="h6" gutterBottom>
                            Insights
                        </Typography>
                        
                        <Box sx={{ 
                            backgroundColor: 'grey.50', 
                            p: 2, 
                            borderRadius: 1,
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }}>
                            {renderInsights(insights.insights)}
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default InsightsPanel;