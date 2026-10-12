import { useClerk } from '@clerk/expo';

import { Button } from '@/components/button';
import { PlaceholderScreen } from '@/components/screen';

export default function ProfileScreen() {
  const { signOut } = useClerk();

  return (
    <PlaceholderScreen
      title="Profile"
      description="Your name, grad year and account settings."
      ticket="ADTCIA-27">
      <Button label="Sign out" variant="secondary" onPress={() => signOut()} />
    </PlaceholderScreen>
  );
}
