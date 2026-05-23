// Razorpay client-side integration utility
// Make sure <script src="https://checkout.razorpay.com/v1/checkout.js"></script> is included in your index.html

// Define types for selected items
interface SelectedItem {
    id?: string;
    name: string;
    price: number;
    quantity?: number;
    size?: string;
    [key: string]: unknown;
}

// Define type for Supabase client
interface SupabaseClient {
    from: (table: string) => {
        insert: (data: unknown[]) => Promise<{ data: unknown; error: unknown }>;
    };
}

interface RazorpayPaymentParams {
    amount: number;
    user: { email: string };
    selectedItems: SelectedItem[];
    supabase: SupabaseClient;
}

export async function handleRazorpayPayment({ amount, user, selectedItems, supabase }: RazorpayPaymentParams) {
    return new Promise((resolve, reject) => {
        if (!window.Razorpay) {
            alert('Razorpay script not loaded.');
            return reject(new Error('Razorpay script not loaded.'));
        }
        const key = import.meta.env.VITE_RAZORPAY_KEY_ID?.trim();
        if (!key) {
            const error = new Error('Missing Razorpay key. Set VITE_RAZORPAY_KEY_ID in your deployment environment.');
            alert(error.message);
            return reject(error);
        }
        const options = {
            key,
            amount: amount * 100, // in paisa
            currency: 'INR',
            name: 'Pizza Delivery App',
            description: 'Pizza Order',
            handler: async function (response: { razorpay_payment_id: string }) {
                // Save order to Supabase
                const { data, error } = await supabase
                    .from('orders')
                    .insert([
                        {
                            user_email: user.email,
                            payment_id: response.razorpay_payment_id,
                            payment_method: 'Razorpay',
                            status: 'Confirmed',
                            items: selectedItems,
                            total: amount,
                            tracking_status: 'Order Received',
                        },
                    ]);
                if (error) {
                    alert('Order save failed!');
                    reject(error);
                } else {
                    alert('Payment Success and Order Saved!');
                    resolve(data);
                }
            },
            prefill: {
                email: user.email,
            },
            theme: {
                color: '#F37254',
            },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    });
}