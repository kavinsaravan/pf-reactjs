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
    Chip,
    Grid,
    Container,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InsightsIcon from '@mui/icons-material/Insights';
import AnalyticsIcon from '@mui/icons-material/Analytics';

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
            
            // Extract insights from the response
            const insights = responseData.insights;

            setInsights({
                query: query,
                timeWindow: null, // Time window not returned in current API
                transactionCount: 0, // Not available in the simplified response
                insights: insights
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

    const formatValue = (value) => {
        // Handle different types of values
        if (typeof value === 'number') {
            // Format as currency if it looks like money
            if (Math.abs(value) > 0.01) {
                return `$${value.toFixed(2)}`;
            }
            return value.toString();
        }

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        if (Array.isArray(value)) {
            return value.map((item, idx) => {
                if (typeof item === 'object') {
                    return Object.entries(item)
                        .map(([k, v]) => `${k}: ${formatValue(v)}`)
                        .join(', ');
                }
                return formatValue(item);
            }).join('\n• ');
        }

        if (typeof value === 'object' && value !== null) {
            // Format object as bullet points
            return Object.entries(value)
                .map(([k, v]) => {
                    const formattedKey = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return `• ${formattedKey}: ${formatValue(v)}`;
                })
                .join('\n');
        }

        return String(value);
    };

    const parseInsightsContent = (insightsData) => {
        if (typeof insightsData === 'string') {
            try {
                const parsed = JSON.parse(insightsData);
                return parsed;
            } catch {
                // If not JSON, return as is
                return insightsData;
            }
        }
        return insightsData;
    };

    const formatSectionTitle = (key) => {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace('Ai ', 'AI ')
            .replace('Api ', 'API ');
    };

    const renderInsightSection = (title, content, icon) => (
        <Card
            elevation={2}
            sx={{
                mb: 3,
                borderLeft: '4px solid',
                borderLeftColor: 'primary.main',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)',
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {icon}
                    <Typography
                        variant="h6"
                        sx={{
                            ml: 1,
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                <Typography
                    variant="body1"
                    sx={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.8,
                        color: 'text.primary',
                        fontSize: '1rem',
                        '& strong': { fontWeight: 600 }
                    }}
                >
                    {content}
                </Typography>
            </CardContent>
        </Card>
    );

    const renderInsights = (insightsData) => {
        const parsed = parseInsightsContent(insightsData);

        // If it's a simple string (narrative response), render it directly
        if (typeof parsed === 'string') {
            return renderInsightSection(
                'Financial Analysis',
                parsed,
                <InsightsIcon sx={{ color: '#667eea', fontSize: 28 }} />
            );
        }

        // If it's an object, format each field nicely
        if (typeof parsed === 'object' && parsed !== null) {
            return (
                <Box>
                    {Object.entries(parsed).map(([key, value], index) => {
                        const icons = [
                            <InsightsIcon key="insights" sx={{ color: '#667eea', fontSize: 28 }} />,
                            <TrendingUpIcon key="trending" sx={{ color: '#764ba2', fontSize: 28 }} />,
                            <AnalyticsIcon key="analytics" sx={{ color: '#ec4899', fontSize: 28 }} />
                        ];

                        // Format the content as readable text instead of JSON
                        const content = formatValue(value);

                        return renderInsightSection(
                            formatSectionTitle(key),
                            content,
                            icons[index % icons.length]
                        );
                    })}
                </Box>
            );
        }

        // Fallback
        return renderInsightSection(
            'Analysis',
            'No insights available',
            <InsightsIcon sx={{ color: '#667eea', fontSize: 28 }} />
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <AnalyticsIcon sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Financial Insights
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
                    Get AI-powered analysis of your spending patterns and financial trends
                </Typography>
            </Box>
            
            {/* Search Section */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mb: 4,
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #e8ebfc 100%)',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'rgba(102, 126, 234, 0.1)',
                }}
            >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <TextField
                        fullWidth
                        label="What would you like to know about your finances?"
                        placeholder="e.g., How much did I spend on groceries this month? What are my top spending categories?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        variant="outlined"
                        multiline
                        rows={3}
                        sx={{ 
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'white',
                                borderRadius: 2,
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                        sx={{
                            minWidth: '140px',
                            height: 'fit-content',
                            borderRadius: 2,
                            py: 2,
                            fontSize: '1rem',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {loading ? 'Analyzing...' : 'Get Insights'}
                    </Button>
                </Box>
                
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mt: 3,
                            borderRadius: 2,
                            '& .MuiAlert-message': { fontSize: '0.95rem' }
                        }}
                    >
                        {error}
                    </Alert>
                )}
            </Paper>

            {/* Results Section */}
            {insights && (
                <Box>
                    {/* Query Header */}
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 3, 
                            mb: 3, 
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <SearchIcon sx={{ mr: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                Analysis Results
                            </Typography>
                        </Box>
                        {insights.timeWindow && (
                            <Chip 
                                label={`${insights.timeWindow.start_date} to ${insights.timeWindow.end_date}`}
                                sx={{ 
                                    mt: 2, 
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    fontWeight: 500
                                }}
                            />
                        )}
                    </Paper>
                    
                    {/* Insights Content */}
                    <Box sx={{ mt: 3 }}>
                        {renderInsights(insights.insights)}
                    </Box>
                </Box>
            )}
        </Container>
    );
};

export default InsightsPanel;