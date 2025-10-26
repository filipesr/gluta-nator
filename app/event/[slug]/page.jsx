import EventDashboard from '@/components/EventDashboard';

export function generateMetadata({ params }) {
  const slug = decodeURIComponent(params.slug);
  return {
    title: `${slug} · Gluta-nator`,
    description: 'Acompanhe o ranking em tempo real deste evento.'
  };
}

export default function EventPage({ params }) {
  const slug = decodeURIComponent(params.slug);
  return <EventDashboard slug={slug} />;
}
