import { redirect } from 'next/navigation';

export default function DashboardSubscriptionRedirect() {
  redirect('/dashboard/provider/subscription');
}

