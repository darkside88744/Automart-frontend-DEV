import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api';

// Replace with your actual Stripe Publishable Key
const stripePromise = loadStripe('pk_test_51SpK2EE5GxpJRwm9M3l1phKA2d86F4NjFMxzExgrQb9w9s2L6r6U2zzoAiIgci2JWulXTcp5O9m2xyrRAt2y6Jgz00adiwk3CM');

const PaymentForm = ({ bookingId, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [bookingAmount, setBookingAmount] = useState(null);

    // Fetch the booking details to show the amount to the user
    useEffect(() => {
        const fetchAmount = async () => {
            try {
                const { data } = await api.get(`/bookings/${bookingId}/`);
                // Use final_amount if admin has set it, otherwise total_amount
                setBookingAmount(data.final_amount || data.total_amount);
            } catch (err) {
                console.error("Error fetching booking amount:", err);
            }
        };
        fetchAmount();
    }, [bookingId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setErrorMessage(null);

        try {
            // 1. Create Payment Intent on Django Backend
            const { data } = await api.post(`/bookings/${bookingId}/create_payment_intent/`);
            const clientSecret = data.clientSecret;

            // 2. Confirm Payment on the Frontend
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        // Optional: Pass the authenticated user's email/name if available
                        name: 'Customer', 
                    },
                },
            });

            if (result.error) {
                setErrorMessage(result.error.message);
                setLoading(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // 3. Verify Payment with Backend to update status to 'PAID'
                    const verifyRes = await api.post(`/bookings/${bookingId}/verify_payment/`, {
                        payment_intent_id: result.paymentIntent.id,
                    });

                    if (verifyRes.data.status === 'Payment Verified') {
                        onSuccess();
                    }
                }
            }
        } catch (err) {
            console.error("Stripe Error:", err);
            // Check if backend returned a specific error (like "Amount not set")
            const msg = err.response?.data?.error || "Payment failed to initialize.";
            setErrorMessage(msg);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto w-full">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Complete Payment</h2>
            <p className="text-gray-600 mb-6">
                Total Amount: <span className="font-bold text-blue-600">₹{bookingAmount || '...'}</span>
            </p>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
                <div className="p-4 border border-gray-300 rounded-md bg-white shadow-sm">
                    <CardElement options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#32325d',
                                fontSmoothing: 'antialiased',
                                '::placeholder': { color: '#aab7c4' },
                            },
                            invalid: { color: '#fa755a', iconColor: '#fa755a' },
                        },
                    }} />
                </div>
            </div>

            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
                    <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={!stripe || loading || !bookingAmount}
                    className="flex-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                    {loading ? "Processing..." : `Pay ₹${bookingAmount || ''}`}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
            </div>
            <p className="mt-4 text-xs text-center text-gray-400">
                Secure payment powered by Stripe
            </p>
        </form>
    );
};

// Main Export that provides the Stripe Context
const Checkout = ({ bookingId, onSuccess, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <Elements stripe={stripePromise}>
                <PaymentForm 
                    bookingId={bookingId} 
                    onSuccess={onSuccess} 
                    onCancel={onCancel} 
                />
            </Elements>
        </div>
    );
};

export default Checkout;