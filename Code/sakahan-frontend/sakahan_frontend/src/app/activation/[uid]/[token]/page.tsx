import Activation from "@/components/Pages/Activation";
import { type PromiseUIDTokenProps } from "@/types";

export default async function ActivationPage({ params }: PromiseUIDTokenProps) {
  const { uid, token } = await params;

  return <Activation uid={uid} token={token} />;
}
