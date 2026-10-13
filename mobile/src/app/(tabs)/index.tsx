import { useUser } from '@clerk/expo';

import { PlaceholderScreen } from '@/components/screen';

export default function HomeScreen() {
  const { user } = useUser();
  const greeting = user?.firstName ? `Hi, ${user.firstName}` : 'Hi there';

  return (
    <PlaceholderScreen
      title={greeting}
      description="Your orgs and your attendance progress in each one will show up here."
      ticket="ADTCIA-29"
    />
  );
}
