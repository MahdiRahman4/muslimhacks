import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const SignUpPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="w-full max-w-md space-y-4">
      <SignUp afterSignUpUrl="/apply" afterSignInUrl="/apply" signInUrl="/signin" />
      <p className="text-center text-sm text-muted-foreground">
        <Link to="/" className="underline underline-offset-4">
          Back to home
        </Link>
      </p>
    </div>
  </div>
);

export default SignUpPage;
