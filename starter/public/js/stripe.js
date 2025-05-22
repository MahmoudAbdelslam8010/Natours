/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
import { loadStripe } from '@stripe/stripe-js';
export const bookTour = async tourId => {
    const stripePromise = loadStripe('pk_test_51RPx8KJvfTvDzjh2E2obeH8O2lso7qHmUKx7YAeljFzmn08MlLE3KOhHEz9ee6NLRYXc3Uuy13ZkYr55kUlmy1QS00y5ckGVKk');
    try {
        // 1) Get checkout session from API
        const session = await axios(
        `/api/v1/bookings/checkout/${tourId}`
        );
        console.log(session);
        const stripe = await stripePromise;
        // 2) Create checkout form + chanre credit card
        await stripe.redirectToCheckout({
        sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
