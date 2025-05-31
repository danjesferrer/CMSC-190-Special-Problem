import ResetPassword from "@/components/Pages/ResetPassword";
import { type PromiseUIDTokenProps } from "@/types";

export default async function ResetPasswordPage({ params }: PromiseUIDTokenProps) {
  const { uid, token } = await params;

  return <ResetPassword uid={uid} token={token} />;
}
