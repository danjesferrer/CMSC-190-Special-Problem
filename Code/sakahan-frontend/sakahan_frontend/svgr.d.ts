declare module "*.svg" {
  import { SVGProps } from "react";
  const content: React.FC<SVGProps<SVGElement>>;
  export default content;
}

declare module "*.svg?url" {
  import { StaticImageData } from "next/image";

  const content: StaticImageData;
  export default content;
}
