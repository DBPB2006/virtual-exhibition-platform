import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { useSelector } from 'react-redux';

// Renders a table of sales history, detailing transaction dates, associated exhibitions, buyers, and payment statuses
const SalesOverview = () => {
    const { user } = useSelector((state) => state.auth);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await api.get('/api/exhibitor/sales');
                setSales(response.data);
            } catch (err) {
                setError('Failed to load sales data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchSales();
        }
    }, [user]);

    if (loading) return <div>Loading sales data...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Sales Overview</h1>

            {sales.length === 0 ? (
                <p className="text-gray-500">No sales recorded yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exhibition</th>
                                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sales.map((sale) => (
                                <tr key={sale._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(sale.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {sale.exhibitionId?.title || 'Unknown Exhibition'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{sale.userId?.name || 'Unknown User'}</div>
                                        <div className="text-xs text-gray-400">{sale.userId?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {sale.currency === 'INR' ? '₹' : sale.currency} {sale.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sale.status === 'paid' ? 'bg-green-100 text-green-800' :
                                            sale.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SalesOverview;
