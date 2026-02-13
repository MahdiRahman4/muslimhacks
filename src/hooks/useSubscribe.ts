import { useState } from 'react';
import { toast } from 'sonner';
import { SUBSCRIBE_ENDPOINT } from '@/lib/api';

export function useSubscribe() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(SUBSCRIBE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to subscribe');
        setIsSubmitting(false);
        return;
      }

      setEmail('');
      toast.success(
        "Jazakallah khair! We'll be in touch soon. Check your inbox for an email if you dont see it, check your spam folder."
      );
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { email, setEmail, isSubmitting, handleSubmit };
}
