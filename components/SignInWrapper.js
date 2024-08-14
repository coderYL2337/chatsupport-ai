"use client";
import SignIn from './SignIn';
import  {useRouter} from 'next/navigation';

const SignInWrapper = () => {
  const router = useRouter();

  return <SignIn router={router} />;
};

export default SignInWrapper;
