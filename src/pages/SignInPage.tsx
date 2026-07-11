import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const SignInPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="w-full max-w-md space-y-4">
      <SignIn afterSignInUrl="/apply" afterSignUpUrl="/apply" signUpUrl="/signup" />
      <p className="text-center text-sm text-muted-foreground">
        <Link to="/" className="underline underline-offset-4">
          Back to home
        </Link>
      </p>
    </div>
  </div>
);

export default SignInPage;
