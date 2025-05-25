declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "*.svg?url" {
  const content: string;
  export default content;
}

declare module "*.svg?component" {
  import React = require("react");
  const component: React.FC<React.SVGProps<SVGSVGElement>>;
  export default component;
}