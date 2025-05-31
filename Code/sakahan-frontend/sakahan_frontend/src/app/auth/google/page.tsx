import { Suspense } from "react";
import SocialAuthentication from "@/components/Pages/SocialAuthentication";

export default function SocialAuthenticationPage() {
  return (
    <Suspense>
      <SocialAuthentication />
    </Suspense>
  );
}
